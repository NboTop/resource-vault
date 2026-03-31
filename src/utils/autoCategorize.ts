import { Resource, Priority } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

export const CATEGORIES: Record<string, string[]> = {
  "📄 Resume & Career": ["resume", "cv", "cover letter", "job application", "career tips", "interview prep", "salary negotiation"],
  "💼 Jobs & Opportunities": ["job posting", "hiring", "vacancy", "openings", "internship", "we're hiring", "apply now", "job alert"],
  "🏆 Hackathons & Competitions": ["hackathon", "datathon", "buildathon", "coding competition", "devpost", "mlh"],
  "🤖 AI/ML Learning": ["machine learning", "deep learning", "neural network", "tensorflow", "pytorch", "nlp", "computer vision", "llm", "fine-tuning", "transformer", "ai basics", "learn ai", "ai course"],
  "🛠️ AI Tools": ["chatgpt", "midjourney", "runway", "claude", "gemini", "copilot", "ai tool", "gpt", "stable diffusion", "ai app", "huggingface"],
  "🎨 UI/UX & Design": ["ui", "ux", "design", "figma", "dribbble", "behance", "color palette", "typography", "wireframe", "prototype", "coolors", "canva"],
  "💻 Development & Code": ["system design", "data structures", "algorithm", "leetcode", "github repo", "api", "backend", "frontend", "react", "python", "javascript", "coding", "programming", "developer", "open source"],
  "🚀 Deployment & Hosting": ["deploy", "hosting", "vercel", "netlify", "railway", "render", "heroku", "aws free", "firebase", "free hosting", "ci/cd"],
  "📜 Certificates & Courses": ["certificate", "certification", "coursera", "udemy", "edx", "google certificate", "meta certificate", "free course", "online course"],
  "📧 Templates & Outreach": ["cold email", "email template", "outreach", "pitch", "proposal template", "follow-up template", "dm template"],
  "📱 Content Creation": ["ugc", "content creation", "reels", "viral", "social media tips", "grow followers", "personal brand", "creator economy"],
  "🌐 Useful Websites": ["free website", "online tool", "productivity", "notion template", "bookmark", "resource list"]
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES).concat(["⭐ Uncategorized"]);

const COMMON_TAGS = ["free", "beginner", "advanced", "tutorial", "template", "github", "python", "ai", "no-code", "open-source", "interview-prep", "design", "video", "creative", "student", "nextjs", "ux", "google"];

const HIGH_PRIORITY_KEYWORDS = ["urgent", "deadline", "apply before", "limited time", "closing soon", "don't miss"];

const SOURCES: Record<string, string> = {
  "instagram.com": "📸 Instagram",
  "linkedin.com": "💼 LinkedIn",
  "twitter.com": "🐦 Twitter/X",
  "x.com": "🐦 Twitter/X",
  "youtube.com": "▶️ YouTube",
  "youtu.be": "▶️ YouTube",
  "reddit.com": "🔴 Reddit",
  "github.com": "🐙 GitHub",
  "medium.com": "✍️ Medium",
  "coursera.org": "🎓 Coursera",
  "udemy.com": "🎓 Udemy"
};

export function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
}

export function detectSource(url: string | null): string {
  if (!url) return "📝 Manual Note";
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    for (const [domain, source] of Object.entries(SOURCES)) {
      if (hostname.includes(domain)) return source;
    }
    return "🌐 Web";
  } catch {
    return "🌐 Web";
  }
}

export function generateTitle(text: string, url: string | null): string {
  if (url) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname.split('/').pop() || urlObj.hostname;
      path = path.replace(/[-_]/g, ' ').replace(/\.html|\.php/g, '');
      if (path.length < 3) path = urlObj.hostname;
      return path.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').substring(0, 60);
    } catch {
      // fallback
    }
  }
  const cleanText = text.replace(/(https?:\/\/[^\s]+)/g, '').trim();
  if (cleanText) {
    return cleanText.substring(0, 60) + (cleanText.length > 60 ? '...' : '');
  }
  return "Untitled Resource";
}

export function autoCategorize(text: string): string {
  const lowerText = text.toLowerCase();
  let bestCategory = "⭐ Uncategorized";
  let maxHits = 0;

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    let hits = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        hits++;
      }
    }
    if (hits > maxHits) {
      maxHits = hits;
      bestCategory = category;
    }
  }
  return bestCategory;
}

export function extractTags(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundTags = COMMON_TAGS.filter(tag => lowerText.includes(tag));
  return foundTags.slice(0, 5);
}

export function detectPriority(text: string): Priority {
  const lowerText = text.toLowerCase();
  for (const keyword of HIGH_PRIORITY_KEYWORDS) {
    if (lowerText.includes(keyword)) return 'High';
  }
  return 'Medium';
}

export function processInput(text: string, defaultCategory: string): Partial<Resource> {
  const url = extractUrl(text);
  const source = detectSource(url);
  const title = generateTitle(text, url);
  let category = autoCategorize(text);
  if (category === "⭐ Uncategorized" && defaultCategory) {
    category = defaultCategory;
  }
  const tags = extractTags(text);
  const priority = detectPriority(text);
  
  let notes = text.trim();
  if (url && notes === url) {
    notes = "";
  }

  return {
    title,
    url,
    category,
    tags,
    priority,
    source,
    notes,
    status: 'Saved'
  };
}

export async function categorizeWithGemini(text: string, apiKey: string): Promise<Partial<Resource> | null> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Analyze this resource and return JSON with: title, category (from predefined list), tags (array, max 5), priority (Low/Medium/High), summary (1 sentence). Resource: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, description: `Must be one of: ${CATEGORY_NAMES.join(', ')}` },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, description: "Low, Medium, or High" },
            summary: { type: Type.STRING }
          },
          required: ["title", "category", "tags", "priority", "summary"]
        }
      }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        title: data.title,
        category: CATEGORY_NAMES.includes(data.category) ? data.category : "⭐ Uncategorized",
        tags: data.tags.slice(0, 5),
        priority: ["Low", "Medium", "High"].includes(data.priority) ? data.priority as Priority : "Medium",
        notes: data.summary,
        isAiCategorized: true
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
  }
  return null;
}
