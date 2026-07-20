import React, { useState, useEffect, useRef } from 'react'
import ThreeCanvas from './components/ThreeCanvas'
import { products as initialProducts } from './data/products'
import { services, testimonials, faqs } from './data/siteData'
import confetti from 'canvas-confetti'
import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  firebaseOnAuthStateChanged,
  isRealFirebaseActive
} from './firebase'
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Check,
  Trash2,
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Star,
  X,
  Menu,
  HeartHandshake,
  Leaf,
  Truck,
  ShieldAlert,
  ChevronDown,
  Info,
  Plus,
  Package,
  Inbox,
  LogOut,
  Eye,
  EyeOff,
  Database,
  Grid,
  ExternalLink,
  ShieldAlert as SecurityIcon,
  KeyRound
} from 'lucide-react'

// Icon helper to render correct lucide icon from string name
const ServiceIcon = ({ name, className }) => {
  switch (name) {
    case 'ShieldAlert':
      return <ShieldAlert className={className} />
    case 'Truck':
      return <Truck className={className} />
    case 'Leaf':
      return <Leaf className={className} />
    case 'HeartHandshake':
      return <HeartHandshake className={className} />
    default:
      return <Leaf className={className} />
  }
}

export default function App() {
  // Navigation & UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthViewOpen, setIsAuthViewOpen] = useState(false)
  const [isDashboardActive, setIsDashboardActive] = useState(false) // Toggle whether logged-in user is viewing the Admin Dashboard
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Firebase Auth State
  const [user, setUser] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authInvitationKey, setAuthInvitationKey] = useState('') // Staff Invitation Passcode input
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Secret staff invitation code required for sign-up
  const SECRET_STAFF_INVITATION_CODE = "CENTRAL_DISPENSARY_2026"

  // Dashboard Tab selection
  const [dashboardTab, setDashboardTab] = useState('inventory') // 'inventory' or 'inbox'

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Live Chat Simulator State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am Sarah, your registered molecular pharmacist. How can I assist you with your biotech and cellular optimization today? 🧬' }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null)

  // Dynamic Product list (loads from localStorage or initialProducts static data)
  const [productsList, setProductsList] = useState([])

  // State to manage new product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Medicines',
    price: '',
    badge: 'Eco-Choice',
    icon: '🌿',
    description: '',
    rating: '5.0',
    featuresRaw: '100% Organic, Vegan Capsules, Recyclable Jar'
  })

  // Contact Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Submissions (stored in localStorage)
  const [submissions, setSubmissions] = useState([])

  // Load products, submissions, and auth status on mount
  useEffect(() => {
    // 1. Subscribe to Firebase Auth changes
    const unsubscribe = firebaseOnAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        setIsDashboardActive(true) // Auto go to dashboard when logged in
      } else {
        setIsDashboardActive(false)
      }
    })

    // 2. Load submissions
    const savedSubmissions = localStorage.getItem('central_pharm_submissions')
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions))
      } catch (e) {
        console.error("Failed to parse submissions", e)
      }
    } else {
      const initialSubmissions = [
        {
          id: "sub-1",
          name: "Professor Julian Thorne",
          email: "j.thorne@greenuniversity.edu",
          phone: "+1 (555) 349-2910",
          subject: "Prescription Transfer Inquiry",
          message: "Greetings, I would like to transfer my regular prescription for non-drowsy allergy management to Central Pharm. Could you please let me know what documents my GP needs to send over? I highly appreciate your plastic-free posture.",
          date: new Date(Date.now() - 3600000 * 4).toLocaleString(), // 4 hrs ago
          status: "Unread"
        },
        {
          id: "sub-2",
          name: "Clara Oswald",
          email: "clara.oswald@gmail.com",
          phone: "+1 (555) 902-8812",
          subject: "Compounding Request",
          message: "Hello! My son has a severe corn allergy and standard medicines contain cornstarch as a filler. Do you offer compounding options with pure rice or potato-derived binders? Thank you so much!",
          date: new Date(Date.now() - 3600000 * 20).toLocaleString(), // 20 hrs ago
          status: "Replied"
        }
      ]
      setSubmissions(initialSubmissions)
      localStorage.setItem('central_pharm_submissions', JSON.stringify(initialSubmissions))
    }

    // 3. Load inventory
    const savedInventory = localStorage.getItem('central_pharm_inventory')
    if (savedInventory) {
      try {
        setProductsList(JSON.parse(savedInventory))
      } catch (e) {
        console.error("Failed to parse inventory", e)
        setProductsList(initialProducts)
      }
    } else {
      setProductsList(initialProducts)
      localStorage.setItem('central_pharm_inventory', JSON.stringify(initialProducts))
    }

    return () => unsubscribe()
  }, [])

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isChatOpen])

  // Handle Firebase Login / Signup submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter both email and password.')
      return
    }

    // SECURITY FIX: Restrict Sign-Up Mode behind the Secret Staff Invitation Key
    if (authMode === 'register') {
      if (!authInvitationKey.trim()) {
        setAuthError('A valid Staff Registration Invitation Key is required to create a pharmacist account.')
        return
      }
      if (authInvitationKey.trim() !== SECRET_STAFF_INVITATION_CODE) {
        setAuthError('Unauthorized Staff Invitation Key. Only licensed pharmacists with valid dispensary codes can register staff profiles.')
        return
      }
    }

    setAuthLoading(true)
    try {
      if (authMode === 'login') {
        await firebaseSignIn(authEmail, authPassword)
        // Success
        confetti({
          particleCount: 80,
          spread: 50,
          colors: ['#00ff66', '#004d1f']
        })
        setIsAuthViewOpen(false)
        setAuthEmail('')
        setAuthPassword('')
      } else {
        await firebaseSignUp(authEmail, authPassword)
        // Success
        confetti({
          particleCount: 120,
          spread: 60,
          colors: ['#00ff66', '#bbf7d0', '#ffffff']
        })
        alert("Staff account registered successfully! Logged in as licensed pharmacist.")
        setIsAuthViewOpen(false)
        setAuthEmail('')
        setAuthPassword('')
        setAuthInvitationKey('')
      }
    } catch (err) {
      console.error("Auth error details:", err)
      const friendlyMessage = err.message.includes('auth/') 
        ? err.message.split(' - ')[1] || err.message 
        : err.message
      setAuthError(friendlyMessage)
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Firebase Logout
  const handleLogout = async () => {
    if (confirm("Sign out of the Pharmacist Portal?")) {
      await firebaseSignOut()
      setIsDashboardActive(false)
    }
  }

  // Handle Contact Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    // Create new submission object
    const newSubmission = {
      id: `sub-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'Not provided',
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleString(),
      status: "Unread"
    }

    const updated = [newSubmission, ...submissions]
    setSubmissions(updated)
    localStorage.setItem('central_pharm_submissions', JSON.stringify(updated))

    // Success Animation
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#00ff66', '#00b347', '#bbf7d0', '#ffffff']
    })

    setFormSubmitted(true)
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })

    // Reset success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false)
    }, 5000)
  }

  // Handle Adding New Product
  const handleAddProduct = (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      alert("Please fill out all required fields.")
      return
    }

    const features = newProduct.featuresRaw
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    const newlyCreatedItem = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 0,
      rating: parseFloat(newProduct.rating) || 5.0,
      badge: newProduct.badge,
      icon: newProduct.icon,
      description: newProduct.description,
      features: features.length > 0 ? features : ["100% Pure", "Lab-tested"]
    }

    const updatedInventory = [newlyCreatedItem, ...productsList]
    setProductsList(updatedInventory)
    localStorage.setItem('central_pharm_inventory', JSON.stringify(updatedInventory))

    // Pop tiny celebratory confetti
    confetti({
      particleCount: 80,
      spread: 50,
      colors: ['#00ff66', '#00b347']
    })

    // Reset form
    setNewProduct({
      name: '',
      category: 'Medicines',
      price: '',
      badge: 'Eco-Choice',
      icon: '🌿',
      description: '',
      rating: '5.0',
      featuresRaw: '100% Organic, Vegan Capsules, Recyclable Jar'
    })

    alert("Medication registered successfully!")
  }

  // Handle Deleting Product
  const handleDeleteProduct = (productId) => {
    if (confirm("Are you sure you want to remove this item from the active storefront?")) {
      const updatedInventory = productsList.filter(p => p.id !== productId)
      setProductsList(updatedInventory)
      localStorage.setItem('central_pharm_inventory', JSON.stringify(updatedInventory))
    }
  }

  // Handle Chat Submit
  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = { sender: 'user', text: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')

    // Simulate pharmacist response
    setTimeout(() => {
      let responseText = "Thank you for sharing. Let me check that molecular pathway for you. Are you tracking specific symptoms?"
      const inputLower = chatInput.toLowerCase()
      
      if (inputLower.includes('hello') || inputLower.includes('hi')) {
        responseText = "Hello there! What biotech or pharmacological questions can I answer for you today? 🧬"
      } else if (inputLower.includes('delivery') || inputLower.includes('shipping')) {
        responseText = "We offer same-day clinical courier delivery. Our thermal-locked containers preserve all bio-active peptides perfectly! 🚲"
      } else if (inputLower.includes('prescription') || inputLower.includes('rx')) {
        responseText = "Prescription transfer is completely automated. Submit our secure encryption contact form at the bottom, and we will port your records within 15 minutes."
      } else if (inputLower.includes('supplement') || inputLower.includes('vitamin') || inputLower.includes('nmn')) {
        responseText = "All molecules, including our premium NMN Longevity Matrix, undergo certified HPLC purity testing. You can search our active database right on this page!"
      } else if (inputLower.includes('organic') || inputLower.includes('natural')) {
        responseText = "Indeed. We compound using zero heavy metals, microplastics, or standard chemical binders."
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: responseText }])
    }, 1200)
  }

  // Filter and Search Products
  const filteredProducts = productsList.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Delete message in admin inbox
  const deleteSubmission = (id) => {
    const updated = submissions.filter(s => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('central_pharm_submissions', JSON.stringify(updated))
  }

  // Toggle submission read status
  const toggleReadStatus = (id) => {
    const updated = submissions.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Read' ? 'Unread' : 'Read' }
      }
      return s
    })
    setSubmissions(updated)
    localStorage.setItem('central_pharm_submissions', JSON.stringify(updated))
  }

  // Render Admin Dashboard (FULL SCREEN DARK MODE BIOTECH PORTAL)
  if (isDashboardActive && user) {
    return (
      <div className="min-h-screen bg-[#020603] text-slate-100 flex flex-col justify-between selection:bg-biotech-800 selection:text-biotech-200 font-sans">
        
        {/* Dashboard Top Header */}
        <header className="bg-[#050f07] border-b border-biotech-900/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <div className="bg-biotech-600 text-[#020603] p-2.5 rounded-full shadow shadow-biotech-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                  <span>Pharmacist Command Center</span>
                  <span className="hidden sm:inline text-xs bg-biotech-900 border border-biotech-500 text-biotech-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest">ADMIN</span>
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs font-semibold text-biotech-400 block">
                    Identity: {user.displayName || user.email}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isRealFirebaseActive ? 'bg-emerald-950/80 text-biotech-300 border border-biotech-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  }`}>
                    {isRealFirebaseActive ? '🔥 Firebase Production' : '⚙️ Sandbox Mode'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs for Wide Screen */}
            <div className="hidden md:flex space-x-2 bg-[#020603] p-1.5 rounded-2xl border border-biotech-900/50">
              <button
                onClick={() => setDashboardTab('inventory')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  dashboardTab === 'inventory'
                    ? 'bg-biotech-950 border border-biotech-500/50 text-white shadow-glow-green-sm'
                    : 'text-biotech-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Manage Store Inventory ({productsList.length})</span>
              </button>
              <button
                onClick={() => setDashboardTab('inbox')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  dashboardTab === 'inbox'
                    ? 'bg-biotech-950 border border-biotech-500/50 text-white shadow-glow-green-sm'
                    : 'text-biotech-400 hover:text-white'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Patient Inquiries ({submissions.length})</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDashboardActive(false)}
                className="flex items-center space-x-1.5 px-4 h-11 border border-biotech-900 hover:border-biotech-500/30 text-biotech-400 hover:text-white text-sm font-semibold rounded-xl transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Public Portal</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center bg-red-950/40 border border-red-900/60 hover:bg-red-950 hover:border-red-500 text-red-400 w-11 h-11 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden border-t border-biotech-900/40 flex p-2 bg-[#050f07]">
            <button
              onClick={() => setDashboardTab('inventory')}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 text-xs font-extrabold rounded-xl transition-all ${
                dashboardTab === 'inventory' ? 'bg-[#020603] text-white border border-biotech-900 shadow-glow-green-sm' : 'text-biotech-400'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              <span>Inventory</span>
            </button>
            <button
              onClick={() => setDashboardTab('inbox')}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 text-xs font-extrabold rounded-xl transition-all ${
                dashboardTab === 'inbox' ? 'bg-[#020603] text-white border border-biotech-900 shadow-glow-green-sm' : 'text-biotech-400'
              }`}
            >
              <Inbox className="w-4.5 h-4.5" />
              <span>Inquiries ({submissions.length})</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Grid Area */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
          
          {/* --- TAB 1: MANAGE INVENTORY VIEW --- */}
          {dashboardTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Register Product form */}
              <div className="lg:col-span-5 bg-[#050f07] p-6 sm:p-8 rounded-3xl border border-biotech-900/60 shadow-2xl text-left space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-biotech-400" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-biotech-300">Register Bio-Active Stock</span>
                  </h3>
                  <p className="text-xs text-biotech-400/80 mt-1">Register molecular structures instantly into the storefront active catalog.</p>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zinc Peptide"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none bg-white text-white"
                      >
                        <option value="Medicines">Medicines</option>
                        <option value="Supplements">Supplements</option>
                        <option value="Vitamins">Vitamins</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="19.99"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Badge</label>
                      <select
                        value={newProduct.badge}
                        onChange={(e) => setNewProduct({...newProduct, badge: e.target.value})}
                        className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none bg-white text-white"
                      >
                        <option value="Eco-Choice">Eco-Choice</option>
                        <option value="Organic">Organic</option>
                        <option value="New">New</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="Vegan Choice">Vegan Choice</option>
                        <option value="Essential">Essential</option>
                      </select>
                    </div>

                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Emoji Icon</label>
                      <select
                        value={newProduct.icon}
                        onChange={(e) => setNewProduct({...newProduct, icon: e.target.value})}
                        className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none bg-white text-white text-base"
                      >
                        <option value="🌿">🌿 Herbs</option>
                        <option value="🧬">🧬 DNA</option>
                        <option value="💊">💊 Pill</option>
                        <option value="🍯">🍯 Honey</option>
                        <option value="🌸">🌸 Flower</option>
                        <option value="💧">💧 Drops</option>
                        <option value="🧠">🧠 Brain</option>
                        <option value="☀️">☀️ Sun</option>
                        <option value="⚡">⚡ Bolt</option>
                        <option value="🍒">🍒 Cherry</option>
                        <option value="🧪">🧪 Tube</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Molecular Action / Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write how this item targets cellular receptors and its direct biological benefits..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-600"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Key Features (comma separated)</label>
                    <input
                      type="text"
                      placeholder="99.8% Certified Purity, Liposomal, Lab-Tested"
                      value={newProduct.featuresRaw}
                      onChange={(e) => setNewProduct({...newProduct, featuresRaw: e.target.value})}
                      className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-biotech-600 hover:bg-biotech-500 hover:shadow-glow-green text-[#020603] font-black rounded-xl transition-all text-sm uppercase tracking-wider"
                  >
                    Commit Molecular Structure
                  </button>
                </form>
              </div>

              {/* Right Column: Inventory database directory list */}
              <div className="lg:col-span-7 bg-[#050f07] p-6 sm:p-8 rounded-3xl border border-biotech-900/60 shadow-2xl text-left space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                    <Database className="w-5 h-5 text-biotech-400" />
                    <span>Active Stock Directory ({productsList.length} items)</span>
                  </h3>
                  <p className="text-xs text-biotech-400/80 mt-1">Deregistering any medicine immediately removes it from the customer storefront.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                  {productsList.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-4 bg-[#020603]/80 border border-biotech-900/40 hover:border-biotech-500/30 rounded-2xl transition-all"
                    >
                      <div className="flex items-center space-x-3 text-left overflow-hidden">
                        <span className="text-4xl bg-[#050f07] p-2.5 rounded-xl border border-biotech-900 flex-shrink-0">{prod.icon}</span>
                        <div className="overflow-hidden">
                          <span className="font-bold text-white text-sm block leading-tight truncate">{prod.name}</span>
                          <span className="text-[10px] text-biotech-400 font-extrabold uppercase tracking-wider block mt-1">
                            {prod.category}
                          </span>
                          <span className="text-xs text-biotech-300 font-bold block mt-0.5">${prod.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-3 hover:bg-red-950/50 hover:text-red-400 text-slate-500 rounded-xl transition-colors flex-shrink-0"
                        title="Remove product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 2: PATIENT INBOX SUBMISSIONS VIEW --- */}
          {dashboardTab === 'inbox' && (
            <div className="bg-[#050f07] p-6 sm:p-8 rounded-3xl border border-biotech-900/60 shadow-2xl text-left space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-biotech-400" />
                  <span>Clinical Prescription Inbox ({submissions.length} queries)</span>
                </h3>
                <p className="text-xs text-biotech-400/80 mt-1">Check automated prescription transfers, compounding formulations, and clinical genetic inquiries.</p>
              </div>

              {submissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`border rounded-2xl p-6 transition-all relative ${
                        sub.status === 'Unread'
                          ? 'bg-biotech-950/60 border-biotech-500/40 shadow-glow-green-sm'
                          : 'bg-[#020603]/80 border-biotech-900/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <span className="block font-bold text-white text-base">{sub.name}</span>
                          <span className="text-xs text-biotech-400/80 block mt-0.5">{sub.date}</span>
                          <span className="text-xs font-semibold text-biotech-300 block mt-1">{sub.email}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleReadStatus(sub.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              sub.status === 'Unread'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-950'
                                : 'bg-biotech-900/30 text-biotech-400 border-biotech-900/40 hover:bg-biotech-900/50'
                            }`}
                          >
                            {sub.status}
                          </button>
                          <button
                            onClick={() => deleteSubmission(sub.id)}
                            className="p-2.5 hover:bg-red-950/40 hover:text-red-400 rounded-xl text-slate-500 transition-colors"
                            title="Delete query"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-xs font-bold text-biotech-300 bg-biotech-950/80 border border-biotech-900 px-3 py-1 rounded-full uppercase tracking-wider">
                          {sub.subject}
                        </span>
                      </div>

                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-[#020603]/80 p-4 rounded-xl border border-biotech-900/30 font-medium">
                        {sub.message}
                      </p>

                      {sub.phone && sub.phone !== 'Not provided' && (
                        <div className="mt-3 text-xs font-medium text-biotech-400">
                          📞 Callback contact: <span className="font-bold text-white">{sub.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 max-w-sm mx-auto space-y-4">
                  <div className="bg-[#020603] text-biotech-400 p-6 rounded-full inline-block border border-biotech-900/50">
                    <Inbox className="w-10 h-10" />
                  </div>
                  <h4 className="font-extrabold text-white text-lg">Inbox is completely empty</h4>
                  <p className="text-sm text-biotech-400/80">
                    Patient consultation transmissions will map here instantly.
                  </p>
                </div>
              )}
            </div>
          )}

        </main>

        {/* Dashboard Footer */}
        <footer className="bg-[#050f07] border-t border-biotech-900/60 py-6 text-center text-xs text-biotech-400/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Central Pharm Biotech. Licensed Molecular Pharmacy Practice.</p>
            <button
              onClick={() => setIsDashboardActive(false)}
              className="text-biotech-400 hover:text-white font-bold flex items-center space-x-1.5"
            >
              <span>Exit Dashboard View</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </footer>

      </div>
    )
  }

  // STANDARD PUBLIC MARKETING SITE (Dark Futuristic Biotech Theme)
  return (
    <div className="relative min-h-screen bg-[#030904] text-slate-100 selection:bg-biotech-900 selection:text-biotech-300 overflow-x-hidden">
      
      {/* ThreeJS Background Canvas */}
      <ThreeCanvas />

      {/* --- HEADER & NAVIGATION --- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#030904]/70 border-b border-biotech-900/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-biotech-950 text-biotech-400 p-2.5 rounded-full border border-biotech-900 group-hover:border-biotech-400/50 group-hover:shadow-glow-green-sm transition-all duration-300">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-white block">Central Pharm</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-biotech-400 block -mt-1">Biotech & Longevity</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8 font-semibold text-biotech-300/80">
              <a href="#hero" className="hover:text-white transition-colors">Home</a>
              <a href="#services" className="hover:text-white transition-colors">Ethos</a>
              <a href="#products" className="hover:text-white transition-colors">Catalog</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
              <a href="#contact" className="hover:text-white transition-colors">Inquire</a>
              
              {/* Only displays if pharmacist is logged in */}
              {user && (
                <button
                  onClick={() => setIsDashboardActive(true)}
                  className="text-white hover:text-biotech-300 font-black flex items-center space-x-1.5 bg-biotech-950 border border-biotech-500/40 px-3.5 py-1 rounded-xl shadow-glow-green-sm animate-pulse"
                >
                  <Grid className="w-4.5 h-4.5" />
                  <span>Dashboard</span>
                </button>
              )}
            </nav>

            {/* CTA & Admin Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => {
                  if (user) {
                    setIsDashboardActive(true)
                  } else {
                    setIsAuthViewOpen(true)
                  }
                }}
                className="flex items-center space-x-1.5 px-4 h-11 border border-biotech-900 hover:border-biotech-400/30 rounded-full text-sm font-semibold text-biotech-300 hover:text-white transition-all shadow-sm bg-biotech-950/20"
              >
                <Lock className="w-4 h-4 text-biotech-400" />
                <span>{user ? 'Staff Portal' : 'Pharmacist Login'}</span>
                {!user && submissions.filter(s => s.status === 'Unread').length > 0 && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                    {submissions.filter(s => s.status === 'Unread').length}
                  </span>
                )}
              </button>

              <a
                href="#products"
                className="flex items-center justify-center px-5 h-11 bg-biotech-600 hover:bg-biotech-500 text-slate-950 rounded-full text-sm font-extrabold shadow hover:shadow-glow-green active:scale-95 transition-all"
              >
                Explore Molecules
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => {
                  if (user) {
                    setIsDashboardActive(true)
                  } else {
                    setIsAuthViewOpen(true)
                  }
                }}
                className="relative p-2 text-biotech-400 hover:text-white"
                title="Staff Portal"
              >
                <Lock className="w-5 h-5" />
                {!user && submissions.filter(s => s.status === 'Unread').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {submissions.filter(s => s.status === 'Unread').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-biotech-300 hover:text-white focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#030904]/95 border-b border-biotech-900/50 backdrop-blur-lg animate-fadeIn text-left">
            <div className="px-4 pt-2 pb-6 space-y-3">
              <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-biotech-300 hover:bg-biotech-950/50 hover:text-white">Home</a>
              <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-biotech-300 hover:bg-biotech-950/50 hover:text-white">Ethos</a>
              <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-biotech-300 hover:bg-biotech-950/50 hover:text-white">Catalog</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-biotech-300 hover:bg-biotech-950/50 hover:text-white">About</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-biotech-300 hover:bg-biotech-950/50 hover:text-white">FAQs</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-biotech-300 hover:bg-biotech-950/50 hover:text-white">Inquire</a>
              
              {user && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsDashboardActive(true); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-bold text-white bg-biotech-950 border border-biotech-900"
                >
                  Go to Dashboard
                </button>
              )}

              <div className="pt-2">
                <a
                  href="#products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center block py-3 bg-biotech-600 text-[#020603] font-black rounded-xl"
                >
                  Explore Molecules
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative min-h-[calc(100vh-80px)] flex items-center justify-start py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10 text-left">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-biotech-950/80 border border-biotech-500/30 backdrop-blur-md px-4 py-1.5 rounded-full text-biotech-300 font-bold text-xs tracking-wider uppercase animate-float max-w-max shadow-glow-green-sm">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-biotech-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-biotech-400"></span>
              </span>
              <span>🧬 ADVANCED BIO-PHARMACOLOGY</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Optimize your biology. <span className="text-transparent bg-clip-text bg-gradient-to-r from-biotech-400 to-emerald-300 underline decoration-biotech-400/40 decoration-8 underline-offset-4">Extend lifespan.</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Welcome to <strong className="text-white font-extrabold">Central Pharm</strong>, where clinical microbiology converges with molecular health optimization. Explore high-absorption vitamins, heavy-metal-free compounds, and 24/7 registered pharmacist support.
            </p>

            {/* Quick interactive search banner in Hero */}
            <div className="p-1.5 bg-[#050f07]/80 border border-biotech-900 rounded-2xl flex flex-col sm:flex-row items-center gap-2 max-w-lg shadow-2xl backdrop-blur-md">
              <div className="flex items-center space-x-3 w-full px-3 py-2 text-slate-500">
                <Search className="w-5 h-5 text-biotech-400" />
                <input
                  type="text"
                  placeholder="Query molecular structures (e.g. NMN, Omega-3, D3...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    const section = document.getElementById('products')
                    if (section) section.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-transparent border-0 text-white focus:outline-none focus:ring-0 placeholder-slate-600 text-sm w-full"
                />
              </div>
              <a
                href="#products"
                className="w-full sm:w-auto flex h-12 px-6 items-center justify-center bg-biotech-600 hover:bg-biotech-500 text-[#020603] font-black rounded-xl whitespace-nowrap transition-all shadow hover:translate-x-1"
              >
                Search Index
              </a>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md border-t border-biotech-900/60">
              <div>
                <span className="block text-2xl font-black text-white">99.8%</span>
                <span className="block text-xs font-semibold text-biotech-400">Certified Purity</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">Zero</span>
                <span className="block text-xs font-semibold text-biotech-400">Synthetic Fillers</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">24/7</span>
                <span className="block text-xs font-semibold text-biotech-400">Active Support</span>
              </div>
            </div>
          </div>

          {/* Interactive floating model helper tag in Desktop */}
          <div className="hidden lg:col-span-5 lg:flex flex-col justify-end items-end space-y-4">
            <div className="bg-[#050f07]/80 border border-biotech-900 p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-[280px] pointer-events-auto transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center space-x-2 text-biotech-400 font-bold mb-1">
                <Info className="w-5 h-5" />
                <span className="text-sm">Interactive 3D Art</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scroll the webpage to see the DNA helix and molecular compounds align. Move your mouse to tilt the camera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES / ETHOS SECTION --- */}
      <section id="services" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#040e06]/80 border-y border-biotech-900/60 backdrop-blur-sm z-10 text-left">
        <div className="max-w-7xl mx-auto">
          {/* Section title */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-400">Biological Integrity</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Advanced Clinical Diagnostics & Formulation
            </p>
            <p className="text-slate-400 leading-relaxed">
              Standard pharmacies output millions of tons of synthetic chemical binders and microplastics. Central Pharm is designed with molecular-level biological integrity.
            </p>
          </div>

          {/* Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-[#051107]/90 border border-biotech-900 rounded-3xl p-6 shadow-xl hover:border-biotech-500/30 transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="bg-biotech-950 text-biotech-400 p-4 rounded-2xl inline-block border border-biotech-900 shadow-inner">
                    <ServiceIcon name={srv.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{srv.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{srv.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-biotech-900/40 flex items-center justify-between text-xs font-bold text-biotech-400">
                  <span>{srv.benefit}</span>
                  {srv.id === 'serv-1' && (
                    <span className="flex items-center space-x-1 bg-biotech-950 border border-biotech-500/40 text-biotech-400 px-2.5 py-0.5 rounded-full text-[10px] animate-pulse">
                      <span>●</span> <span>MONITORING ACTIVE</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRODUCT HIGHLIGHTS & LIVE SEARCH --- */}
      <section id="products" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#020603]/30 backdrop-blur-sm z-10 text-left">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-400">Diagnostics Index</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                Biotech Longevity Repository
              </p>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Query, filter, and inspect our live directory of ethically formulated active compounds, telomere catalysts, and brain probiotics.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-[#050f07] rounded-2xl max-w-max border border-biotech-900">
              {['All', 'Medicines', 'Supplements', 'Vitamins'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-biotech-950 border border-biotech-500/50 text-white shadow-glow-green-sm'
                      : 'text-biotech-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar input */}
          <div className="mb-10 max-w-xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-biotech-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by chemical features, active compounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-[#050f07]/90 border border-biotech-900 rounded-2xl text-white focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-[#051107]/90 border border-biotech-900 rounded-3xl p-6 shadow-2xl hover:border-biotech-400/40 transform hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Badge and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-biotech-950 border border-biotech-900 text-biotech-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {product.badge}
                      </span>
                      <span className="flex items-center text-amber-400 font-extrabold text-xs bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/30">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mr-1" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Product visual mock */}
                    <div className="aspect-video bg-[#020603] rounded-2xl flex items-center justify-center text-5xl group-hover:scale-102 border border-biotech-900/50 transition-all duration-300 relative overflow-hidden shadow-inner mb-4">
                      <span>{product.icon}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-biotech-950/40 to-transparent"></div>
                    </div>

                    {/* Name & Category */}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-biotech-400 block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-biotech-400 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-biotech-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-biotech-400 block uppercase tracking-wider">Active Cost</span>
                      <span className="text-xl font-black text-white">${product.price.toFixed(2)}</span>
                    </div>
                    <button
                      className="px-4.5 py-2.5 bg-biotech-950 border border-biotech-900 text-biotech-300 hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#050f07] border border-biotech-900 p-12 rounded-3xl text-center max-w-xl mx-auto">
              <div className="bg-biotech-950 text-biotech-400 p-4 rounded-full inline-block mb-4 border border-biotech-900">
                <AlertCircle className="w-10 h-10 animate-pulseGlow" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Molecular index empty</h3>
              <p className="text-slate-400 text-sm">
                No active formulas found for category "{selectedCategory}" matching: <strong className="text-biotech-300">"{searchQuery}"</strong>. Try checking 'B12', 'silver', or 'peptide'.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-6 px-5 py-2.5 bg-biotech-600 text-slate-950 font-bold rounded-xl text-xs hover:bg-biotech-500 transition-all"
              >
                Reset Search Index
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- ABOUT US / CLINICAL STORY --- */}
      <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#040e06]/90 border-y border-biotech-900/60 backdrop-blur-md z-10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Static imagery represent */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#020603] p-8 rounded-3xl shadow-2xl border border-biotech-900 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-biotech-400 block">Laboratory Standards</span>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-biotech-950 text-biotech-400 border border-biotech-900 rounded-xl mt-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Clinical Molecular Practice</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Fully accredited by the Board of Advanced Pharmacological Standards.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-biotech-950 text-biotech-400 border border-biotech-900 rounded-xl mt-1">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Ultra-Pure Sourcing</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Operating under heavy-metal-free protocols, yielding 99.8% pure assays.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-biotech-950 text-biotech-400 border border-biotech-900 rounded-xl mt-1">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Thermal Locked Logistics</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Active molecular formulations are locked in temperature-controlled pods.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#051107] border border-biotech-900 p-4 rounded-2xl flex items-center space-x-3 text-xs text-biotech-300 leading-relaxed">
                <span>⚡</span>
                <p>We leverage high-performance liquid chromatography (HPLC) to verify active molecule counts in every batch.</p>
              </div>
            </div>
          </div>

          {/* Story Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-400">About Central Pharm</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Pioneering custom bio-compounding and cellular longevity.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Founded in 2024, Central Pharm emerged from a group of environmental toxicologists and compound formulation chemists who set out to reinvent the standard pharmacy model.
            </p>
            <p className="text-slate-400 leading-relaxed">
              We operate state-of-the-art bio-compounding laboratories where we tailor molecular compounds directly for your biological requirements, using exclusively hypoallergenic plant carriers and eliminating synthetic binding excipients completely.
            </p>
            <div className="pt-4 border-t border-biotech-900/40 flex flex-col sm:flex-row gap-6">
              <div className="space-y-1">
                <span className="block text-3xl font-black text-white">99.8%</span>
                <span className="block text-xs text-biotech-400 font-semibold uppercase tracking-wider">Molar Purity Assay</span>
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black text-white">Zero</span>
                <span className="block text-xs text-biotech-400 font-semibold uppercase tracking-wider">Titanium Dioxide</span>
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black text-white">24/7</span>
                <span className="block text-xs text-biotech-400 font-semibold uppercase tracking-wider">Active Monitoring</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- TESTIMONIALS & FAQ --- */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#020603]/30 backdrop-blur-sm z-10 text-left">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Testimonials */}
          <div>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-400">Clinical Reviews</h2>
              <p className="text-3xl font-extrabold text-white">Bio-Hacking Patient Testimonials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="bg-[#051107]/90 border border-biotech-900 p-8 rounded-3xl shadow-xl relative"
                >
                  <div className="absolute -top-5 left-8 text-3xl bg-[#020603] w-11 h-11 flex items-center justify-center rounded-2xl border border-biotech-900 shadow-glow-green-sm">
                    {test.avatar}
                  </div>
                  <div className="pt-4 space-y-4">
                    <div className="flex space-x-1 text-amber-400">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      "{test.quote}"
                    </p>
                    <div className="pt-4 border-t border-biotech-900/40">
                      <span className="block font-bold text-white text-sm">{test.name}</span>
                      <span className="block text-xs text-biotech-400 font-semibold uppercase tracking-wider mt-0.5">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-400">Patient Resources</h2>
              <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={faq.id}
                    className="bg-[#051107]/90 border border-biotech-900 rounded-2xl overflow-hidden shadow"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className="font-bold text-white pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-biotech-400 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-60 border-t border-biotech-900/40' : 'max-h-0'
                      }`}
                    >
                      <p className="p-6 text-sm text-slate-300 leading-relaxed bg-[#020603]/80">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </section>

      {/* --- CONTACT FORM --- */}
      <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#040e06]/85 border-t border-biotech-900/60 backdrop-blur-md z-10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar copy */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-400">Molecular Portal</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Connect directly with our compounding dispensary.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Need to transfer active clinical prescriptions? Or inquire about custom compounding with rice/potato hypoallergenic binders? Submit our secure, encrypted form and a molecular pharmacist will reply within 15 minutes.
              </p>
            </div>

            <div className="space-y-4 font-semibold text-slate-300">
              <div className="flex items-center space-x-4 bg-[#020603]/60 p-4 rounded-2xl border border-biotech-900/50">
                <div className="bg-biotech-950 text-biotech-400 p-2.5 rounded-xl border border-biotech-900">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-biotech-400 uppercase tracking-widest">Clinical Support</span>
                  <span className="text-sm text-white font-extrabold">+1 (800) BIO-PHAR</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-[#020603]/60 p-4 rounded-2xl border border-biotech-900/50">
                <div className="bg-biotech-950 text-biotech-400 p-2.5 rounded-xl border border-biotech-900">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-biotech-400 uppercase tracking-widest">Enrypted Dispatch</span>
                  <span className="text-sm text-white font-extrabold">consult@centralpharm.com</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-[#020603]/60 p-4 rounded-2xl border border-biotech-900/50">
                <div className="bg-biotech-950 text-biotech-400 p-2.5 rounded-xl border border-biotech-900">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-biotech-400 uppercase tracking-widest">Compounding Center</span>
                  <span className="text-sm text-white font-extrabold">802 Tech Parkway, Portland OR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="lg:col-span-7">
            <div className="bg-[#051107] p-8 sm:p-10 rounded-3xl border border-biotech-900 relative">
              
              {formSubmitted && (
                <div className="absolute inset-0 bg-[#020603]/95 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20 animate-fadeIn">
                  <div className="bg-biotech-950 text-biotech-400 border border-biotech-500/30 p-4 rounded-full mb-4 shadow-glow-green-sm">
                    <Check className="w-12 h-12 stroke-[3px]" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Molecular Query Received!</h3>
                  <p className="text-slate-400 max-w-sm text-sm">
                    Your transmission to Central Pharm was encrypted successfully. A compounding pharmacist will analyze your chemical query and contact you within 15 minutes.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-biotech-600 text-slate-950 font-black rounded-xl text-xs hover:bg-biotech-500 transition-all uppercase tracking-wider"
                  >
                    Send another query
                  </button>
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <span>Dispensary Query Transmission</span>
                <span className="text-[9px] bg-biotech-950 border border-biotech-900 text-biotech-400 px-2 py-0.5 rounded-md uppercase font-black tracking-widest">SECURE SSL</span>
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arthur@wellness.org"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 304-4901"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest">Subject Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white bg-white"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Prescription Transfer">Prescription Transfer</option>
                      <option value="Compounding Request">Compounding Request</option>
                      <option value="Product Sourcing QA">Product Sourcing QA</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your active compound query or compounding recipe instructions..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-700"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-biotech-600 hover:bg-biotech-500 hover:shadow-glow-green text-[#020603] font-black rounded-xl transition-all uppercase tracking-wider"
                  >
                    Transmit Encrypted Query
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative bg-[#020703] text-slate-500 py-16 px-4 sm:px-6 lg:px-8 z-10 border-t border-biotech-900/40 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-biotech-900 pb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-biotech-950 border border-biotech-900 text-biotech-400 p-2 rounded-full">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Central Pharm</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Clinical molecular biology meets high-absorption pharmacological compounding.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Compounds</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#products" className="hover:text-white transition-colors">Vitamins</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Supplements</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">NMN Longevity Matrix</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Synaptic Formulas</a></li>
            </ul>
          </div>

          {/* Standards */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Certifications</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-white transition-colors">99.8% HPLC Pure Assay</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Heavy Metal Screened</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Zero-Additive Guarantee</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Registered Lab Practice</a></li>
            </ul>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Availability</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-biotech-400">
                <span className="h-2 w-2 rounded-full bg-biotech-400 animate-pulse"></span>
                <span>Active 24/7 Cellular Support</span>
              </li>
              <li><span>Clinical Courier: Same-Day Dispatch</span></li>
              <li><span>Compounding: 9 AM - 5 PM PST</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Central Pharm. Licensed Pharmacy practice. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Prescription Licensing</a>
            <a href="#" className="hover:text-white transition-colors">Vercel Deployment Code</a>
          </div>
        </div>
      </footer>

      {/* --- SLIDING FIREBASE LOGIN/REGISTER MODAL OVERLAY --- */}
      {isAuthViewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => { setIsAuthViewOpen(false); setAuthError(''); }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <div className="relative bg-[#051107] border border-biotech-900 max-w-md w-full rounded-3xl p-8 shadow-glow-green border-biotech-500/20 text-left animate-scaleUp z-10 text-white">
            <button
              onClick={() => { setIsAuthViewOpen(false); setAuthError(''); }}
              className="absolute top-4 right-4 p-1.5 bg-biotech-950/60 border border-biotech-900 hover:border-biotech-400 text-biotech-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="bg-biotech-950 border border-biotech-900 text-biotech-400 p-3 rounded-2xl inline-block shadow-inner mb-2">
                  <Lock className="w-6 h-6 animate-pulseGlow" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  {authMode === 'login' ? 'Registered Pharmacist Portal' : 'Register New Staff Profile'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {authMode === 'login' 
                    ? 'Access your clinical prescription inquiries & stock inventory CMS.' 
                    : 'Create a certified credentials profile connected to your Firebase project.'}
                </p>
                
                {/* Mode toggle badge */}
                <span className={`text-[10px] font-bold inline-block px-2.5 py-0.5 rounded-full ${
                  isRealFirebaseActive ? 'bg-emerald-950/80 text-biotech-300 border border-biotech-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}>
                  {isRealFirebaseActive ? '🔥 Connected to production Firebase' : '⚙️ Operating in sandbox mode'}
                </span>
              </div>

              {authError && (
                <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{authError}</p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Pharmacist Email</label>
                  <input
                    type="email"
                    required
                    placeholder="pharmacist@centralpharm.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-biotech-300 uppercase tracking-widest block">Secret Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 bg-[#020603] border border-biotech-900 rounded-xl text-sm focus:ring-4 focus:ring-biotech-950 focus:border-biotech-400 transition-all outline-none text-white placeholder-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Staff Invitation Key input (Displays ONLY during Sign-Up registration mode!) */}
                {authMode === 'register' && (
                  <div className="space-y-1 animate-slideUp">
                    <label className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Staff Invite Passcode *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="dispensary_secret_key"
                      value={authInvitationKey}
                      onChange={(e) => setAuthInvitationKey(e.target.value)}
                      className="w-full px-4 py-3 bg-[#020603] border border-amber-900/60 focus:border-amber-400 rounded-xl text-sm focus:ring-4 focus:ring-amber-950/60 transition-all outline-none text-white placeholder-slate-700"
                    />
                    <span className="text-[9px] text-slate-400 block mt-1 leading-normal">
                      Security Alert: Creation of pharmacist credentials requires authorization via the dispenser key.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-biotech-600 hover:bg-biotech-500 hover:shadow-glow-green disabled:opacity-50 text-[#020603] font-black rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  {authLoading ? (
                    <span>Verifying details...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{authMode === 'login' ? 'Authenticate Profile' : 'Register Profile'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer switch modes */}
              <div className="text-center text-xs space-y-2 border-t border-biotech-900/50 pt-4">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-biotech-400 hover:text-white font-bold"
                >
                  {authMode === 'login' 
                    ? 'No staff account? Register profile' 
                    : 'Already registered? Login to portal'}
                </button>
                
                {!isRealFirebaseActive && authMode === 'login' && (
                  <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                    Sandbox Credentials: <strong className="text-slate-200 block">email: pharmacist@centralpharm.com password: password123</strong>
                  </p>
                )}

                {authMode === 'register' && (
                  <p className="text-[10px] text-amber-400/80 leading-normal max-w-xs mx-auto">
                    Sandbox Invite Passcode: <strong className="text-amber-200 block">CENTRAL_DISPENSARY_2026</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING REGISTERED PHARMACIST LIVE CHAT TRIGGER --- */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
        {isChatOpen ? (
          /* Live Chat box */
          <div className="w-[340px] sm:w-[380px] bg-[#051107] border border-biotech-900 rounded-3xl shadow-glow-green flex flex-col justify-between overflow-hidden animate-slideUp text-white">
            {/* Chat header */}
            <div className="bg-[#020603] border-b border-biotech-900 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-biotech-950 text-biotech-400 border border-biotech-900 text-lg w-10 h-10 flex items-center justify-center rounded-full font-bold">
                    🌿
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-biotech-400 border border-[#020603]"></span>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-white">Sarah, PharmD</span>
                  <span className="block text-[10px] text-biotech-400 font-medium">Certified Bio-Pharmacist</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-[#020603]/80 rounded-full text-biotech-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-72 p-4 overflow-y-auto space-y-3.5 bg-[#020603]/40">
              {chatMessages.map((msg, index) => {
                const isBot = msg.sender === 'bot'
                return (
                  <div
                    key={index}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed text-left ${
                        isBot
                          ? 'bg-[#020603] border border-biotech-900 text-slate-200 rounded-tl-none'
                          : 'bg-biotech-600 text-slate-950 font-semibold rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef}></div>
            </div>

            {/* Message input */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-biotech-900/50 bg-[#020603] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Sarah (e.g. molecular structures, delivery)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#051107] border border-biotech-900 rounded-2xl text-xs outline-none focus:border-biotech-400 text-white transition-all placeholder-slate-600"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-biotech-600 hover:bg-biotech-500 disabled:opacity-50 text-slate-950 rounded-xl transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Compact float trigger button */
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center space-x-2 bg-[#051107] border border-biotech-900 text-biotech-300 hover:text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group hover:border-biotech-400/40 hover:shadow-glow-green-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-biotech-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-biotech-400"></span>
            </span>
            <MessageSquare className="w-5 h-5 fill-white/10" />
            <span className="text-xs font-black tracking-widest uppercase">Consult AI</span>
          </button>
        )}
      </div>

      {/* --- DETAILED PRODUCT DIALOG MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Modal Container */}
          <div className="relative bg-[#051107] border border-biotech-900 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-scaleUp text-left text-white">
            
            {/* Visual Header Banner */}
            <div className="bg-[#020603] p-8 flex items-center justify-center text-8xl relative border-b border-biotech-900/50">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-[#051107] border border-biotech-900 hover:border-biotech-400 text-biotech-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span>{selectedProduct.icon}</span>
              <span className="absolute bottom-4 left-6 bg-biotech-950 border border-biotech-900 text-biotech-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedProduct.category}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs mb-1 bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/30 max-w-max">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{selectedProduct.rating} Verified Clinical Rating</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">{selectedProduct.name}</h3>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Formulation Key Features list */}
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] font-extrabold text-biotech-400 uppercase tracking-widest">Molecular Integrity</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProduct.features && selectedProduct.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                      <div className="bg-biotech-950 text-biotech-400 border border-biotech-900 p-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Footer mock */}
              <div className="pt-6 border-t border-biotech-900/30 flex items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold text-biotech-400 block uppercase tracking-wider">Active Cost</span>
                  <span className="text-2xl font-black text-white">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex space-x-3 flex-1 justify-end">
                  <button
                    onClick={() => {
                      setSelectedProduct(null)
                      const section = document.getElementById('contact')
                      if (section) section.scrollIntoView({ behavior: 'smooth' })
                      setFormData(prev => ({
                        ...prev,
                        subject: 'Compounding Request',
                        message: `Hello Central Pharm! I am highly interested in the compound formula "${selectedProduct.name}" and would like to coordinate custom delivery and absorption options. Please contact me!`
                      }))
                    }}
                    className="px-5 py-3 bg-biotech-600 hover:bg-biotech-500 hover:shadow-glow-green text-slate-950 font-black rounded-xl text-xs transition-all w-full text-center uppercase tracking-wider"
                  >
                    Consult Dispatch
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
