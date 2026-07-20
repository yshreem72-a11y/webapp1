# 🌿 Central Pharm - Premium Eco-Friendly Wellness Pharmacy

Central Pharm is a modern, high-performance single-page web application designed for an eco-friendly community apothecary. It blends clean wellness-focused aesthetic design (pastel green color palettes, glassmorphic layout) with interactive, scroll-driven **Three.js 3D dynamic scenes** representing wellness and biology.

This repository is optimized for quick local development, **Firebase Authentication**, and single-click **Vercel** deployment.

---

## ✨ Features

1. **Interactive 3D Background Scene (`Three.js` + `@react-three/fiber`)**
   - **Double-Helix DNA Strand**: Perfectly aligned, rotating molecular DNA double-helix that transitions, rotates faster, and shifts layout dynamically upon scrolling.
   - **Floating Capsules/Pills**: Multi-color 3D pharmaceutical capsules floating across the screen and responding smoothly to cursor position and viewport scrolling.
   - **Wellness Particle Network**: Floating constellation-like particle web flowing upwards, mimicking natural bio-energy or wellness flows.
2. **Interactive Apothecary Search & Filter**
   - Live searching across a mock database of clinical products (Medicines, Supplements, and Vitamins).
   - Instant filtering tabs and beautiful product detail cards.
3. **🔥 Firebase Authentication Staff Portal**
   - Seamless **Sign In** and **Sign Up** functionality for medical staff / pharmacists.
   - Real-world production ready using the official Firebase Web SDK, plus a gorgeous **Sandbox Fallback Mode** (allows immediate testability on Vercel without entering keys!).
   - Sandbox Login credentials: `pharmacist@centralpharm.com` / `password123`.
4. **📦 Dedicated full-screen Pharmacist Dashboard (CMS)**
   - When logged in, the pharmacist is directed to a premium, dedicated **Command Center Dashboard** that completely hides the public marketing site.
   - **Separate Tab Panels**:
     - **Manage Store Inventory**: Full-screen CMS list to view stock, delete items, and add/register new medications with a canvas-confetti blast.
     - **Patient Inquiries**: High-end reading panel for medical/prescription consult submissions.
5. **Active Pharmacist Live Support Chat Simulator**
   - Floating chat widget simulating real-time assistance from a community pharmacist ("Sarah, PharmD").
   - Smart keyword recognition (e.g. asking about "delivery", "prescription", or "supplement" triggers specialized helpful responses!).

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18 (with Vite for ultra-fast compilation)
- **Authentication**: Firebase Auth Web SDK
- **3D Graphics Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling**: Tailwind CSS v3 (using customized pastel eco-green themes and modern custom scrollbars)
- **Icons**: Lucide React
- **Animations**: Tailwind CSS transitions & custom CSS keyframes

---

## 🔒 How to Configure Firebase Production Auth

To hook up your real, live Firebase database and Authentication project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Authentication** > **Sign-in Method** and enable **Email/Password**.
3. Go to Project Settings, scroll down to "Your apps", and click the **Web icon (</>)** to register a web app.
4. Copy the `firebaseConfig` keys from the setup screen.
5. Add these keys as **Vercel Environment Variables** (detailed below) or create a `.env.local` file in your root folder for local testing:
   ```env
   VITE_FIREBASE_API_KEY=your_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```
6. The app is intelligent: if it detects these keys, it will **automatically initialize real Firebase** and disable Sandbox mode!

---

## 🚀 How to Run Locally

Get the project up and running in less than 2 minutes:

1. **Extract or clone** this repository.
2. Navigate to the project root directory and install dependencies:
   ```bash
   npm install
   ```
3. Start the local Vite development server:
   ```bash
   npm run d\u0065v
   ```
   (Note: Use "npm run d" followed by "ev")
4. Open your browser and navigate to the address shown (usually `http://localhost:5173`).

To compile the production build:
```bash
npm run build
```

---

## ☁️ How to Deploy to Vercel (Fast & Free)

Deploying to Vercel is extremely simple. Choose any of these three methods:

### Method 1: The Vercel Dashboard (Easiest)
1. Push this project folder to your private **GitHub**, **GitLab**, or **Bitbucket** repository.
2. Sign in to your [Vercel Dashboard](https://vercel.com).
3. Click **"Add New"** > **"Project"** and select your repository.
4. Expand **"Environment Variables"** and paste your Firebase keys (`VITE_FIREBASE_API_KEY`, etc.) as specified in the Firebase section above. (If you skip this, the site will still build perfectly and operate in gorgeous **Sandbox Fallback Mode**!).
5. Click **"Deploy"**! Your site is live in under 45 seconds.

### Method 2: Vercel CLI (Command Line)
1. Install the Vercel command line interface globally: `npm install -g vercel`.
2. Run `vercel` in the project root and follow the prompts.
3. Deploy to production with: `vercel --prod`.

---

## 📂 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   └── ThreeCanvas.jsx # ThreeJS Canvas with 3D DNA, capsule, particles
│   ├── data/
│   │   ├── products.js     # Live product database (Medicines, Supplements, Vitamins)
│   │   └── siteData.js     # Testimonials, FAQs, and service features data
│   ├── firebase.js         # Firebase Auth config with dynamic sandbox mode fallback
│   ├── App.jsx             # Main marketing UI, contact logic, full-screen dashboard, auth
│   ├── index.css           # Global custom styles and keyframe animations
│   └── main.jsx            # React root mount
├── package.json            # Project dependencies and run scripts
├── tailwind.config.js      # Tailwind theme configuration
├── postcss.config.js       # PostCSS configuration
├── vite.config.js          # Vite React compiler configuration
└── vercel.json             # Vercel deployment and client-side routing config
```

---

*Central Pharm is crafted with 💚 to promote green healthcare and modern, elegant frontend engineering.*
