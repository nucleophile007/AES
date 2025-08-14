"use client";
import { Canvas } from "@react-three/fiber"
import { Text, Environment, Html } from "@react-three/drei"
import { useState, useRef } from "react"
import type * as THREE from "three"

const steps = [
  {
    number: 1,
    title: "Diagnostic Test",
    description:
      "Assess your current SAT level and identify strengths and weaknesses with our comprehensive diagnostic assessment.",
    color: "#6b46c1", // dark purple
    gradientColor: "#8b5cf6", // lighter dark purple
    position: [-7.5, 0, 0] as [number, number, number],
    height: 2.0,
  },
  {
    number: 2,
    title: "Personalized Plan",
    description: "Create a custom study roadmap based on your goals and diagnostic results for maximum efficiency.",
    color: "#1e40af", // dark blue
    gradientColor: "#3b82f6", // lighter dark blue
    position: [-4.0, 0, 0] as [number, number, number],
    height: 3.2,
  },
  {
    number: 3,
    title: "Skill Building",
    description: "Master SAT Math, Reading, and Writing with targeted lessons designed to strengthen your weak areas.",
    color: "#059669", // dark green
    gradientColor: "#10b981", // lighter dark green
    position: [-0.5, 0, 0] as [number, number, number],
    height: 4.4,
  },
  {
    number: 4,
    title: "Practice Tests",
    description:
      "Take full-length, timed SAT practice exams that simulate real test conditions for optimal preparation.",
    color: "#d97706", // dark orange
    gradientColor: "#f59e0b", // lighter dark orange
    position: [3.0, 0, 0] as [number, number, number],
    height: 5.6,
  },
  {
    number: 5,
    title: "Review & Refine",
    description:
      "Analyze results, address weak areas, and fine-tune strategies based on detailed performance analytics.",
    color: "#dc2626", // dark red
    gradientColor: "#ef4444", // lighter dark red
    position: [6.5, 0, 0] as [number, number, number],
    height: 6.8,
  },
  {
    number: 6,
    title: "Test Day Success",
    description: "Enter the SAT with confidence and a proven plan! You're fully prepared to achieve your target score.",
    color: "#4338ca", // dark indigo
    gradientColor: "#6366f1", // lighter dark indigo
    position: [10.0, 0, 0] as [number, number, number],
    height: 8.0,
  },
]

function StepBlock({
  step,
  selectedStep,
  onStepClick,
}: {
  step: (typeof steps)[0]
  selectedStep: number | null
  onStepClick: (stepNumber: number) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isSelected = selectedStep === step.number
  const meshRef = useRef<THREE.Mesh>(null)

  const handleClick = (e: any) => {
    e.stopPropagation()
    console.log(`Step ${step.number} clicked!`) // Debug log
    onStepClick(step.number)
  }

  return (
    <group position={[step.position[0], step.height / 2, step.position[2]]}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = "default"
        }}
        scale={hovered ? [1.05, 1.02, 1.05] : [1, 1, 1]}
      >
        <boxGeometry args={[3.5, step.height, 2.5]} />
        <meshStandardMaterial
          color={step.color}
          emissive={isSelected ? step.gradientColor : hovered ? step.gradientColor : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : hovered ? 0.1 : 0}
          roughness={0.3}
          metalness={0.1}
          transparent={false}
          opacity={1.0}
        />
      </mesh>

      <Text
        position={[0, 0, 1.26]}
        fontSize={0.35}
        color="#4a5568"
        anchorX="center"
        anchorY="middle" // Changed from "center" to "middle" to fix TypeScript error
        font="/fonts/Geist-Bold.ttf"
        letterSpacing={0.05}
        outlineWidth={0.02}
        outlineColor="white"
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = "default"
        }}
      >
        Step {step.number}
      </Text>

      {isSelected && (
        <Html
          position={[0, step.number === 6 || step.number === 5 ? -step.height / 2 - 2.5 : step.height / 2 + 1.5, 2.5]}
          center
        >
          <div
            className="w-80 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom duration-500 border-2 border-purple-200 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shadow-lg"
                style={{ background: `linear-gradient(135deg, ${step.color}, ${step.gradientColor})` }}
              >
                {step.number}
              </div>
              <h3 className="text-xl font-black text-gray-900 font-sans">{step.title}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed font-sans text-sm mb-4">{step.description}</p>
            <div
              className="h-2 rounded-full shadow-inner"
              style={{ background: `linear-gradient(90deg, ${step.color}, ${step.gradientColor})` }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}

export default function SATStepInfographic() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleStepClick = (stepNumber: number) => {
    console.log(`handleStepClick called with step ${stepNumber}, current selected: ${selectedStep}`) // Debug log
    setSelectedStep(selectedStep === stepNumber ? null : stepNumber)
  }

  const handleCanvasClick = () => {
    console.log("Canvas background clicked, closing cards") // Debug log
    setSelectedStep(null)
  }

  return (
    <div className="relative" style={{ backgroundColor: "hsl(220, 45%, 20%)" }} ref={containerRef}>
      <div className="hidden lg:block h-[700px] w-full">
        <Canvas
          camera={{ position: [-15, 10, 15], fov: 50 }}
          shadows
          style={{ backgroundColor: "hsl(220, 45%, 20%)" }}
          onPointerMissed={handleCanvasClick}
        >
          <Environment preset="studio" />
          <ambientLight intensity={0.9} color="#faf5ff" />
          <directionalLight
            position={[15, 15, 8]}
            intensity={1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <pointLight position={[-10, 10, 5]} intensity={0.4} color="#c084fc" />
          <pointLight position={[10, 10, 5]} intensity={0.4} color="#f472b6" />

          {steps.map((step) => (
            <StepBlock key={step.number} step={step} selectedStep={selectedStep} onStepClick={handleStepClick} />
          ))}
        </Canvas>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-white/95 to-purple-50/95 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border-2 border-purple-200">
          <p className="text-sm text-gray-800 font-bold font-sans">
            ✨ Click on any step to discover your SAT success journey
          </p>
        </div>
      </div>

      <div className="lg:hidden space-y-6 p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 font-sans mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Your Path to SAT Success
          </h2>
          <p className="text-gray-600 font-sans font-medium">Tap any step to learn more</p>
        </div>

        {steps.map((step) => {
          const isSelected = selectedStep === step.number

          return (
            <div key={step.number} className="group">
              <div
                className="flex items-center gap-4 cursor-pointer p-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                onClick={() => handleStepClick(step.number)}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${step.color}15, ${step.gradientColor}15)`
                    : "transparent",
                  border: isSelected ? `3px solid ${step.color}` : "3px solid transparent",
                }}
              >
                <div className="flex-1">
                  <div
                    className="inline-flex items-center px-6 py-3 text-white font-black rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.gradientColor})`,
                      boxShadow: `0 8px 25px ${step.color}40`,
                    }}
                  >
                    <span className="text-sm tracking-wide">STEP {step.number}</span>
                  </div>
                </div>

                <div className={`transition-transform duration-300 ${isSelected ? "rotate-90" : ""}`}>
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 ml-4 animate-in slide-in-from-top duration-500">
                  <div className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-2xl p-6 shadow-2xl border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${step.color}, ${step.gradientColor})` }}
                      >
                        {step.number}
                      </div>
                      <h3 className="text-xl font-black text-gray-900 font-sans">{step.title}</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-sans mb-4">{step.description}</p>
                    <div
                      className="h-2 rounded-full shadow-inner"
                      style={{ background: `linear-gradient(90deg, ${step.color}, ${step.gradientColor})` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
