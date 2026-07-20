import React from 'react'

export default function Logo({ className = "h-10", textClassName = "text-white" }) {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* SVG Icon: High fidelity recreation of the Central Pharm pill-circle logo */}
      <svg
        viewBox="0 0 100 100"
        className="w-12 h-12 flex-shrink-0 filter drop-shadow-[0_0_8px_rgba(0,255,102,0.25)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer C-ring representing Central */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#00ff66"
          strokeWidth="11"
          strokeDasharray="210 50" // Gives it a slight opening on the right representing a C
          strokeLinecap="round"
          transform="rotate(-40 50 50)"
        />
        
        {/* Inner pill-circle divided diagonally */}
        <mask id="pill-mask">
          <circle cx="50" cy="50" r="28" fill="white" />
          {/* Diagonal divide line */}
          <line
            x1="20"
            y1="80"
            x2="80"
            y2="20"
            stroke="black"
            strokeWidth="7"
          />
        </mask>
        
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="#00aa44"
          mask="url(#pill-mask)"
        />
      </svg>
      
      {/* Logo Text Typography */}
      <div className="text-left font-sans">
        <span className={`text-2xl font-black tracking-tight leading-none block ${textClassName}`}>
          <span className="text-[#00ff66]">C</span>ENTRAL
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff66] block -mt-1 leading-none">
          PHARM
        </span>
      </div>
    </div>
  )
}
