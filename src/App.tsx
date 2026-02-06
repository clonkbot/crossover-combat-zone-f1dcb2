import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  Text,
  Stars,
  Float,
  MeshWobbleMaterial,
  RoundedBox,
  Sphere,
  Box,
  Cylinder,
  useKeyboardControls,
  KeyboardControls,
  Html,
  Trail,
  Sparkles
} from '@react-three/drei'
import * as THREE from 'three'

// Game state types
interface GameState {
  health: number
  ammo: number
  score: number
  selectedCharacter: 'mario' | 'lara'
  enemies: Enemy[]
  powerUps: PowerUp[]
  isPlaying: boolean
}

interface Enemy {
  id: number
  position: [number, number, number]
  health: number
  type: 'goomba' | 'skeleton'
}

interface PowerUp {
  id: number
  position: [number, number, number]
  type: 'mushroom' | 'medkit' | 'ammo' | 'star'
}

// Mario Character Component
function MarioCharacter({ position, isSelected }: { position: [number, number, number], isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      if (isSelected) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={isSelected ? 0.5 : 0.2}>
        {/* Body */}
        <RoundedBox args={[0.6, 0.8, 0.4]} position={[0, 0.4, 0]} radius={0.1}>
          <meshStandardMaterial color="#E52521" metalness={0.3} roughness={0.4} />
        </RoundedBox>
        {/* Overalls */}
        <RoundedBox args={[0.62, 0.5, 0.42]} position={[0, 0, 0]} radius={0.08}>
          <meshStandardMaterial color="#1560BD" metalness={0.2} roughness={0.5} />
        </RoundedBox>
        {/* Head */}
        <Sphere args={[0.35, 32, 32]} position={[0, 1.1, 0]}>
          <meshStandardMaterial color="#FFB366" metalness={0.1} roughness={0.6} />
        </Sphere>
        {/* Hat */}
        <Cylinder args={[0.4, 0.35, 0.15, 32]} position={[0, 1.4, 0]}>
          <meshStandardMaterial color="#E52521" metalness={0.3} roughness={0.4} />
        </Cylinder>
        <Cylinder args={[0.25, 0.25, 0.2, 32]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color="#E52521" metalness={0.3} roughness={0.4} />
        </Cylinder>
        {/* Mustache */}
        <Box args={[0.25, 0.08, 0.1]} position={[0, 1, 0.3]}>
          <meshStandardMaterial color="#4A3728" />
        </Box>
        {/* Tactical Vest */}
        <RoundedBox args={[0.65, 0.4, 0.3]} position={[0, 0.5, 0.1]} radius={0.05}>
          <meshStandardMaterial color="#2D4A3E" metalness={0.4} roughness={0.6} />
        </RoundedBox>
        {/* Weapon - Tactical Pipe */}
        <group position={[0.5, 0.3, 0.2]} rotation={[0, 0, -0.5]}>
          <Cylinder args={[0.05, 0.05, 0.8, 16]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#3A3A3A" metalness={0.8} roughness={0.2} />
          </Cylinder>
        </group>

        {isSelected && (
          <Sparkles count={30} scale={2} size={3} speed={0.4} color="#FFD700" />
        )}
      </Float>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

// Lara Croft Character Component
function LaraCharacter({ position, isSelected }: { position: [number, number, number], isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.1
      if (isSelected) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={isSelected ? 0.5 : 0.2}>
        {/* Body - Tank top */}
        <RoundedBox args={[0.5, 0.7, 0.35]} position={[0, 0.5, 0]} radius={0.1}>
          <meshStandardMaterial color="#40E0D0" metalness={0.2} roughness={0.5} />
        </RoundedBox>
        {/* Shorts */}
        <RoundedBox args={[0.52, 0.35, 0.36]} position={[0, 0, 0]} radius={0.08}>
          <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.6} />
        </RoundedBox>
        {/* Head */}
        <Sphere args={[0.3, 32, 32]} position={[0, 1.05, 0]}>
          <meshStandardMaterial color="#DEB887" metalness={0.1} roughness={0.6} />
        </Sphere>
        {/* Hair - Braid */}
        <Cylinder args={[0.08, 0.06, 0.6, 8]} position={[0, 0.7, -0.25]} rotation={[0.3, 0, 0]}>
          <meshStandardMaterial color="#4A3728" roughness={0.8} />
        </Cylinder>
        {/* Holsters */}
        <Box args={[0.12, 0.2, 0.1]} position={[0.35, -0.1, 0]}>
          <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.3} />
        </Box>
        <Box args={[0.12, 0.2, 0.1]} position={[-0.35, -0.1, 0]}>
          <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.3} />
        </Box>
        {/* Dual Pistols */}
        <group position={[0.4, 0.3, 0.3]} rotation={[0, 0.3, -0.3]}>
          <Box args={[0.08, 0.15, 0.25]}>
            <meshStandardMaterial color="#1A1A1A" metalness={0.9} roughness={0.1} />
          </Box>
        </group>
        <group position={[-0.4, 0.3, 0.3]} rotation={[0, -0.3, 0.3]}>
          <Box args={[0.08, 0.15, 0.25]}>
            <meshStandardMaterial color="#1A1A1A" metalness={0.9} roughness={0.1} />
          </Box>
        </group>
        {/* Backpack */}
        <RoundedBox args={[0.35, 0.4, 0.2]} position={[0, 0.5, -0.25]} radius={0.05}>
          <meshStandardMaterial color="#5C4033" metalness={0.3} roughness={0.7} />
        </RoundedBox>

        {isSelected && (
          <Sparkles count={30} scale={2} size={3} speed={0.4} color="#40E0D0" />
        )}
      </Float>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

// Enemy Component
function EnemyGoomba({ position, onDestroy, id }: { position: [number, number, number], onDestroy: (id: number) => void, id: number }) {
  const ref = useRef<THREE.Group>(null!)
  const [health, setHealth] = useState(100)
  const [hit, setHit] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime + id) * 2
      ref.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 0.5 + id) * 2
    }
  })

  const handleClick = () => {
    setHit(true)
    setTimeout(() => setHit(false), 100)
    const newHealth = health - 50
    if (newHealth <= 0) {
      onDestroy(id)
    } else {
      setHealth(newHealth)
    }
  }

  return (
    <group ref={ref} position={position} onClick={handleClick}>
      {/* Body */}
      <Sphere args={[0.4, 16, 16]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={hit ? "#FF0000" : "#8B4513"} emissive={hit ? "#FF0000" : "#000000"} emissiveIntensity={hit ? 0.5 : 0} />
      </Sphere>
      {/* Eyes */}
      <Sphere args={[0.1, 16, 16]} position={[-0.15, 0.5, 0.3]}>
        <meshBasicMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0.15, 0.5, 0.3]}>
        <meshBasicMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.05, 16, 16]} position={[-0.15, 0.5, 0.38]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.05, 16, 16]} position={[0.15, 0.5, 0.38]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
      {/* Angry eyebrows */}
      <Box args={[0.15, 0.03, 0.02]} position={[-0.15, 0.65, 0.35]} rotation={[0, 0, 0.3]}>
        <meshBasicMaterial color="#000000" />
      </Box>
      <Box args={[0.15, 0.03, 0.02]} position={[0.15, 0.65, 0.35]} rotation={[0, 0, -0.3]}>
        <meshBasicMaterial color="#000000" />
      </Box>
      {/* Feet */}
      <Sphere args={[0.15, 16, 16]} position={[-0.2, 0.05, 0]}>
        <meshStandardMaterial color="#2A2A2A" />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.2, 0.05, 0]}>
        <meshStandardMaterial color="#2A2A2A" />
      </Sphere>
      {/* Health bar */}
      <Html position={[0, 1, 0]} center>
        <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-200"
            style={{ width: `${health}%` }}
          />
        </div>
      </Html>
    </group>
  )
}

// Skeleton Enemy
function SkeletonEnemy({ position, onDestroy, id }: { position: [number, number, number], onDestroy: (id: number) => void, id: number }) {
  const ref = useRef<THREE.Group>(null!)
  const [health, setHealth] = useState(150)
  const [hit, setHit] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.7 + id * 2) * 3
      ref.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 0.4 + id * 2) * 3
      ref.current.rotation.y = state.clock.elapsedTime
    }
  })

  const handleClick = () => {
    setHit(true)
    setTimeout(() => setHit(false), 100)
    const newHealth = health - 50
    if (newHealth <= 0) {
      onDestroy(id)
    } else {
      setHealth(newHealth)
    }
  }

  return (
    <group ref={ref} position={position} onClick={handleClick}>
      {/* Skull */}
      <Sphere args={[0.25, 16, 16]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color={hit ? "#FF6666" : "#E8E8E8"} emissive={hit ? "#FF0000" : "#000000"} emissiveIntensity={hit ? 0.5 : 0} />
      </Sphere>
      {/* Eye sockets */}
      <Sphere args={[0.06, 8, 8]} position={[-0.08, 1.22, 0.2]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.06, 8, 8]} position={[0.08, 1.22, 0.2]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
      {/* Spine */}
      <Cylinder args={[0.08, 0.1, 0.6, 8]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#D4D4D4" />
      </Cylinder>
      {/* Ribs */}
      {[0.65, 0.75, 0.85].map((y, i) => (
        <Box key={i} args={[0.4, 0.04, 0.15]} position={[0, y, 0.05]}>
          <meshStandardMaterial color="#D4D4D4" />
        </Box>
      ))}
      {/* Arms */}
      <Cylinder args={[0.04, 0.03, 0.4, 8]} position={[-0.25, 0.8, 0]} rotation={[0, 0, 0.5]}>
        <meshStandardMaterial color="#D4D4D4" />
      </Cylinder>
      <Cylinder args={[0.04, 0.03, 0.4, 8]} position={[0.25, 0.8, 0]} rotation={[0, 0, -0.5]}>
        <meshStandardMaterial color="#D4D4D4" />
      </Cylinder>
      {/* Health bar */}
      <Html position={[0, 1.7, 0]} center>
        <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-200"
            style={{ width: `${(health / 150) * 100}%` }}
          />
        </div>
      </Html>
    </group>
  )
}

// Power-up Components
function PowerUpMushroom({ position, onCollect, id }: { position: [number, number, number], onCollect: (id: number, type: string) => void, id: number }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <group ref={ref} position={position} onClick={() => onCollect(id, 'health')}>
      <Float speed={3} rotationIntensity={0.5}>
        {/* Stem */}
        <Cylinder args={[0.15, 0.2, 0.3, 16]} position={[0, 0.15, 0]}>
          <meshStandardMaterial color="#F5F5DC" />
        </Cylinder>
        {/* Cap */}
        <Sphere args={[0.35, 16, 16]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#FF0000" />
        </Sphere>
        {/* White spots */}
        <Sphere args={[0.08, 8, 8]} position={[0.15, 0.6, 0.2]}>
          <meshBasicMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.06, 8, 8]} position={[-0.2, 0.5, 0.15]}>
          <meshBasicMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.07, 8, 8]} position={[0, 0.7, -0.1]}>
          <meshBasicMaterial color="#FFFFFF" />
        </Sphere>
        <Sparkles count={10} scale={1} size={2} speed={0.3} color="#FF6B6B" />
      </Float>
    </group>
  )
}

function PowerUpAmmo({ position, onCollect, id }: { position: [number, number, number], onCollect: (id: number, type: string) => void, id: number }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + 1) * 0.2
    }
  })

  return (
    <group ref={ref} position={position} onClick={() => onCollect(id, 'ammo')}>
      <Float speed={3} rotationIntensity={0.5}>
        {/* Ammo box */}
        <RoundedBox args={[0.5, 0.3, 0.3]} radius={0.03}>
          <meshStandardMaterial color="#2D5016" metalness={0.4} roughness={0.6} />
        </RoundedBox>
        <Sparkles count={10} scale={1} size={2} speed={0.3} color="#FFD700" />
      </Float>
    </group>
  )
}

function PowerUpStar({ position, onCollect, id }: { position: [number, number, number], onCollect: (id: number, type: string) => void, id: number }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 3
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.3
    }
  })

  return (
    <group ref={ref} position={position} onClick={() => onCollect(id, 'star')}>
      <Float speed={4} rotationIntensity={1}>
        {/* Star shape using multiple boxes */}
        <Box args={[0.5, 0.15, 0.15]}>
          <MeshWobbleMaterial color="#FFD700" speed={2} factor={0.2} metalness={0.8} roughness={0.2} />
        </Box>
        <Box args={[0.15, 0.5, 0.15]}>
          <MeshWobbleMaterial color="#FFD700" speed={2} factor={0.2} metalness={0.8} roughness={0.2} />
        </Box>
        <Box args={[0.35, 0.35, 0.15]} rotation={[0, 0, Math.PI / 4]}>
          <MeshWobbleMaterial color="#FFD700" speed={2} factor={0.2} metalness={0.8} roughness={0.2} />
        </Box>
        <Sparkles count={20} scale={1.5} size={4} speed={0.5} color="#FFFFFF" />
      </Float>
    </group>
  )
}

// Environment/Map Elements
function BattleArena() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#3D3D3D" roughness={0.8} />
      </mesh>

      {/* Grid lines on ground */}
      {Array.from({ length: 21 }).map((_, i) => (
        <group key={`grid-${i}`}>
          <mesh position={[-25 + i * 2.5, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 50]} />
            <meshBasicMaterial color="#1a5c1a" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -0.49, -25 + i * 2.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[0.02, 50]} />
            <meshBasicMaterial color="#1a5c1a" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Cover objects - Crates */}
      {[
        [-8, 0, -5], [8, 0, -5], [-8, 0, 5], [8, 0, 5],
        [0, 0, -10], [0, 0, 10], [-12, 0, 0], [12, 0, 0]
      ].map((pos, i) => (
        <RoundedBox key={`crate-${i}`} args={[2, 2, 2]} position={pos as [number, number, number]} radius={0.1} castShadow>
          <meshStandardMaterial color="#5C4033" roughness={0.9} />
        </RoundedBox>
      ))}

      {/* Barrier walls */}
      {[
        { pos: [-15, 1, 0], rot: [0, 0, 0], size: [1, 3, 20] as [number, number, number] },
        { pos: [15, 1, 0], rot: [0, 0, 0], size: [1, 3, 20] as [number, number, number] },
        { pos: [0, 1, -15], rot: [0, Math.PI / 2, 0], size: [1, 3, 30] as [number, number, number] },
        { pos: [0, 1, 15], rot: [0, Math.PI / 2, 0], size: [1, 3, 30] as [number, number, number] },
      ].map((wall, i) => (
        <RoundedBox
          key={`wall-${i}`}
          args={wall.size}
          position={wall.pos as [number, number, number]}
          rotation={wall.rot as [number, number, number]}
          radius={0.1}
        >
          <meshStandardMaterial color="#2D4A3E" roughness={0.7} metalness={0.2} />
        </RoundedBox>
      ))}

      {/* Pipes - Mario style */}
      {[[-10, 0, -8], [10, 0, 8], [-5, 0, 12], [5, 0, -12]].map((pos, i) => (
        <group key={`pipe-${i}`} position={pos as [number, number, number]}>
          <Cylinder args={[1, 1, 2, 16]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#2E8B2E" metalness={0.5} roughness={0.4} />
          </Cylinder>
          <Cylinder args={[1.15, 1.15, 0.3, 16]} position={[0, 1.35, 0]}>
            <meshStandardMaterial color="#228B22" metalness={0.5} roughness={0.4} />
          </Cylinder>
        </group>
      ))}

      {/* Question blocks */}
      {[[-6, 3, -3], [6, 3, 3], [0, 4, -6], [0, 4, 6]].map((pos, i) => (
        <Float key={`qblock-${i}`} speed={1} rotationIntensity={0} floatIntensity={0.3}>
          <RoundedBox args={[1, 1, 1]} position={pos as [number, number, number]} radius={0.1}>
            <meshStandardMaterial color="#FFB300" metalness={0.3} roughness={0.5} />
          </RoundedBox>
        </Float>
      ))}
    </group>
  )
}

// Crosshair
function Crosshair() {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      <div className="relative">
        <div className="absolute w-6 h-0.5 bg-green-400 -left-3 top-0 opacity-80 shadow-lg shadow-green-400/50" />
        <div className="absolute w-0.5 h-6 bg-green-400 left-0 -top-3 opacity-80 shadow-lg shadow-green-400/50" />
        <div className="absolute w-2 h-2 rounded-full border border-green-400 -left-1 -top-1 opacity-60" />
      </div>
    </div>
  )
}

// HUD Component
function GameHUD({ gameState, onCharacterSelect, onStartGame, onRestart }: {
  gameState: GameState,
  onCharacterSelect: (char: 'mario' | 'lara') => void,
  onStartGame: () => void,
  onRestart: () => void
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 pointer-events-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
          {/* Health */}
          <div className="flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-lg border border-red-500/30">
            <div className="text-red-500 text-xs md:text-sm font-bold tracking-wider">HEALTH</div>
            <div className="w-24 md:w-32 h-3 md:h-4 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${gameState.health}%` }}
              />
            </div>
            <div className="text-red-400 text-xs md:text-sm font-mono min-w-[2.5rem] text-right">{gameState.health}</div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-lg border border-yellow-500/30">
            <div className="text-yellow-500 text-xs md:text-sm font-bold tracking-wider">SCORE</div>
            <div className="text-yellow-400 text-base md:text-xl font-mono font-bold">{gameState.score.toString().padStart(6, '0')}</div>
          </div>

          {/* Ammo */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-lg border border-cyan-500/30">
            <div className="text-cyan-500 text-xs md:text-sm font-bold tracking-wider">AMMO</div>
            <div className="text-cyan-400 text-base md:text-xl font-mono font-bold">{gameState.ammo}</div>
          </div>
        </div>
      </div>

      {/* Character indicator */}
      <div className="absolute bottom-16 md:bottom-20 left-2 md:left-4 bg-black/60 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 rounded-lg border border-white/20">
        <div className="text-white/60 text-[10px] md:text-xs tracking-widest mb-1">OPERATIVE</div>
        <div className={`text-base md:text-lg font-bold ${gameState.selectedCharacter === 'mario' ? 'text-red-500' : 'text-teal-400'}`}>
          {gameState.selectedCharacter === 'mario' ? 'MARIO' : 'LARA CROFT'}
        </div>
      </div>

      {/* Instructions */}
      {gameState.isPlaying && (
        <div className="absolute bottom-16 md:bottom-20 right-2 md:right-4 bg-black/60 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 rounded-lg border border-white/20 text-white/60 text-[10px] md:text-xs max-w-[200px] md:max-w-none">
          <div className="tracking-widest mb-1">CONTROLS</div>
          <div className="space-y-0.5 md:space-y-1">
            <div><span className="hidden md:inline">🖱️ </span>Click enemies to shoot</div>
            <div><span className="hidden md:inline">🎯 </span>Click power-ups to collect</div>
            <div><span className="hidden md:inline">🔄 </span>Drag/Touch to look around</div>
          </div>
        </div>
      )}

      {/* Start/Game Over screen */}
      {!gameState.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-2 bg-gradient-to-r from-red-500 via-yellow-500 to-teal-400 bg-clip-text text-transparent">
              CROSSOVER
            </h1>
            <h2 className="text-xl md:text-2xl text-white/80 mb-6 md:mb-8 tracking-[0.2em] md:tracking-[0.3em]">COMBAT ZONE</h2>

            <div className="text-white/60 text-xs md:text-sm mb-4 md:mb-6 tracking-wider">SELECT YOUR OPERATIVE</div>

            <div className="flex gap-3 md:gap-6 justify-center mb-6 md:mb-8">
              <button
                onClick={() => onCharacterSelect('mario')}
                className={`px-4 py-3 md:px-8 md:py-4 rounded-lg transition-all duration-300 ${
                  gameState.selectedCharacter === 'mario'
                    ? 'bg-red-600 text-white scale-105 ring-2 ring-red-400'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <div className="text-xl md:text-2xl mb-1">🍄</div>
                <div className="font-bold text-sm md:text-base">MARIO</div>
                <div className="text-[10px] md:text-xs opacity-60">Tactical Plumber</div>
              </button>

              <button
                onClick={() => onCharacterSelect('lara')}
                className={`px-4 py-3 md:px-8 md:py-4 rounded-lg transition-all duration-300 ${
                  gameState.selectedCharacter === 'lara'
                    ? 'bg-teal-600 text-white scale-105 ring-2 ring-teal-400'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <div className="text-xl md:text-2xl mb-1">🔫</div>
                <div className="font-bold text-sm md:text-base">LARA</div>
                <div className="text-[10px] md:text-xs opacity-60">Tomb Raider</div>
              </button>
            </div>

            <button
              onClick={gameState.health <= 0 ? onRestart : onStartGame}
              className="px-8 py-3 md:px-12 md:py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-base md:text-lg rounded-lg
                         hover:from-green-500 hover:to-green-400 transition-all duration-300
                         shadow-lg shadow-green-500/30 hover:shadow-green-500/50
                         animate-pulse hover:animate-none min-h-[48px]"
            >
              {gameState.health <= 0 ? 'RESTART MISSION' : 'START MISSION'}
            </button>

            {gameState.health <= 0 && (
              <div className="mt-4 md:mt-6 text-red-500 text-lg md:text-xl font-bold animate-pulse">
                MISSION FAILED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Game Scene
function GameScene({ gameState, setGameState }: { gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>> }) {
  const handleEnemyDestroy = useCallback((id: number) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.filter(e => e.id !== id),
      score: prev.score + 100
    }))
  }, [setGameState])

  const handlePowerUpCollect = useCallback((id: number, type: string) => {
    setGameState(prev => {
      let newState = { ...prev, powerUps: prev.powerUps.filter(p => p.id !== id) }

      switch(type) {
        case 'health':
          newState.health = Math.min(100, prev.health + 25)
          break
        case 'ammo':
          newState.ammo = prev.ammo + 30
          break
        case 'star':
          newState.score = prev.score + 500
          break
      }

      return newState
    })
  }, [setGameState])

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff6b6b" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#4ecdc4" />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />

      <BattleArena />

      {/* Characters */}
      <MarioCharacter position={[-2, 0, 8]} isSelected={gameState.selectedCharacter === 'mario'} />
      <LaraCharacter position={[2, 0, 8]} isSelected={gameState.selectedCharacter === 'lara'} />

      {/* Enemies */}
      {gameState.isPlaying && gameState.enemies.map(enemy => (
        enemy.type === 'goomba' ? (
          <EnemyGoomba
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
            onDestroy={handleEnemyDestroy}
          />
        ) : (
          <SkeletonEnemy
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
            onDestroy={handleEnemyDestroy}
          />
        )
      ))}

      {/* Power-ups */}
      {gameState.isPlaying && gameState.powerUps.map(powerUp => {
        switch(powerUp.type) {
          case 'mushroom':
            return <PowerUpMushroom key={powerUp.id} id={powerUp.id} position={powerUp.position} onCollect={handlePowerUpCollect} />
          case 'ammo':
            return <PowerUpAmmo key={powerUp.id} id={powerUp.id} position={powerUp.position} onCollect={handlePowerUpCollect} />
          case 'star':
            return <PowerUpStar key={powerUp.id} id={powerUp.id} position={powerUp.position} onCollect={handlePowerUpCollect} />
          default:
            return null
        }
      })}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
        enablePan={false}
      />
    </>
  )
}

// Main App
export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    ammo: 100,
    score: 0,
    selectedCharacter: 'mario',
    enemies: [],
    powerUps: [],
    isPlaying: false
  })

  const initializeGame = useCallback(() => {
    const enemies: Enemy[] = [
      { id: 1, position: [-5, 0, -5], health: 100, type: 'goomba' },
      { id: 2, position: [5, 0, -5], health: 100, type: 'goomba' },
      { id: 3, position: [0, 0, -8], health: 150, type: 'skeleton' },
      { id: 4, position: [-8, 0, 0], health: 100, type: 'goomba' },
      { id: 5, position: [8, 0, 0], health: 150, type: 'skeleton' },
      { id: 6, position: [-3, 0, -10], health: 100, type: 'goomba' },
      { id: 7, position: [3, 0, -10], health: 100, type: 'goomba' },
    ]

    const powerUps: PowerUp[] = [
      { id: 101, position: [-6, 0.5, 3], type: 'mushroom' },
      { id: 102, position: [6, 0.5, 3], type: 'ammo' },
      { id: 103, position: [0, 0.5, -3], type: 'star' },
      { id: 104, position: [-10, 0.5, -6], type: 'mushroom' },
      { id: 105, position: [10, 0.5, -6], type: 'ammo' },
    ]

    setGameState(prev => ({
      ...prev,
      enemies,
      powerUps,
      isPlaying: true
    }))
  }, [])

  const handleRestart = useCallback(() => {
    setGameState({
      health: 100,
      ammo: 100,
      score: 0,
      selectedCharacter: gameState.selectedCharacter,
      enemies: [],
      powerUps: [],
      isPlaying: false
    })
  }, [gameState.selectedCharacter])

  const handleCharacterSelect = useCallback((char: 'mario' | 'lara') => {
    setGameState(prev => ({ ...prev, selectedCharacter: char }))
  }, [])

  // Spawn new enemies periodically
  useEffect(() => {
    if (!gameState.isPlaying) return

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.enemies.length >= 10) return prev

        const newEnemy: Enemy = {
          id: Date.now(),
          position: [
            (Math.random() - 0.5) * 20,
            0,
            -5 - Math.random() * 10
          ],
          health: Math.random() > 0.5 ? 100 : 150,
          type: Math.random() > 0.5 ? 'goomba' : 'skeleton'
        }

        return { ...prev, enemies: [...prev.enemies, newEnemy] }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [gameState.isPlaying])

  // Spawn power-ups periodically
  useEffect(() => {
    if (!gameState.isPlaying) return

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.powerUps.length >= 8) return prev

        const types: PowerUp['type'][] = ['mushroom', 'ammo', 'star']
        const newPowerUp: PowerUp = {
          id: Date.now(),
          position: [
            (Math.random() - 0.5) * 16,
            0.5,
            (Math.random() - 0.5) * 16
          ],
          type: types[Math.floor(Math.random() * types.length)]
        }

        return { ...prev, powerUps: [...prev.powerUps, newPowerUp] }
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [gameState.isPlaying])

  // Damage player over time when enemies are close (simplified)
  useEffect(() => {
    if (!gameState.isPlaying) return

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.enemies.length > 5 && prev.health > 0) {
          const newHealth = prev.health - 2
          if (newHealth <= 0) {
            return { ...prev, health: 0, isPlaying: false }
          }
          return { ...prev, health: newHealth }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.isPlaying])

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Canvas
        shadows
        camera={{ position: [0, 8, 15], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0a0a1a, #1a0a2a)' }}
      >
        <Suspense fallback={null}>
          <GameScene gameState={gameState} setGameState={setGameState} />
        </Suspense>
      </Canvas>

      {gameState.isPlaying && <Crosshair />}

      <GameHUD
        gameState={gameState}
        onCharacterSelect={handleCharacterSelect}
        onStartGame={initializeGame}
        onRestart={handleRestart}
      />

      {/* Footer */}
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <p className="text-white/30 text-[10px] md:text-xs tracking-wider">
          Requested by <span className="text-white/50">@Virtuals_OG</span> · Built by <span className="text-white/50">@clonkbot</span>
        </p>
      </div>
    </div>
  )
}
