import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Center } from '@react-three/drei'
import * as THREE from 'three'

// Smooth scroll position hook
function useScrollPercent() {
  const [scrollPercent, setScrollPercent] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement
      const b = document.body
      const st = 'scrollTop'
      const sh = 'scrollHeight'
      const percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight || 1)
      setScrollPercent(percent)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPercent
}

// 1. Floating Pill / Capsule component
function CapsuleModel({ scrollPercent, index, initialPos }) {
  const meshRef = useRef()
  
  // Create two-toned capsule by using group of two cylinders/half-spheres
  const pillMaterial1 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#86efac', // Pastel green
    roughness: 0.1,
    metalness: 0.1,
  }), [])
  
  const pillMaterial2 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', // Clean white
    roughness: 0.1,
    metalness: 0.1,
  }), [])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    
    // Base floating motion
    const floatOffset = Math.sin(t + index * 1.5) * 0.2
    
    // Map scroll percent to dynamic movement
    // Rotate and reposition based on scroll
    const scrollRotation = scrollPercent * Math.PI * 4
    const scrollYShift = -scrollPercent * 12
    const scrollXShift = Math.sin(scrollPercent * Math.PI) * (index % 2 === 0 ? 3 : -3)

    // Lerp to target positions
    const targetX = initialPos[0] + scrollXShift
    const targetY = initialPos[1] + scrollYShift + floatOffset
    const targetZ = initialPos[2]

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1)
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1)
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1)

    // Rotations
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, scrollRotation * 0.5 + t * 0.2 + index, 0.05)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, scrollRotation * 0.2 + t * 0.5, 0.05)
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, t * 0.1, 0.05)
  })

  return (
    <group ref={meshRef} position={initialPos}>
      {/* Top half capsule */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 32]} />
        <primitive object={pillMaterial1} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={pillMaterial1} attach="material" />
      </mesh>
      
      {/* Bottom half capsule */}
      <mesh castShadow position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 32]} />
        <primitive object={pillMaterial2} attach="material" />
      </mesh>
      <mesh castShadow position={[0, -0.7, 0]}>
        <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <primitive object={pillMaterial2} attach="material" />
      </mesh>
    </group>
  )
}

// 2. DNA Double Helix Component
function DNAHelix({ scrollPercent }) {
  const groupRef = useRef()
  const strandCount = 15
  const radius = 1.2
  const heightStep = 0.4
  const rotationPerStep = 0.4

  const materialRed = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#34d399', // Emerald/Pastel Green
    roughness: 0.2,
    metalness: 0.3
  }), [])

  const materialBlue = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6ee7b7', // Mint Pastel
    roughness: 0.2,
    metalness: 0.3
  }), [])

  const materialBar = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0.1
  }), [])

  const spheres = useMemo(() => {
    const arr = []
    for (let i = 0; i < strandCount; i++) {
      const angle = i * rotationPerStep
      const y = (i - strandCount / 2) * heightStep
      
      // Node A
      const xA = Math.cos(angle) * radius
      const zA = Math.sin(angle) * radius
      
      // Node B
      const xB = Math.cos(angle + Math.PI) * radius
      const zB = Math.sin(angle + Math.PI) * radius

      arr.push({ y, xA, zA, xB, zB, angle })
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // Smooth scroll transitions
    const scrollYShift = -scrollPercent * 8 + 3
    const scrollRotation = scrollPercent * Math.PI * 3

    // Position DNA in a premium spot on the screen
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, scrollYShift, 0.1)
    
    // Rotate DNA as we scroll and float
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, scrollRotation + t * 0.5, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.3 + Math.sin(t * 0.2) * 0.1, 0.1)
  })

  return (
    <group ref={groupRef} position={[2.5, 3, -1]} scale={[1.1, 1.1, 1.1]}>
      {spheres.map((s, idx) => (
        <group key={idx} position={[0, s.y, 0]}>
          {/* Sphere A */}
          <mesh position={[s.xA, 0, s.zA]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <primitive object={materialRed} attach="material" />
          </mesh>

          {/* Sphere B */}
          <mesh position={[s.xB, 0, s.zB]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <primitive object={materialBlue} attach="material" />
          </mesh>

          {/* Connecting bar */}
          <mesh position={[0, 0, 0]} rotation={[0, -s.angle, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, radius * 2, 8]} />
            <primitive object={materialBar} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 3. Flowing Wellness Particle Network
function WellnessParticles({ scrollPercent }) {
  const pointsRef = useRef()
  const particleCount = 120

  const [positions, initialY] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const initY = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      // Create random distribution around space
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 20
      const z = (Math.random() - 0.5) * 8 - 2

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      initY[i] = y
    }
    return [pos, initY]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    const posArr = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < particleCount; i++) {
      // Flowing wave motion
      const index = i * 3
      const x = posArr[index]
      
      // Standard flow upwards
      let y = posArr[index + 1] + 0.02
      if (y > 10) y = -10 // wrap around
      
      // Wave effect
      posArr[index + 1] = y
      posArr[index] = x + Math.sin(t + y) * 0.005
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Slightly rotate the whole network
    pointsRef.current.rotation.y = t * 0.02 + scrollPercent * 1.5
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#86efac"
        size={0.12}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Main ThreeJS Canvas Component with responsive settings
export default function ThreeCanvas() {
  const scrollPercent = useScrollPercent()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#f4faf6'), 1)
        }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2.0} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />

        {/* Floating Pills */}
        {!isMobile && (
          <>
            <CapsuleModel scrollPercent={scrollPercent} index={0} initialPos={[-2.8, 1.8, 0]} />
            <CapsuleModel scrollPercent={scrollPercent} index={1} initialPos={[2.6, -1.5, -0.5]} />
            <CapsuleModel scrollPercent={scrollPercent} index={2} initialPos={[-1.8, -3.2, 0.5]} />
            <CapsuleModel scrollPercent={scrollPercent} index={3} initialPos={[1.5, 4.0, -1.5]} />
          </>
        )}
        {isMobile && (
          <>
            <CapsuleModel scrollPercent={scrollPercent} index={0} initialPos={[-1.2, 2.0, -1]} />
            <CapsuleModel scrollPercent={scrollPercent} index={1} initialPos={[1.2, -2.0, -1.5]} />
          </>
        )}

        {/* DNA Helix */}
        <DNAHelix scrollPercent={scrollPercent} />

        {/* Flowing wellness particles */}
        <WellnessParticles scrollPercent={scrollPercent} />
      </Canvas>
    </div>
  )
}
