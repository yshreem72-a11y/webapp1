import React from 'react'

export default function Logo({ className = "h-11", textClassName = "" }) {
  return (
    <div className={`flex items-center space-x-2 select-none ${className}`}>
      {/* SVG Icon: Exact high fidelity replication of the Central Pharm logo */}
      <svg
        viewBox="0 0 100 100"
        className="w-11 h-11 flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Grass-Green C-ring (Hex: #00ab44) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#00ab44"
          strokeWidth="11"
          strokeDasharray="210 50" // Perfect 'C' gap on the right
          strokeLinecap="round"
          transform="rotate(-40 50 50)"
        />
        
        {/* Inner Pill-Circle (Hex: #00828a - Dark Teal) divided diagonally (top-left to bottom-right) */}
        <mask id="pill-mask-precise">
          <circle cx="50" cy="50" r="28" fill="white" />
          {/* Diagonal divide line (Top-left to Bottom-right) */}
          <line
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            stroke="black"
            strokeWidth="8"
          />
        </mask>
        
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="#00828a"
          mask="url(#pill-mask-precise)"
        />
      </svg>
      
      {/* Logo Typography matching image exactly */}
      <div className="text-left font-sans flex flex-col justify-center">
        <span className="text-[25px] font-black tracking-tight leading-none text-[#00ab44] block">
          ENTRAL
        </span>
        <span className="text-[14px] font-black uppercase tracking-[0.22em] text-[#00828a] block -mt-0.5 leading-none">
          PHARM
        </span>
      </div>
    </div>
  )
}
