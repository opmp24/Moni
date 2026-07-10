import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text3D, Center } from "@react-three/drei"
import * as THREE from "three"

function DollarMesh() {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.5
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1
  })
  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={2.5}
          height={0.4}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelSegments={5}
        >
          {"$"}
          <meshStandardMaterial color="#FFD600" metalness={0.6} roughness={0.2} />
        </Text3D>
      </Center>
    </group>
  )
}

export function ThreeDollarSign() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} className="h-full w-full">
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#FFD600" />
      <DollarMesh />
    </Canvas>
  )
}
