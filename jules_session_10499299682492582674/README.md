# 🌿 Central Pharm - Premium Eco-Friendly Wellness Pharmacy

Central Pharm is a modern, high-performance single-page web application designed for an eco-friendly community apothecary. It blends clean wellness-focused aesthetic design (pastel green color palettes, glassmorphic layout) with interactive, scroll-driven **Three.js 3D dynamic scenes** representing wellness and biology.

This repository is optimized for quick local development and single-click **Vercel** deployment.

---

## ✨ Features

1. **Interactive 3D Background Scene (`Three.js` + `@react-three/fiber`)**
   - **Double-Helix DNA Strand**: High-precision rotating molecular DNA double-helix that transitions, rotates faster, and shifts layout dynamically upon scrolling.
   - **Floating Capsules/Pills**: Multi-color 3D pharmaceutical capsules floating across the screen and responding smoothly to cursor position and viewport scrolling.
   - **Wellness Particle Network**: Floating constellation-like particle web flowing upwards, mimicking natural bio-energy or wellness flows.
2. **Interactive Apothecary Search & Filter**
   - Live searching across a mock database of clinical products (Medicines, Supplements, and Vitamins).
   - Instant filtering tabs and beautiful product detail cards.
3. **Contact Submission & "Secret" Pharmacist Inbox Panel**
   - Client-side form validation with a celebratory **canvas-confetti** burst upon successful submission.
   - Saves inquiries securely to the browser's `localStorage` for dynamic persistence.
   - Includes a hidden **Pharmacist Dispatch Control Dashboard** (toggleable from the header) to read, filter, mark as read, and delete submissions on the fly.
4. **Active Pharmacist Live Support Chat Simulator**
   - Floating chat widget simulating real-time assistance from a community pharmacist ("Sarah, PharmD").
   - Smart keyword recognition (e.g. asking about "delivery", "prescription", or "supplement" triggers specialized helpful responses!).

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18 (with Vite for ultra-fast compilation)
- **3D Graphics Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling**: Tailwind CSS v3 (using customized pastel eco-green themes and modern custom scrollbars)
- **Icons**: Lucide React
- **Animations**: Tailwind CSS transitions & custom CSS keyframes (floating, sliding, scaling)

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
4. Keep the default settings (Vercel automatically detects **Vite** and configures the Build Command `npm run build` and Output Directory `dist`).
5. Click **"Deploy"**! Your site is live in under 45 seconds.

### Method 2: Vercel CLI (Command Line)
1. Install the Vercel command line interface globally:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the project root:
   ```bash
   vercel
   ```
3. Follow the simple prompts to link your Vercel account and project, then deploy to production with:
   ```bash
   vercel --prod
   ```

### Method 3: Drag & Drop Build Artifacts
1. Run the build command locally:
   ```bash
   npm run build
   ```
2. Navigate to [Vercel's Deploy Page](https://vercel.com/new).
3. Drag and drop the generated `/dist` folder directly onto the Vercel upload panel. It will immediately generate a live link!

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
│   ├── App.jsx             # Main marketing UI, contact logic, admin panel, chat
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
