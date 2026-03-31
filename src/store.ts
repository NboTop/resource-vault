import { useState, useEffect, useRef } from 'react';
import { AppState, Resource } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch } from 'firebase/firestore';

const STORAGE_KEY = 'resourcevault_data';

const SAMPLE_DATA: Resource[] = [
  { id: '1', title: "Harvard Resume Template", url: "https://hwpi.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf", category: "📄 Resume & Career", priority: "High", source: "📸 Instagram", tags: ["free", "template"], notes: "", status: "Saved", createdAt: Date.now() - 100000 },
  { id: '2', title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", category: "💻 Development & Code", priority: "High", source: "🔴 Reddit", tags: ["github", "interview-prep", "free"], notes: "", status: "Saved", createdAt: Date.now() - 200000 },
  { id: '3', title: "Vercel Free Hosting", url: "https://vercel.com", category: "🚀 Deployment & Hosting", priority: "Medium", source: "▶️ YouTube", tags: ["free", "deploy", "nextjs"], notes: "", status: "Saved", createdAt: Date.now() - 300000 },
  { id: '4', title: "Google UX Design Certificate", url: "https://www.coursera.org/google-certificates/ux-design-certificate", category: "📜 Certificates & Courses", priority: "High", source: "📸 Instagram", tags: ["google", "ux", "certificate"], notes: "", status: "Saved", createdAt: Date.now() - 400000 },
  { id: '5', title: "Runway ML AI Video", url: "https://runwayml.com", category: "🛠️ AI Tools", priority: "Medium", source: "🐦 Twitter/X", tags: ["ai", "video", "creative"], notes: "", status: "Saved", createdAt: Date.now() - 500000 },
  { id: '6', title: "Coolors Palette Generator", url: "https://coolors.co", category: "🎨 UI/UX & Design", priority: "Low", source: "🐦 Twitter/X", tags: ["free", "design"], notes: "", status: "Saved", createdAt: Date.now() - 600000 },
  { id: '7', title: "Cold Email for Internships", url: null, category: "📧 Templates & Outreach", priority: "High", source: "💼 LinkedIn", tags: ["internship", "template"], notes: "Saw this formula: Problem → Solution → Ask. Keep under 100 words.", status: "Saved", createdAt: Date.now() - 700000 },
  { id: '8', title: "fast.ai Free ML Course", url: "https://www.fast.ai", category: "🤖 AI/ML Learning", priority: "High", source: "🔴 Reddit", tags: ["free", "beginner"], notes: "", status: "Saved", createdAt: Date.now() - 800000 },
  { id: '9', title: "MLH Hackathon Season", url: "https://mlh.io/seasons/2025/events", category: "🏆 Hackathons & Competitions", priority: "Medium", source: "📸 Instagram", tags: ["hackathon", "student", "free"], notes: "", status: "Saved", createdAt: Date.now() - 900000 },
  { id: '10', title: "UGC Portfolio Guide", url: null, category: "📱 Content Creation", priority: "Medium", source: "📸 Instagram", tags: ["ugc", "beginner"], notes: "Step 1: Pick a niche. Step 2: Create 3 spec ads. Step 3: Cold pitch brands.", status: "Saved", createdAt: Date.now() - 1000000 },
];

const DEFAULT_STATE: AppState = {
  resources: SAMPLE_DATA,
  theme: 'dark',
  geminiApiKey: '',
  defaultCategory: '⭐ Uncategorized'
};

export function useAppStore() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_STATE, ...parsed };
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
    return DEFAULT_STATE;
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Sync local resources to Firebase on login if they exist
        // Exclude sample data from being synced to the user's account
        const sampleIds = new Set(SAMPLE_DATA.map(r => r.id));
        const localResources = stateRef.current.resources.filter(r => !sampleIds.has(r.id));
        
        if (localResources.length > 0) {
          try {
            const batch = writeBatch(db);
            localResources.forEach(res => {
              const docRef = doc(db, `users/${currentUser.uid}/resources`, res.id);
              batch.set(docRef, { ...res, userId: currentUser.uid }, { merge: true });
            });
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}/resources`);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []); // Run once on mount

  // Handle Firestore Sync
  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      const q = query(collection(db, `users/${user.uid}/resources`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const resources: Resource[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Remove userId from local state to match Resource type, or just cast it
          resources.push(data as Resource);
        });
        
        // Sort by createdAt descending
        resources.sort((a, b) => b.createdAt - a.createdAt);
        
        setState(s => ({ ...s, resources }));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/resources`);
      });
      
      return () => unsubscribe();
    }
  }, [user, isAuthReady]);

  // Handle Theme and Local Storage for non-resource settings
  useEffect(() => {
    // We still save to local storage so settings persist, and resources persist offline if not logged in
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const addResource = async (resource: Resource) => {
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/resources`, resource.id), {
          ...resource,
          userId: user.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/resources/${resource.id}`);
        throw error;
      }
    } else {
      setState(s => ({ ...s, resources: [resource, ...s.resources] }));
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/resources`, id), updates, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/resources/${id}`);
        throw error;
      }
    } else {
      setState(s => ({
        ...s,
        resources: s.resources.map(r => r.id === id ? { ...r, ...updates } : r)
      }));
    }
  };

  const deleteResource = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/resources`, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/resources/${id}`);
        throw error;
      }
    } else {
      setState(s => ({
        ...s,
        resources: s.resources.filter(r => r.id !== id)
      }));
    }
  };

  const updateSettings = (updates: Partial<AppState>) => {
    setState(s => ({ ...s, ...updates }));
  };

  const clearAll = async () => {
    if (user) {
      try {
        const batch = writeBatch(db);
        state.resources.forEach(res => {
          const docRef = doc(db, `users/${user.uid}/resources`, res.id);
          batch.delete(docRef);
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/resources`);
      }
    } else {
      setState(s => ({ ...s, resources: [] }));
    }
  };

  const importData = async (data: any) => {
    if (data && Array.isArray(data.resources)) {
      if (user) {
        try {
          const batch = writeBatch(db);
          data.resources.forEach((res: Resource) => {
            const docRef = doc(db, `users/${user.uid}/resources`, res.id);
            batch.set(docRef, { ...res, userId: user.uid }, { merge: true });
          });
          await batch.commit();
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/resources`);
          return false;
        }
      } else {
        setState(s => ({ ...s, resources: data.resources }));
      }
      return true;
    }
    return false;
  };

  const clearLocalResources = () => {
    setState(s => ({ ...s, resources: SAMPLE_DATA }));
  };

  return {
    state,
    user,
    addResource,
    updateResource,
    deleteResource,
    updateSettings,
    clearAll,
    importData,
    clearLocalResources
  };
}
