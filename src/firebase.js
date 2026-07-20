import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Vite environments
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase keys are fully set
const isFirebaseReal = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.apiKey.trim() !== "";

let authInstance = null;
let appInstance = null;

if (isFirebaseReal) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    console.log("🔥 Firebase initialized successfully in PRODUCTION mode.");
  } catch (err) {
    console.error("❌ Failed to initialize real Firebase:", err);
  }
}

// SIMULATED FALLBACK AUTHENTICATION (For immediate testability on Vercel before adding keys)
class SimulatedAuth {
  constructor() {
    this.listeners = [];
    // Load currentUser from session/localStorage for fallback mock consistency
    const savedUser = localStorage.getItem('central_pharm_mock_user');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;
    
    // Seed default mock credentials in localStorage
    const savedCreds = localStorage.getItem('central_pharm_mock_creds');
    if (!savedCreds) {
      const defaultCreds = [
        { email: 'pharmacist@centralpharm.com', password: 'password123', name: 'Pharmacist Sarah' }
      ];
      localStorage.setItem('central_pharm_mock_creds', JSON.stringify(defaultCreds));
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Send initial auth state
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  async signInWithEmailAndPassword(email, password) {
    // Artificial latency for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const creds = JSON.parse(localStorage.getItem('central_pharm_mock_creds') || '[]');
    const match = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    
    if (match) {
      const user = { email: match.email, displayName: match.name, uid: `mock-uid-${Date.now()}` };
      this.currentUser = user;
      localStorage.setItem('central_pharm_mock_user', JSON.stringify(user));
      this.notifyListeners();
      return { user };
    } else {
      throw new Error("auth/wrong-password - Invalid credentials. Please use pharmacist@centralpharm.com and password123, or sign up a new account.");
    }
  }

  async createUserWithEmailAndPassword(email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password.length < 6) {
      throw new Error("auth/weak-password - Password should be at least 6 characters.");
    }

    const creds = JSON.parse(localStorage.getItem('central_pharm_mock_creds') || '[]');
    const existing = creds.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      throw new Error("auth/email-already-in-use - This pharmacist email is already registered.");
    }

    const name = email.split('@')[0];
    const uppercaseName = name.charAt(0).toUpperCase() + name.slice(1);
    const newCred = { email, password, name: `Pharmacist ${uppercaseName}` };
    creds.push(newCred);
    
    localStorage.setItem('central_pharm_mock_creds', JSON.stringify(creds));

    const user = { email, displayName: newCred.name, uid: `mock-uid-${Date.now()}` };
    this.currentUser = user;
    localStorage.setItem('central_pharm_mock_user', JSON.stringify(user));
    this.notifyListeners();
    return { user };
  }

  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.currentUser = null;
    localStorage.removeItem('central_pharm_mock_user');
    this.notifyListeners();
  }
}

const mockAuth = new SimulatedAuth();

// EXPORTS: Automatically routes calls to Real Firebase if config exists, otherwise falls back to simulator!
export const isRealFirebaseActive = isFirebaseReal;

export const firebaseSignIn = async (email, password) => {
  if (isRealFirebaseActive && authInstance) {
    return signInWithEmailAndPassword(authInstance, email, password);
  } else {
    return mockAuth.signInWithEmailAndPassword(email, password);
  }
};

export const firebaseSignUp = async (email, password) => {
  if (isRealFirebaseActive && authInstance) {
    return createUserWithEmailAndPassword(authInstance, email, password);
  } else {
    return mockAuth.createUserWithEmailAndPassword(email, password);
  }
};

export const firebaseSignOut = async () => {
  if (isRealFirebaseActive && authInstance) {
    return signOut(authInstance);
  } else {
    return mockAuth.signOut();
  }
};

export const firebaseOnAuthStateChanged = (callback) => {
  if (isRealFirebaseActive && authInstance) {
    return onAuthStateChanged(authInstance, callback);
  } else {
    return mockAuth.onAuthStateChanged(callback);
  }
};
