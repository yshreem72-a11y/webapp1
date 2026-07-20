export const products = [
  // 1. Medicines
  {
    id: "med-1",
    name: "Bio-Shield Peptide Balm",
    category: "Medicines",
    price: 18.99,
    rating: 4.9,
    badge: "Gen-2 Formulation",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600", // Glass ointment jar
    description: "Highly advanced peptide ointment. Rapidly binds to skin cells to accelerate dermal barrier repair and trigger neural calming pathways.",
    features: ["Cellular Peptides", "Rapid absorption", "Dermatologist Certified"],
    tags: ["Defense", "Repair", "Clinical"]
  },
  {
    id: "med-2",
    name: "Nano-Silver Throat Spray",
    category: "Medicines",
    price: 14.50,
    rating: 4.8,
    badge: "Advanced Tech",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=600", // Amber dropper spray bottle
    description: "Formulated with stabilized bio-active silver nano-colloids and wild throat-soothing enzymes for instant immune defense.",
    features: ["Nano-colloid delivery", "Broad-spectrum soothing", "Alcohol-free"],
    tags: ["Defense", "Immune", "Fast Acting"]
  },
  {
    id: "med-3",
    name: "Synaptic Stress Reliever Drops",
    category: "Medicines",
    price: 24.00,
    rating: 4.7,
    badge: "Neuro-Focus",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600", // Dropper bottle
    description: "Liquid lipid formula designed to instantly cross the blood-brain barrier to alleviate cortisol overproduction and restore neurotransmitter balance.",
    features: ["Liposomal delivery", "Hormonal equilibrium", "Rapid action"],
    tags: ["Sleep", "Stress", "Cognitive"]
  },

  // 2. Supplements
  {
    id: "sup-1",
    name: "NMN Longevity Matrix",
    category: "Supplements",
    price: 49.99,
    rating: 5.0,
    badge: "Longevity King",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600", // Premium supplement capsules
    description: "Pure Beta-Nicotinamide Mononucleotide. Directly raises NAD+ levels to revitalize mitochondrial respiration, restore telomeres, and fight aging.",
    features: ["99.8% Certified Purity", "Mitochondrial catalyst", "DNA-Repetitive Repair"],
    tags: ["Longevity", "Energy", "Cellular"]
  },
  {
    id: "sup-2",
    name: "Synaptic Focus Probiotics",
    category: "Supplements",
    price: 36.00,
    rating: 4.8,
    badge: "Mind Catalyst",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600", // Supplement pills jar
    description: "Targeted psychobiotics linking gut flora with brain health. Increases cognitive endurance, clarity, and boosts dopamine synthesis pathways.",
    features: ["100 Billion Organisms", "Enteric protected capsules", "Brain-Gut optimizer"],
    tags: ["Cognitive", "Stress", "Digestive"]
  },
  {
    id: "sup-3",
    name: "Algae-Sourced Omega-3 Fusion",
    category: "Supplements",
    price: 29.99,
    rating: 4.9,
    badge: "Pure Source",
    image: "https://images.unsplash.com/photo-1611070973770-b1a6726b0c6e?auto=format&fit=crop&q=80&w=600", // Gel capsules
    description: "Premium heavy-metal free vegan Omega-3 extracted from marine microalgae. Direct EPA/DHA source for rapid neuro-vascular support.",
    features: ["Zero heavy-metals", "Cold-fractionated extraction", "No fishy odor"],
    tags: ["Cognitive", "Longevity", "Heart"]
  },

  // 3. Vitamins
  {
    id: "vit-1",
    name: "DNA-Optimized Sun-D3 Drops",
    category: "Vitamins",
    price: 19.99,
    rating: 4.9,
    badge: "High Potency",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600", // Vitamin liquid bottle
    description: "High-absorption Vitamin D3 with Vitamin K2 (MK-7). Formulated specifically to trigger calcium absorption and promote bone-density longevity.",
    features: ["10000 IU + 200mcg K2", "Liquid lipid base", "Highly bioavailable"],
    tags: ["Immune", "Longevity", "Defense"]
  },
  {
    id: "vit-2",
    name: "Cell-Active Multivitamin Gold",
    category: "Vitamins",
    price: 38.50,
    rating: 4.8,
    badge: "Cell Fuel",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600", // Medicine pills
    description: "Complete daily active vitamins combined with plant co-factors and powerful antioxidants. Promotes rapid energy production at the cellular level.",
    features: ["Coenzyme vitamins", "Rich in minerals", "No synthetic binders"],
    tags: ["Energy", "Immune", "Active"]
  },

  // 4. Bio-Hacking (New Category!)
  {
    id: "bio-1",
    name: "NAD+ Regenerative Accelerator",
    category: "Bio-Hacking",
    price: 64.00,
    rating: 5.0,
    badge: "Advanced Longevity",
    image: "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?auto=format&fit=crop&q=80&w=600", // Laboratory glass container
    description: "Liquid coenzyme formulation triggering rapid NAD+ synthesis. Restores deep cellular longevity, DNA transcription accuracy, and muscle metabolism.",
    features: ["Intracellular carrier", "HPLC 99.9% Purity", "Anti-senescence active"],
    tags: ["Longevity", "Cellular", "Energy"]
  },
  {
    id: "bio-2",
    name: "Nootropic Dopamine Booster",
    category: "Bio-Hacking",
    price: 45.00,
    rating: 4.9,
    badge: "Cognitive Elite",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=600", // Tech pills
    description: "Premium brain compound raising dopamine and acetylcholine availability. Accelerates focus acquisition, long-term memory consolidation, and flow states.",
    features: ["Clinical neural cofactor", "Hypoallergenic", "Fast synaptic transit"],
    tags: ["Cognitive", "Energy", "Active"]
  },

  // 5. Wellness Kits (New Category!)
  {
    id: "kit-1",
    name: "Mitochondrial Bio-Hacking Kit",
    category: "Wellness Kits",
    price: 110.00,
    rating: 5.0,
    badge: "Synergy Pack",
    image: "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?auto=format&fit=crop&q=80&w=600", // Pack of medicine bottles
    description: "Complete longevity bundle including NMN Longevity Matrix, Sun-D3 Drops, and Coenzyme B12. Restores cellular energy output in 14 days.",
    features: ["Curated clinical stack", "Compostable gift box", "Custom dosing chart"],
    tags: ["Longevity", "Energy", "Immune"]
  },
  {
    id: "kit-2",
    name: "Sleep & Cortisol Reset System",
    category: "Wellness Kits",
    price: 75.00,
    rating: 4.8,
    badge: "Zen Protocol",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600", // Herbal kit
    description: "Dual relief bundle with Synaptic Stress Drops and Forest Psychobiotics to lower evening cortisol and trigger deep, restorative REM sleep cycles.",
    features: ["Hypoallergenic binders", "Gastro-enteric protected", "Free bio-consultation"],
    tags: ["Sleep", "Stress", "Cognitive"]
  }
];
