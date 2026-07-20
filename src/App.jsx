import React, { useState, useEffect, useRef } from 'react'
import ThreeCanvas from './components/ThreeCanvas'
import Logo from './components/Logo'
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

  // REAL SECURE STAFF INVITATION CODE (updated to match user requirements)
  const SECRET_STAFF_INVITATION_CODE = "31051982"

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
          colors: ['#00ff66', '#ffffff']
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
          colors: ['#00ff66', '#ffffff']
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
      colors: ['#00ff66', '#ffffff', '#052410']
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
      colors: ['#00ff66', '#ffffff']
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

  // Render Admin Dashboard (FULL SCREEN WHITE-AND-DARK-GREEN PORTAL)
  if (isDashboardActive && user) {
    return (
      <div className="min-h-screen bg-[#052410] text-slate-800 flex flex-col justify-between selection:bg-biotech-200 selection:text-biotech-950 font-sans font-medium">
        
        {/* Dashboard Top Header */}
        <header className="bg-white border-b border-biotech-100 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Branding with Custom Logo Component */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsDashboardActive(false)}>
              <Logo className="h-10" textClassName="text-slate-900" />
              <span className="hidden md:inline text-xs bg-biotech-950 text-white font-extrabold px-2.5 py-0.5 rounded-md tracking-widest uppercase">ADMIN</span>
            </div>

            {/* Dashboard Tabs for Wide Screen */}
            <div className="hidden md:flex space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setDashboardTab('inventory')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  dashboardTab === 'inventory'
                    ? 'bg-white text-biotech-950 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Package className="w-4.5 h-4.5 text-biotech-800" />
                <span>Manage Store Inventory ({productsList.length})</span>
              </button>
              <button
                onClick={() => setDashboardTab('inbox')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  dashboardTab === 'inbox'
                    ? 'bg-white text-biotech-950 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Inbox className="w-4.5 h-4.5 text-biotech-800" />
                <span>Patient Inquiries ({submissions.length})</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Secondary user identification status */}
              <div className="hidden lg:block text-right pr-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Authorized Session</span>
                <span className="text-xs text-slate-900 font-extrabold block mt-0.5 truncate max-w-[150px]">{user.email}</span>
              </div>

              <button
                onClick={() => setIsDashboardActive(false)}
                className="flex items-center space-x-1.5 px-4 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Public Portal</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 w-11 h-11 rounded-xl transition-all shadow-sm"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden border-t border-slate-200 flex p-2 bg-slate-50">
            <button
              onClick={() => setDashboardTab('inventory')}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 text-xs font-extrabold rounded-xl transition-all ${
                dashboardTab === 'inventory' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-500'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              <span>Inventory</span>
            </button>
            <button
              onClick={() => setDashboardTab('inbox')}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 text-xs font-extrabold rounded-xl transition-all ${
                dashboardTab === 'inbox' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-500'
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
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-biotech-100 shadow-xl text-left space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-biotech-700" />
                    <span>Register Bio-Active Stock</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Register molecular structures instantly into the storefront active catalog.</p>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zinc Peptide"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none bg-white"
                      >
                        <option value="Medicines">Medicines</option>
                        <option value="Supplements">Supplements</option>
                        <option value="Vitamins">Vitamins</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="19.99"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Badge</label>
                      <select
                        value={newProduct.badge}
                        onChange={(e) => setNewProduct({...newProduct, badge: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none bg-white"
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
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Emoji Icon</label>
                      <select
                        value={newProduct.icon}
                        onChange={(e) => setNewProduct({...newProduct, icon: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none bg-white text-base"
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
                    <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Molecular Action / Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write how this item targets cellular receptors and its direct biological benefits..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest block">Key Features (comma separated)</label>
                    <input
                      type="text"
                      placeholder="99.8% Certified Purity, Liposomal, Lab-Tested"
                      value={newProduct.featuresRaw}
                      onChange={(e) => setNewProduct({...newProduct, featuresRaw: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-biotech-800 hover:bg-biotech-700 text-white font-black rounded-xl shadow-md transition-colors text-sm uppercase tracking-wider"
                  >
                    Commit Molecular Structure
                  </button>
                </form>
              </div>

              {/* Right Column: Inventory database directory list */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-biotech-100 shadow-xl text-left space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                    <Database className="w-5 h-5 text-biotech-700" />
                    <span>Active Stock Directory ({productsList.length} items)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Deregistering any medicine immediately removes it from the customer storefront.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                  {productsList.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      <div className="flex items-center space-x-3 text-left overflow-hidden">
                        <span className="text-4xl bg-white p-2.5 rounded-xl border border-slate-100 flex-shrink-0">{prod.icon}</span>
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-900 text-sm block leading-tight truncate">{prod.name}</span>
                          <span className="text-[10px] text-biotech-700 font-extrabold uppercase tracking-wider block mt-1">
                            {prod.category}
                          </span>
                          <span className="text-xs text-slate-500 font-bold block mt-0.5">${prod.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-3 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-colors flex-shrink-0"
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-biotech-100 shadow-xl text-left space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-biotech-700" />
                  <span>Clinical Prescription Inbox ({submissions.length} queries)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Check automated prescription transfers, compounding formulations, and clinical genetic inquiries.</p>
              </div>

              {submissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`border rounded-2xl p-6 transition-all relative ${
                        sub.status === 'Unread'
                          ? 'bg-biotech-50 border-biotech-200 shadow-sm'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <span className="block font-bold text-slate-950 text-base">{sub.name}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{sub.date}</span>
                          <span className="text-xs font-semibold text-biotech-700 block mt-1">{sub.email}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleReadStatus(sub.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              sub.status === 'Unread'
                                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {sub.status}
                          </button>
                          <button
                            onClick={() => deleteSubmission(sub.id)}
                            className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 transition-colors"
                            title="Delete query"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-xs font-bold text-biotech-800 bg-biotech-100 px-3 py-1 rounded-full uppercase tracking-wider border border-biotech-200">
                          {sub.subject}
                        </span>
                      </div>

                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/50 font-medium">
                        {sub.message}
                      </p>

                      {sub.phone && sub.phone !== 'Not provided' && (
                        <div className="mt-3 text-xs font-semibold text-biotech-800">
                          📞 Callback contact: <span className="font-extrabold text-slate-900">{sub.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 max-w-sm mx-auto space-y-4">
                  <div className="bg-slate-50 text-slate-400 p-6 rounded-full inline-block border border-slate-100">
                    <Inbox className="w-10 h-10" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Inbox is completely empty</h4>
                  <p className="text-sm text-slate-500">
                    Patient consultation transmissions will map here instantly.
                  </p>
                </div>
              )}
            </div>
          )}

        </main>

        {/* Dashboard Footer */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Central Pharm Biotech. Licensed Molecular Pharmacy Practice.</p>
            <button
              onClick={() => setIsDashboardActive(false)}
              className="text-biotech-800 hover:text-biotech-950 font-bold flex items-center space-x-1.5"
            >
              <span>Exit Dashboard View</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </footer>

      </div>
    )
  }

  // STANDARD PUBLIC PORTAL: Crisp white card containers overlaid on dark forest-green 3D canvas background!
  return (
    <div className="relative min-h-screen bg-[#052410] text-white selection:bg-biotech-200 selection:text-biotech-950 overflow-x-hidden font-sans">
      
      {/* ThreeJS Background Canvas */}
      <ThreeCanvas />

      {/* --- HEADER & NAVIGATION --- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-biotech-100/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Custom Logo Component */}
            <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo className="h-10" textClassName="text-slate-900" />
            </div>

            {/* Desktop Nav (Clean dark green text on white header) */}
            <nav className="hidden md:flex items-center space-x-8 font-bold text-biotech-800">
              <a href="#hero" className="hover:text-biotech-500 transition-colors">Home</a>
              <a href="#services" className="hover:text-biotech-500 transition-colors">Ethos</a>
              <a href="#products" className="hover:text-biotech-500 transition-colors">Catalog</a>
              <a href="#about" className="hover:text-biotech-500 transition-colors">About</a>
              <a href="#faq" className="hover:text-biotech-500 transition-colors">FAQs</a>
              <a href="#contact" className="hover:text-biotech-500 transition-colors">Inquire</a>
              
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
                className="flex items-center space-x-1.5 px-4 h-11 border border-biotech-200 rounded-full text-sm font-bold text-biotech-800 hover:bg-biotech-50 hover:border-biotech-400 transition-all shadow-sm"
              >
                <Lock className="w-4 h-4 text-biotech-600" />
                <span>{user ? 'Staff Portal' : 'Pharmacist Login'}</span>
                {!user && submissions.filter(s => s.status === 'Unread').length > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                    {submissions.filter(s => s.status === 'Unread').length}
                  </span>
                )}
              </button>

              <a
                href="#products"
                className="flex items-center justify-center px-5 h-11 bg-biotech-800 hover:bg-biotech-700 text-white rounded-full text-sm font-extrabold shadow active:scale-95 transition-all"
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
                className="relative p-2 text-biotech-800 hover:text-biotech-600"
                title="Staff Portal"
              >
                <Lock className="w-5 h-5" />
                {!user && submissions.filter(s => s.status === 'Unread').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {submissions.filter(s => s.status === 'Unread').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-biotech-800 hover:text-biotech-600 focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-biotech-100 backdrop-blur-lg animate-fadeIn text-left shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-3">
              <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-biotech-800 hover:bg-slate-50">Home</a>
              <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-biotech-800 hover:bg-slate-50">Ethos</a>
              <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-biotech-800 hover:bg-slate-50">Catalog</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-biotech-800 hover:bg-slate-50">About</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-biotech-800 hover:bg-slate-50">FAQs</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-biotech-800 hover:bg-slate-50">Inquire</a>
              
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
                  className="w-full text-center block py-3 bg-biotech-800 text-white font-black rounded-xl"
                >
                  Explore Molecules
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SECTION (Text remains glowing white overlay on top of deep green 3D background canvas) --- */}
      <section id="hero" className="relative min-h-[calc(100vh-80px)] flex items-center justify-start py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10 text-left">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-bold text-xs tracking-wider uppercase animate-float max-w-max">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>🧬 ADVANCED BIO-PHARMACOLOGY</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Optimize your biology. <span className="text-transparent bg-clip-text bg-gradient-to-r from-biotech-300 to-white underline decoration-white/40 decoration-8 underline-offset-4">Extend lifespan.</span>
            </h1>

            <p className="text-lg text-slate-200 max-w-xl leading-relaxed">
              Welcome to <strong className="text-white font-extrabold">Central Pharm</strong>, where clinical microbiology converges with molecular health optimization. Explore high-absorption vitamins, heavy-metal-free compounds, and 24/7 registered pharmacist support.
            </p>

            {/* Quick interactive search banner in Hero */}
            <div className="p-1.5 bg-white/95 border border-biotech-100 rounded-2xl flex flex-col sm:flex-row items-center gap-2 max-w-lg shadow-2xl backdrop-blur-md">
              <div className="flex items-center space-x-3 w-full px-3 py-2 text-slate-500">
                <Search className="w-5 h-5 text-biotech-700" />
                <input
                  type="text"
                  placeholder="Query molecular structures (e.g. NMN, Omega-3, D3...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    const section = document.getElementById('products')
                    if (section) section.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-transparent border-0 text-slate-900 focus:outline-none focus:ring-0 placeholder-slate-400 text-sm w-full font-semibold"
                />
              </div>
              <a
                href="#products"
                className="w-full sm:w-auto flex h-12 px-6 items-center justify-center bg-biotech-800 hover:bg-biotech-700 text-white font-black rounded-xl whitespace-nowrap transition-all shadow hover:translate-x-1"
              >
                Search Index
              </a>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md border-t border-white/20">
              <div>
                <span className="block text-2xl font-black text-white">99.8%</span>
                <span className="block text-xs font-semibold text-biotech-200">Certified Purity</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">Zero</span>
                <span className="block text-xs font-semibold text-biotech-200">Synthetic Fillers</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">24/7</span>
                <span className="block text-xs font-semibold text-biotech-200">Active Support</span>
              </div>
            </div>
          </div>

          {/* Interactive floating model helper tag in Desktop */}
          <div className="hidden lg:col-span-5 lg:flex flex-col justify-end items-end space-y-4">
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-[280px] pointer-events-auto transform hover:-translate-y-2 transition-transform duration-300 text-left">
              <div className="flex items-center space-x-2 text-white font-bold mb-1">
                <Info className="w-5 h-5 text-biotech-300" />
                <span className="text-sm">Interactive 3D Art</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Scroll the webpage to see the DNA helix and white-green molecular pills align. Drag elements around with your cursor!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES / ETHOS SECTION (Gorgeous White Cards floating on Dark Green) --- */}
      <section id="services" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#041c0c]/85 border-y border-white/10 backdrop-blur-sm z-10 text-left">
        <div className="max-w-7xl mx-auto">
          {/* Section title */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-300">Biological Integrity</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Advanced Clinical Diagnostics & Formulation
            </p>
            <p className="text-slate-300 leading-relaxed">
              Standard pharmacies output millions of tons of synthetic chemical binders and microplastics. Central Pharm is designed with molecular-level biological integrity.
            </p>
          </div>

          {/* Services Cards Grid (Bright crisp white backgrounds!) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between text-slate-800"
              >
                <div className="space-y-4">
                  <div className="bg-[#f0fdf4] text-biotech-800 p-4 rounded-2xl inline-block shadow-inner">
                    <ServiceIcon name={srv.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{srv.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{srv.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-biotech-800">
                  <span>{srv.benefit}</span>
                  {srv.id === 'serv-1' && (
                    <span className="flex items-center space-x-1 bg-biotech-100 text-biotech-900 px-2.5 py-0.5 rounded-full text-[10px] animate-pulse">
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
      <section id="products" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-transparent backdrop-blur-sm z-10 text-left">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-300">Diagnostics Index</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                Biotech Longevity Repository
              </p>
              <p className="text-slate-200 max-w-xl leading-relaxed">
                Query, filter, and inspect our live directory of ethically formulated active compounds, telomere catalysts, and brain probiotics.
              </p>
            </div>

            {/* Filter Tabs (White and dark green) */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl max-w-max shadow-lg border border-slate-100">
              {['All', 'Medicines', 'Supplements', 'Vitamins'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-biotech-800 text-white shadow-md'
                      : 'text-biotech-800 hover:text-biotech-950'
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
              <Search className="h-5 w-5 text-biotech-700" />
            </div>
            <input
              type="text"
              placeholder="Filter by chemical features, active compounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-white/95 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-biotech-100 focus:border-biotech-500 transition-all outline-none font-semibold shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Products Grid (Crisp clean white cards!) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl hover:shadow-biotech-500/10 hover:border-biotech-300 transform hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between text-slate-800"
                >
                  <div>
                    {/* Badge and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-[#e0fdf4] text-biotech-900 border border-biotech-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {product.badge}
                      </span>
                      <span className="flex items-center text-amber-500 font-extrabold text-xs bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500 mr-1" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Product visual mock */}
                    <div className="aspect-video bg-slate-50 rounded-2xl flex items-center justify-center text-5xl group-hover:scale-102 border border-slate-100 transition-all duration-300 relative overflow-hidden shadow-inner mb-4">
                      <span>{product.icon}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-100/30 to-transparent"></div>
                    </div>

                    {/* Name & Category */}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-biotech-500 block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-biotech-800 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Active Cost</span>
                      <span className="text-xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                    </div>
                    <button
                      className="px-4.5 py-2.5 bg-biotech-800 hover:bg-biotech-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-xl mx-auto text-slate-800">
              <div className="bg-biotech-50 text-biotech-800 p-4 rounded-full inline-block mb-4 border border-biotech-100">
                <AlertCircle className="w-10 h-10 animate-pulseGlow" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Molecular index empty</h3>
              <p className="text-slate-600 text-sm">
                No active formulas found for category "{selectedCategory}" matching: <strong className="text-biotech-800">"{searchQuery}"</strong>. Try checking 'B12', 'silver', or 'peptide'.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-6 px-5 py-2.5 bg-biotech-800 text-white font-bold rounded-xl text-xs hover:bg-biotech-700 transition-all"
              >
                Reset Search Index
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- ABOUT US / CLINICAL STORY (White containers) --- */}
      <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#041c0c]/95 border-y border-white/10 backdrop-blur-md z-10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Static imagery represent (Pristine White Card) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 space-y-6 text-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-widest text-biotech-600 block">Laboratory Standards</span>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-biotech-50 text-biotech-800 border border-biotech-100 rounded-xl mt-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Clinical Molecular Practice</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Fully accredited by the Board of Advanced Pharmacological Standards.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-biotech-50 text-biotech-800 border border-biotech-100 rounded-xl mt-1">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Ultra-Pure Sourcing</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Operating under heavy-metal-free protocols, yielding 99.8% pure assays.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-biotech-50 text-biotech-800 border border-biotech-100 rounded-xl mt-1">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Thermal Locked Logistics</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Active molecular formulations are locked in temperature-controlled pods.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded-2xl flex items-center space-x-3 text-xs text-biotech-800 leading-relaxed font-bold">
                <span>⚡</span>
                <p>We leverage high-performance liquid chromatography (HPLC) to verify active molecule counts in every batch.</p>
              </div>
            </div>
          </div>

          {/* Story Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-300">About Central Pharm</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Pioneering custom bio-compounding and cellular longevity.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Founded in 2024, Central Pharm emerged from a group of environmental toxicologists and compound formulation chemists who set out to reinvent the standard pharmacy model.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We operate state-of-the-art bio-compounding laboratories where we tailor molecular compounds directly for your biological requirements, using exclusively hypoallergenic plant carriers and eliminating synthetic binding excipients completely.
            </p>
            <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row gap-6">
              <div className="space-y-1">
                <span className="block text-3xl font-black text-white">99.8%</span>
                <span className="block text-xs text-biotech-300 font-semibold uppercase tracking-wider">Molar Purity Assay</span>
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black text-white">Zero</span>
                <span className="block text-xs text-biotech-300 font-semibold uppercase tracking-wider">Titanium Dioxide</span>
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black text-white">24/7</span>
                <span className="block text-xs text-biotech-300 font-semibold uppercase tracking-wider">Active Monitoring</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- TESTIMONIALS & FAQ (Bright white cards) --- */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-transparent backdrop-blur-sm z-10 text-left text-slate-800">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Testimonials */}
          <div>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-200">Clinical Reviews</h2>
              <p className="text-3xl font-extrabold text-white">Bio-Hacking Patient Testimonials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl relative"
                >
                  <div className="absolute -top-5 left-8 text-3xl bg-[#f0fdf4] w-11 h-11 flex items-center justify-center rounded-2xl border border-biotech-100 shadow-sm">
                    {test.avatar}
                  </div>
                  <div className="pt-4 space-y-4 text-left">
                    <div className="flex space-x-1 text-amber-500">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      "{test.quote}"
                    </p>
                    <div className="pt-4 border-t border-slate-100">
                      <span className="block font-bold text-slate-900 text-sm">{test.name}</span>
                      <span className="block text-xs text-biotech-700 font-semibold uppercase tracking-wider mt-0.5">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-200">Patient Resources</h2>
              <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-biotech-700 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-60 border-t border-slate-100' : 'max-h-0'
                      }`}
                    >
                      <p className="p-6 text-sm text-slate-600 leading-relaxed bg-[#f0fdf4]/40 text-left">
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

      {/* --- CONTACT FORM (Pristine White Containers) --- */}
      <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#041c0c]/90 border-t border-white/10 backdrop-blur-md z-10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar copy */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-biotech-300">Molecular Portal</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Connect directly with our compounding dispensary.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Need to transfer active clinical prescriptions? Or inquire about custom compounding with rice/potato hypoallergenic binders? Submit our secure, encrypted form and a molecular pharmacist will reply within 15 minutes.
              </p>
            </div>

            <div className="space-y-4 font-bold text-slate-300">
              <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="bg-white text-biotech-950 p-2.5 rounded-xl border border-biotech-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-biotech-200 uppercase tracking-widest">Clinical Support</span>
                  <span className="text-sm text-white font-extrabold">+1 (800) BIO-PHAR</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="bg-white text-biotech-950 p-2.5 rounded-xl border border-biotech-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-biotech-200 uppercase tracking-widest">Enrypted Dispatch</span>
                  <span className="text-sm text-white font-extrabold">consult@centralpharm.com</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="bg-white text-biotech-950 p-2.5 rounded-xl border border-biotech-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-biotech-200 uppercase tracking-widest">Compounding Center</span>
                  <span className="text-sm text-white font-extrabold">802 Tech Parkway, Portland OR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form container (Crisp White Card) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-2xl text-slate-800">
              
              {formSubmitted && (
                <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20 animate-fadeIn text-slate-800">
                  <div className="bg-[#f0fdf4] text-biotech-800 border border-[#bbf7d0] p-4 rounded-full mb-4 shadow-sm">
                    <Check className="w-12 h-12 stroke-[3px]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Molecular Query Received!</h3>
                  <p className="text-slate-600 max-w-sm text-sm font-medium">
                    Your transmission to Central Pharm was encrypted successfully. A compounding pharmacist will analyze your chemical query and contact you within 15 minutes.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-biotech-800 text-white font-black rounded-xl text-xs hover:bg-biotech-750 transition-all uppercase tracking-wider"
                  >
                    Send another query
                  </button>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <span>Dispensary Query Transmission</span>
                <span className="text-[9px] bg-biotech-50 border border-biotech-200 text-biotech-800 px-2 py-0.5 rounded-md uppercase font-black tracking-widest">SECURE SSL</span>
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arthur@wellness.org"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 304-4901"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Subject Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none bg-white font-semibold text-slate-900"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Prescription Transfer">Prescription Transfer</option>
                      <option value="Compounding Request">Compounding Request</option>
                      <option value="Product Sourcing QA">Product Sourcing QA</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your active compound query or compounding recipe instructions..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none font-semibold text-slate-900"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-biotech-800 hover:bg-biotech-750 text-white font-black rounded-xl transition-all uppercase tracking-wider text-sm shadow-md shadow-biotech-950/20"
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
      <footer className="relative bg-[#031509] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
          {/* Brand with Logo */}
          <div className="space-y-4">
            <Logo className="h-10" textClassName="text-white" />
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

          <div className="relative bg-white border border-slate-100 max-w-md w-full rounded-3xl p-8 shadow-2xl text-left animate-scaleUp z-10 text-slate-800">
            <button
              onClick={() => { setIsAuthViewOpen(false); setAuthError(''); }}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-biotech-800 p-3 rounded-2xl inline-block shadow-inner mb-2">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  {authMode === 'login' ? 'Registered Pharmacist Portal' : 'Register New Staff Profile'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {authMode === 'login' 
                    ? 'Access your clinical prescription inquiries & stock inventory CMS.' 
                    : 'Create a certified credentials profile connected to your Firebase project.'}
                </p>
                
                {/* Mode toggle badge */}
                <span className={`text-[10px] font-bold inline-block px-2.5 py-0.5 rounded-full ${
                  isRealFirebaseActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isRealFirebaseActive ? '🔥 Connected to production Firebase' : '⚙️ Operating in sandbox mode'}
                </span>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{authError}</p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Pharmacist Email</label>
                  <input
                    type="email"
                    required
                    placeholder="pharmacist@centralpharm.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Secret Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-biotech-100 focus:bg-white focus:border-biotech-600 transition-all outline-none font-semibold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Staff Invitation Key input (Displays ONLY during Sign-Up registration mode!) */}
                {authMode === 'register' && (
                  <div className="space-y-1 animate-slideUp">
                    <label className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest block flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Staff Invite Passcode *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="31051982"
                      value={authInvitationKey}
                      onChange={(e) => setAuthInvitationKey(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-amber-300 focus:border-amber-500 rounded-xl text-sm focus:ring-4 focus:ring-amber-100 transition-all outline-none text-slate-900 font-semibold"
                    />
                    <span className="text-[9px] text-slate-400 block mt-1 leading-normal text-left">
                      Security Alert: Creation of pharmacist credentials requires authorization via the dispenser key.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-biotech-800 hover:bg-biotech-750 disabled:opacity-50 text-white font-black rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-biotech-950/10"
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
              <div className="text-center text-xs space-y-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-biotech-800 hover:text-biotech-950 font-bold"
                >
                  {authMode === 'login' 
                    ? 'No staff account? Register profile' 
                    : 'Already registered? Login to portal'}
                </button>
                
                {!isRealFirebaseActive && authMode === 'login' && (
                  <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                    Sandbox Credentials: <strong className="text-slate-700 block mt-0.5">email: pharmacist@centralpharm.com<br />password: password123</strong>
                  </p>
                )}

                {authMode === 'register' && (
                  <p className="text-[10px] text-amber-600 leading-normal max-w-xs mx-auto">
                    Sandbox Invite Passcode: <strong className="text-amber-800 block">31051982</strong>
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
          <div className="w-[340px] sm:w-[380px] bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-slideUp text-slate-800">
            {/* Chat header */}
            <div className="bg-biotech-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-[#f0fdf4] text-biotech-900 text-lg w-10 h-10 flex items-center justify-center rounded-full font-bold">
                    🌿
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border border-biotech-800"></span>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-white">Sarah, PharmD</span>
                  <span className="block text-[10px] text-biotech-200 font-semibold">Certified Bio-Pharmacist</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-biotech-750 rounded-full text-biotech-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-72 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
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
                          ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-xs'
                          : 'bg-biotech-800 text-white rounded-tr-none shadow-xs'
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
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Sarah (e.g. molecular structures, delivery)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-biotech-400 text-slate-800 transition-all font-semibold"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-biotech-800 hover:bg-biotech-700 disabled:opacity-50 text-white rounded-xl transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Compact float trigger button */
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-biotech-800 hover:text-biotech-950 px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group hover:border-biotech-400"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-biotech-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-biotech-400"></span>
            </span>
            <MessageSquare className="w-5 h-5 fill-[#f0fdf4]" />
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
          <div className="relative bg-white border border-slate-100 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-scaleUp text-left text-slate-800">
            
            {/* Visual Header Banner */}
            <div className="bg-[#f0fdf4] p-8 flex items-center justify-center text-8xl relative border-b border-biotech-100">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span>{selectedProduct.icon}</span>
              <span className="absolute bottom-4 left-6 bg-white border border-biotech-100 text-biotech-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedProduct.category}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <div className="flex items-center space-x-2 text-amber-500 font-extrabold text-xs mb-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 max-w-max">
                  <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                  <span>{selectedProduct.rating} Verified Clinical Rating</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">{selectedProduct.name}</h3>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Formulation Key Features list */}
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] font-extrabold text-biotech-500 uppercase tracking-widest">Molecular Integrity</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProduct.features && selectedProduct.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                      <div className="bg-[#f0fdf4] text-biotech-800 border border-biotech-100 p-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Footer mock */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Active Cost</span>
                  <span className="text-2xl font-black text-slate-900">${selectedProduct.price.toFixed(2)}</span>
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
                    className="px-5 py-3 bg-biotech-800 hover:bg-biotech-700 text-white font-black rounded-xl text-xs transition-all w-full text-center uppercase tracking-wider shadow-md"
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
