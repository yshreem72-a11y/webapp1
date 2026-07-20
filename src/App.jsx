import React, { useState, useEffect, useRef } from 'react'
import ThreeCanvas from './components/ThreeCanvas'
import { products } from './data/products'
import { services, testimonials, faqs } from './data/siteData'
import confetti from 'canvas-confetti'
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
  Info
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
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Live Chat Simulator State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am Sarah, your registered pharmacist. How can I assist you with your health and wellness today? 🌿' }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null)

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

  // Load submissions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('central_pharm_submissions')
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse submissions", e)
      }
    } else {
      // Add a couple of realistic initial dummy messages so the inbox has content!
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
  }, [])

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isChatOpen])

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
      colors: ['#4ade80', '#86efac', '#22c55e', '#ffffff']
    })

    setFormSubmitted(true)
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })

    // Reset success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false)
    }, 5000)
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
      let responseText = "Thank you for sharing. Let me check that for you. Is there any particular symptom you are noticing?"
      const inputLower = chatInput.toLowerCase()
      
      if (inputLower.includes('hello') || inputLower.includes('hi')) {
        responseText = "Hello there! What wellness questions can I answer for you today? 🌿"
      } else if (inputLower.includes('delivery') || inputLower.includes('shipping')) {
        responseText = "We offer same-day delivery on all orders using electric cargo bikes. If you order before 2 PM, it will arrive today! 🚲"
      } else if (inputLower.includes('prescription') || inputLower.includes('rx')) {
        responseText = "Transferring a prescription is incredibly easy! We handle everything. Just fill out our contact form below or give us a direct call at +1 (800) ECO-PHAR."
      } else if (inputLower.includes('supplement') || inputLower.includes('vitamin')) {
        responseText = "All our supplements are third-party tested and vegan. You can search our live database right on this page! Let me know if you need specific product recommendations."
      } else if (inputLower.includes('organic') || inputLower.includes('natural')) {
        responseText = "Indeed! We focus heavily on natural, plant-derived alternatives with zero toxic binders or microplastics."
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: responseText }])
    }, 1200)
  }

  // Filter and Search Products
  const filteredProducts = products.filter(product => {
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

  return (
    <div className="relative min-h-screen selection:bg-pharm-200 selection:text-pharm-900">
      
      {/* ThreeJS Background Canvas */}
      <ThreeCanvas />

      {/* --- HEADER & NAVIGATION --- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-pharm-100/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="bg-pharm-100 text-pharm-700 p-2.5 rounded-full shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-6 h-6 fill-pharm-500/10" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-pharm-950 block">Central Pharm</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-pharm-600 block -mt-1">Organic & Wellness</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8 font-medium text-slate-600">
              <a href="#hero" className="hover:text-pharm-700 transition-colors">Home</a>
              <a href="#services" className="hover:text-pharm-700 transition-colors">Our Ethos</a>
              <a href="#products" className="hover:text-pharm-700 transition-colors">Live Products</a>
              <a href="#about" className="hover:text-pharm-700 transition-colors">About Us</a>
              <a href="#faq" className="hover:text-pharm-700 transition-colors">FAQs</a>
              <a href="#contact" className="hover:text-pharm-700 transition-colors">Contact</a>
            </nav>

            {/* CTA & Admin Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center space-x-1.5 px-4 h-11 border border-pharm-200 rounded-full text-sm font-semibold text-pharm-700 hover:bg-pharm-50 transition-all shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Pharmacist Inbox</span>
                {submissions.filter(s => s.status === 'Unread').length > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                    {submissions.filter(s => s.status === 'Unread').length}
                  </span>
                )}
              </button>

              <a
                href="#products"
                className="flex items-center justify-center px-5 h-11 bg-pharm-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-pharm-700 active:scale-95 transition-all"
              >
                Shop Natural
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="relative p-2 text-pharm-700 hover:bg-pharm-50 rounded-full"
                title="Admin Inbox"
              >
                <Lock className="w-5 h-5" />
                {submissions.filter(s => s.status === 'Unread').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {submissions.filter(s => s.status === 'Unread').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full text-pharm-800 hover:bg-pharm-50 focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-pharm-100/50 backdrop-blur-lg animate-fadeIn">
            <div className="px-4 pt-2 pb-6 space-y-3">
              <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-pharm-50 text-pharm-950">Home</a>
              <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-pharm-50 text-pharm-950">Our Ethos</a>
              <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-pharm-50 text-pharm-950">Live Products</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-pharm-50 text-pharm-950">About Us</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-pharm-50 text-pharm-950">FAQs</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-pharm-50 text-pharm-950">Contact</a>
              <div className="pt-2">
                <a
                  href="#products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center block py-3 bg-pharm-600 text-white font-bold rounded-xl shadow-md hover:bg-pharm-700"
                >
                  Shop Natural
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative min-h-[calc(100vh-80px)] flex items-center justify-start py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-pharm-100/80 border border-pharm-200/50 backdrop-blur-md px-4 py-1.5 rounded-full text-pharm-800 font-bold text-xs tracking-wider uppercase animate-float max-w-max">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>🌿 Purely Sourced • Safely Delivered</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              A smarter, <span className="text-pharm-700 underline decoration-pharm-200 decoration-8 underline-offset-4">greener</span> pharmacy for modern life.
            </h1>

            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Welcome to <strong className="text-pharm-950 font-bold">Central Pharm</strong>, where modern biological science converges with environmental sustainability. Explore certified plant-derived vitamins, sustainable organic formulations, and enjoy 24/7 registered pharmacist support.
            </p>

            {/* Quick interactive search banner in Hero */}
            <div className="p-1.5 bg-white/80 border border-pharm-100 rounded-2xl flex flex-col sm:flex-row items-center gap-2 max-w-lg shadow-lg shadow-pharm-100/30 backdrop-blur-md">
              <div className="flex items-center space-x-3 w-full px-3 py-2 text-slate-400">
                <Search className="w-5 h-5 text-pharm-600" />
                <input
                  type="text"
                  placeholder="Quick search (e.g. Omega-3, B12, Collagen...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    const section = document.getElementById('products')
                    if (section) section.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-transparent border-0 text-slate-800 focus:outline-none focus:ring-0 placeholder-slate-400 text-sm w-full"
                />
              </div>
              <a
                href="#products"
                className="w-full sm:w-auto flex h-12 px-6 items-center justify-center bg-pharm-600 hover:bg-pharm-700 text-white font-bold rounded-xl whitespace-nowrap transition-all shadow-md hover:translate-x-1"
              >
                Find Now
              </a>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md border-t border-pharm-100/50">
              <div>
                <span className="block text-2xl font-extrabold text-pharm-900">100%</span>
                <span className="block text-xs font-medium text-slate-500">Plant-Based / Vegan</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-pharm-900">Zero</span>
                <span className="block text-xs font-medium text-slate-500">Plastic Waste</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-pharm-900">24/7</span>
                <span className="block text-xs font-medium text-slate-500">Active Support</span>
              </div>
            </div>
          </div>

          {/* Interactive floating model helper tag in Desktop */}
          <div className="hidden lg:col-span-5 lg:flex flex-col justify-end items-end space-y-4">
            <div className="bg-white/80 border border-pharm-100 p-4 rounded-2xl shadow-xl shadow-pharm-100/10 backdrop-blur-md max-w-[280px] pointer-events-auto transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center space-x-2 text-pharm-700 font-bold mb-1">
                <Info className="w-5 h-5 text-pharm-500" />
                <span className="text-sm">Interactive 3D Art</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scroll the webpage to see the DNA strand and molecular elements re-align. Feel free to drag or move around!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES / ETHOS SECTION --- */}
      <section id="services" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#ebf6ee]/80 border-y border-pharm-100/50 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section title */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-pharm-700">Healthy Life, Healthy Planet</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              A healthcare philosophy built on environmental harmony.
            </p>
            <p className="text-slate-600">
              Traditional pharmacies output millions of tons of plastic and toxic pharmaceutical run-off yearly. We built Central Pharm to do things completely differently.
            </p>
          </div>

          {/* Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white/90 border border-pharm-100 rounded-3xl p-6 shadow-lg shadow-pharm-100/20 hover:shadow-xl hover:shadow-pharm-100/40 transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="bg-pharm-50 text-pharm-700 p-4 rounded-2xl inline-block shadow-inner">
                    <ServiceIcon name={srv.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{srv.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{srv.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-pharm-50 flex items-center justify-between text-xs font-bold text-pharm-700">
                  <span>{srv.benefit}</span>
                  {srv.id === 'serv-1' && (
                    <span className="flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                      <span>●</span> <span>ONLINE</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRODUCT HIGHLIGHTS & LIVE SEARCH --- */}
      <section id="products" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white/20 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-pharm-700">Explore Catalog</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Premium Natural Apothecary
              </p>
              <p className="text-slate-600 max-w-xl">
                Search, filter, and review our live database of ethically harvested medicines, whole-food supplements, and lichen-sourced vitamins.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-pharm-100/80 rounded-2xl max-w-max border border-pharm-200/50 backdrop-blur-md">
              {['All', 'Medicines', 'Supplements', 'Vitamins'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-pharm-900 shadow-md scale-102'
                      : 'text-pharm-700 hover:text-pharm-950'
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
              <Search className="h-5 w-5 text-pharm-600" />
            </div>
            <input
              type="text"
              placeholder="Search products by ingredients, name, benefit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-white/90 border border-pharm-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-pharm-100 focus:border-pharm-500 transition-all outline-none shadow-sm shadow-pharm-100/30 font-medium"
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

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white/90 border border-pharm-100 rounded-3xl p-5 shadow-lg shadow-pharm-100/10 hover:shadow-2xl hover:shadow-pharm-100/30 transform hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Badge and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-pharm-100 text-pharm-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {product.badge}
                      </span>
                      <span className="flex items-center text-amber-500 font-extrabold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500 mr-1" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Product visual mock */}
                    <div className="aspect-square bg-pharm-50/80 rounded-2xl flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300 relative overflow-hidden shadow-inner mb-4">
                      <span>{product.icon}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-pharm-100/10 to-transparent"></div>
                    </div>

                    {/* Name & Category */}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-pharm-600 block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-pharm-700 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-pharm-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Price</span>
                      <span className="text-xl font-black text-slate-950">${product.price.toFixed(2)}</span>
                    </div>
                    <button
                      className="px-4 py-2 bg-pharm-50 hover:bg-pharm-100 text-pharm-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/85 border border-pharm-100 p-12 rounded-3xl text-center max-w-xl mx-auto shadow-md">
              <div className="bg-pharm-100/50 text-pharm-800 p-4 rounded-full inline-block mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No matching products found</h3>
              <p className="text-slate-600 text-sm">
                We couldn't find any products in "{selectedCategory}" matching your query: <strong className="text-pharm-950">"{searchQuery}"</strong>. Please try searching generic terms like 'relief', 'extract', or 'vegan'.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-6 px-5 py-2.5 bg-pharm-600 text-white font-bold rounded-xl text-xs hover:bg-pharm-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- ABOUT US / ETHICS EXPLAINER --- */}
      <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#ebf6ee]/90 border-y border-pharm-100/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Static imagery represent */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-pharm-100/30 border border-pharm-100 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-pharm-600 block">Eco-Certifications</span>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl mt-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Registered Pharmacy Practice</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Accredited by the State Council on Bio-Medicinal standards.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl mt-1">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Green Business Gold Certified</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Operating with 100% compostable packaging and zero landfill goals.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl mt-1">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Carbon-Neutral Deliveries</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Using localized electric bicycle networks for fast home drop-offs.</p>
                  </div>
                </div>
              </div>

              <div className="bg-pharm-50 border border-pharm-100 p-4 rounded-2xl flex items-center space-x-3 text-xs text-pharm-800 leading-relaxed">
                <span>🍀</span>
                <p>We plant one native tree for every five orders placed at our apothecary. Over 4,200 planted already.</p>
              </div>
            </div>
          </div>

          {/* Story Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="text-xs font-bold uppercase tracking-widest text-pharm-700">About Central Pharm</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Pioneering cellular health and planetary restoration.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Founded in 2024, Central Pharm emerged from a simple question: <em>Why can't health products heal the patient and the ecosystem at once?</em> Our founders—a environmental toxicologist and a formulation chemist—reimagined the community apothecary from scratch.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We vet every supplier to guarantee ethical harvesting practices that avoid destructive monoculture. Inside our laboratories, we substitute synthetic fillers (like silicon dioxide, microcrystalline cellulose, or gelatin) with premium, plant-based hypoallergenic compounds. 
            </p>
            <div className="pt-4 border-t border-pharm-100 flex flex-col sm:flex-row gap-6">
              <div className="space-y-1">
                <span className="block text-3xl font-extrabold text-pharm-900">4.9★</span>
                <span className="block text-xs text-slate-500 font-medium">Over 20k Customer Reviews</span>
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-extrabold text-pharm-900">4.2k+</span>
                <span className="block text-xs text-slate-500 font-medium">Native Trees Planted</span>
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-extrabold text-pharm-900">Zero</span>
                <span className="block text-xs text-slate-500 font-medium">Microplastic Trace Guarantee</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- TESTIMONIALS & FAQ --- */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white/10 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Testimonials */}
          <div>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-pharm-700">Testimonials</h2>
              <p className="text-3xl font-extrabold text-slate-900">Eco-conscious reviews</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="bg-white/90 border border-pharm-100 p-8 rounded-3xl shadow-lg relative"
                >
                  <div className="absolute -top-5 left-8 text-3xl bg-pharm-100 w-11 h-11 flex items-center justify-center rounded-2xl shadow-md border border-pharm-200">
                    {test.avatar}
                  </div>
                  <div className="pt-4 space-y-4">
                    <div className="flex space-x-1 text-amber-500">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      "{test.quote}"
                    </p>
                    <div className="pt-4 border-t border-pharm-50">
                      <span className="block font-bold text-slate-900 text-sm">{test.name}</span>
                      <span className="block text-xs text-pharm-600 font-semibold">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-pharm-700">Patient Resources</h2>
              <p className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={faq.id}
                    className="bg-white/95 border border-pharm-100 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-pharm-600 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-60 border-t border-pharm-50' : 'max-h-0'
                      }`}
                    >
                      <p className="p-6 text-sm text-slate-600 leading-relaxed bg-pharm-50/30">
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
      <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#ebf6ee]/80 border-t border-pharm-100/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar copy */}
          <div className="lg:col-span-5 space-y-8 text-left flex flex-col justify-center">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-pharm-700">Get In Touch</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Connect directly with our dispensary.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Need to transfer a prescription? Have questions about compounding allergen exclusions or raw organic ingredients? Submit the secure form, and a certified pharmacist will reply within two hours.
              </p>
            </div>

            <div className="space-y-4 font-semibold text-slate-700">
              <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-2xl shadow-sm border border-pharm-100">
                <div className="bg-pharm-100 text-pharm-700 p-2.5 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Emergency Support</span>
                  <span className="text-sm text-slate-900 font-extrabold">+1 (800) ECO-PHAR</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-2xl shadow-sm border border-pharm-100">
                <div className="bg-pharm-100 text-pharm-700 p-2.5 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Email Support</span>
                  <span className="text-sm text-slate-900 font-extrabold">consult@centralpharm.com</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-2xl shadow-sm border border-pharm-100">
                <div className="bg-pharm-100 text-pharm-700 p-2.5 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Physical Apothecary</span>
                  <span className="text-sm text-slate-900 font-extrabold">802 Greenwoods Dr, Portland OR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-pharm-100/20 border border-pharm-100 relative">
              
              {formSubmitted && (
                <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20 animate-fadeIn">
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-full mb-4">
                    <Check className="w-12 h-12 stroke-[3px]" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Message Dispatched!</h3>
                  <p className="text-slate-600 max-w-sm text-sm">
                    Your transmission to Central Pharm was successful. A compounding pharmacist will analyze your query and contact you within 2 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-pharm-600 text-white font-bold rounded-xl text-xs hover:bg-pharm-700 transition-colors"
                  >
                    Send another inquiry
                  </button>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-6">Dispensary Inquiry Transmission</h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pharm-100 focus:bg-white focus:border-pharm-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arthur@wellness.org"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pharm-100 focus:bg-white focus:border-pharm-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 304-4901"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pharm-100 focus:bg-white focus:border-pharm-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Subject Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pharm-100 focus:bg-white focus:border-pharm-500 transition-all outline-none"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Prescription Transfer">Prescription Transfer</option>
                      <option value="Compounding Request">Compounding Request</option>
                      <option value="Product Sourcing QA">Product Sourcing QA</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your compounding request or prescription details..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pharm-100 focus:bg-white focus:border-pharm-500 transition-all outline-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-pharm-600 hover:bg-pharm-700 text-white font-bold rounded-xl shadow-md shadow-pharm-100 transition-colors"
                  >
                    Submit Encrypted Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-pharm-800 text-pharm-200 p-2 rounded-full">
                <Leaf className="w-5 h-5 fill-pharm-400/20" />
              </div>
              <span className="text-xl font-bold tracking-tight">Central Pharm</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Clinical expertise meets green commitment. Registered pharmacy practice focused on premium organic wellness formulation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Apothecary</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#products" className="hover:text-white transition-colors">Vitamins</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Supplements</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Hypoallergenic Compounds</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Botanical Balms</a></li>
            </ul>
          </div>

          {/* Earth */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Planetary Promise</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-white transition-colors">Medicine Recycling</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Plastic-Free Apothecary</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Bicycle Delivery Net</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Tree Planting Audit</a></li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Availability</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Pharmacists: 24/7 Support</span>
              </li>
              <li><span>Bicycle Dispatch: 8 AM - 6 PM</span></li>
              <li><span>Lab Compounding: 9 AM - 5 PM</span></li>
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

      {/* --- PHARMACIST ADMIN INBOX OVERLAY (localStorage visualizer) --- */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsAdminOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Drawer container */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between z-10 border-l border-slate-100 animate-slideLeft">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-pharm-50">
              <div className="flex items-center space-x-2.5">
                <div className="bg-pharm-600 text-white p-2 rounded-xl shadow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-lg">Pharmacist Dispatch Control</h3>
                  <span className="text-xs font-semibold text-pharm-700 block">Reviewing customer compounding & prescriptions</span>
                </div>
              </div>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-1.5 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List scroll */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-start space-x-3 text-slate-600 text-xs leading-relaxed">
                <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p>
                  This dashboard retrieves queries securely from the browser's <strong>localStorage</strong>. When your customer submits a Contact Form, it immediately populates here with zero backend configuration needed, offering real dynamic mock functionality!
                </p>
              </div>

              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`border rounded-2xl p-5 text-left transition-all relative ${
                        sub.status === 'Unread'
                          ? 'bg-pharm-50/40 border-pharm-200 shadow-sm'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div>
                          <span className="block font-bold text-slate-950 text-base">{sub.name}</span>
                          <span className="text-xs text-slate-400 block">{sub.date} • {sub.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleReadStatus(sub.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              sub.status === 'Unread'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {sub.status}
                          </button>
                          <button
                            onClick={() => deleteSubmission(sub.id)}
                            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-pharm-700 bg-pharm-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {sub.subject}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {sub.message}
                      </p>

                      {sub.phone && sub.phone !== 'Not provided' && (
                        <div className="mt-2 text-[11px] font-medium text-slate-500">
                          📞 Phone: <span className="font-semibold text-slate-800">{sub.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 max-w-sm mx-auto space-y-3">
                  <div className="bg-slate-50 text-slate-400 p-4 rounded-full inline-block">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900">Inbox is empty</h4>
                  <p className="text-xs text-slate-500">
                    Submit the contact form on the home page to immediately see new clinical inquiries populate in this panel.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 text-center">
              <button
                onClick={() => setIsAdminOpen(false)}
                className="w-full py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm"
              >
                Close Control Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING REGISTERED PHARMACIST LIVE CHAT TRIGGER --- */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
        {isChatOpen ? (
          /* Live Chat box */
          <div className="w-[340px] sm:w-[380px] bg-white border border-pharm-100 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-slideUp">
            {/* Chat header */}
            <div className="bg-pharm-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-pharm-100 text-pharm-900 text-lg w-10 h-10 flex items-center justify-center rounded-full font-bold">
                    🌿
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white"></span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-white">Sarah, PharmD</span>
                  <span className="block text-[10px] text-emerald-300 font-medium">Active Community Pharmacist</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-pharm-700 rounded-full text-pharm-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-72 p-4 overflow-y-auto space-y-3.5 bg-[#f8fbf9]/60">
              {chatMessages.map((msg, index) => {
                const isBot = msg.sender === 'bot'
                return (
                  <div
                    key={index}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                          : 'bg-pharm-700 text-white rounded-tr-none shadow'
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
                placeholder="Ask Sarah (e.g. prescription help, delivery)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-pharm-500 transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-pharm-600 hover:bg-pharm-700 disabled:opacity-50 text-white rounded-xl transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Compact float trigger button */
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center space-x-2 bg-pharm-800 hover:bg-pharm-900 text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <MessageSquare className="w-5 h-5 fill-white/10" />
            <span className="text-xs font-extrabold tracking-wide">Live Support</span>
          </button>
        )}
      </div>

      {/* --- DETAILED PRODUCT DIALOG MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp text-left">
            
            {/* Visual Header Banner */}
            <div className="bg-pharm-50 p-8 flex items-center justify-center text-8xl relative border-b border-pharm-100/30">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span>{selectedProduct.icon}</span>
              <span className="absolute bottom-4 left-6 bg-white border border-pharm-100 text-pharm-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedProduct.category}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <div className="flex items-center space-x-2 text-amber-500 font-extrabold text-xs mb-1 bg-amber-50 px-2 py-0.5 rounded-full max-w-max">
                  <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                  <span>{selectedProduct.rating} Verified Patient Rating</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950">{selectedProduct.name}</h3>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Formulation Key Features list */}
              <div className="space-y-2 pt-2">
                <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Clinical Integrity</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProduct.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                      <div className="bg-pharm-100 text-pharm-700 p-0.5 rounded-full">
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
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Price</span>
                  <span className="text-2xl font-black text-slate-950">${selectedProduct.price.toFixed(2)}</span>
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
                        message: `Hello Central Pharm! I am highly interested in the organic product "${selectedProduct.name}" and would like to coordinate home delivery or inquire about compounding formulation details. Please contact me!`
                      }))
                    }}
                    className="px-5 py-3 bg-pharm-600 hover:bg-pharm-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm w-full text-center"
                  >
                    Consult Pharmacist
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
