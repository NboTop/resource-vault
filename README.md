<div align="center">

# 🗄️ ResourceVault

**Stop losing useful links. Auto-organize everything you discover while scrolling.**

[Live App](https://resource-vault-steel.vercel.app/) · [Report Bug](https://github.com/NboTop/resource-vault/issues) · [Request Feature](https://github.com/NboTop/resource-vault/issues)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 🧩 The Problem

You're scrolling Instagram, LinkedIn, Twitter, YouTube — and you keep finding incredible stuff: Resume templates, AI tools, Free hosting platforms, Hackathon listings, System design tutorials, Cold email templates, UI/UX inspiration, ML courses, GitHub repos.

You save them. Bookmark them. Screenshot them. And then **never find them again.**

**ResourceVault fixes this.** One place to dump everything. It organizes itself.

---

## 💡 How It Works

1. Copy a link while scrolling
2. Open ResourceVault → Tap "+"
3. Paste it → Hit Save
4. Auto-categorized. Auto-tagged. Done.

No forms to fill. No folders to create. No manual organizing.
**Paste and forget. Search and find.**

---

## ✨ Features

### 🧠 Smart Auto-Organization
- **Auto-categorization** — paste a link and the app detects what it is using keyword intelligence
- **Auto-tagging** — extracts relevant tags from URLs and text automatically
- **Auto-source detection** — identifies if the resource came from Instagram, GitHub, YouTube, etc.
- **Auto-title extraction** — generates a readable title from URLs so you don't have to type one
- **Duplicate detection** — warns you if you've already saved the same link

### ☁️ Cross-Device Cloud Sync
- **Google Sign-In** — one tap authentication
- **Cloud Firestore** — real-time sync across all your devices
- **Offline-first** — works without internet, syncs automatically when back online

### 🔍 Powerful Search & Filtering
- **Real-time search** across titles, URLs, notes, and tags
- **Multi-filter** by category, priority, status, source, and date range

### 📦 Bulk Operations
- **Bulk paste mode** — paste multiple URLs (one per line), all auto-categorized at once
- **Multi-select** resources for bulk status changes or deletion

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Firebase project (free Spark plan)

### Installation & Run

    git clone https://github.com/NboTop/resource-vault.git
    cd resource-vault
    npm install
    npm run dev

### Firebase Configuration

1. Create a Firebase project and enable Google Sign-In
2. Create a Cloud Firestore database
3. Update your Firebase config in the code:

    const firebaseConfig = {
      apiKey: "your-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "your-sender-id",
      appId: "your-app-id"
    };

### Build for Production

    npm run build

---

## ⌨️ Keyboard Shortcuts

- Ctrl + N : Add new resource
- Ctrl + K : Open search
- Escape : Close modal / panel

---

## 🗺️ Roadmap

- [x] Keyword-based auto-categorization
- [x] Auto-tagging & source detection
- [x] Firebase Google Sign-In & Cloud Sync
- [x] Offline support
- [x] Export / Import data as JSON
- [ ] Browser extension for one-click save
- [ ] Gemini API integration for AI categorization
- [ ] Push notification reminders

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">
<br/>
<b>Built by <a href="https://github.com/NboTop">@NboTop</a></b>
<br/>
</div>
