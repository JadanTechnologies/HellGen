import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HandLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { ParticleTemplate } from '../types';
import { createHeart, createFlower, createSaturn, createBuddha, createFireworks, FireworkParticle } from '../utils/particleShapes';
import gsap from 'gsap';

interface ParticleCanvasProps {
    template: ParticleTemplate;
    color: string;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ template, color }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState("Initializing...");
    const [handsDetected, setHandsDetected] = useState(false);

    // Three.js Objects Refs
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const animationFrameId = useRef<number>(0);
    
    // Logic Refs (Mutable state for animation loop)
    const templateRef = useRef(template);
    const colorRef = useRef(color);
    const fireworksData = useRef<FireworkParticle[]>([]);
    const velocitiesRef = useRef<Float32Array | null>(null);
    const prevHandsClosedRef = useRef<boolean>(false);
    const isTransitioningRef = useRef<boolean>(false);
    
    // Tween Refs for cleanup
    const explosionTweenRef = useRef<gsap.core.Tween | null>(null);
    const morphTweenRef = useRef<gsap.core.Tween | null>(null);

    // Sync Props to Refs
    useEffect(() => { templateRef.current = template; }, [template]);
    useEffect(() => { colorRef.current = color; }, [color]);

    // Manual Buffer Interpolation (Replaces GSAP EndArrayPlugin for reliability)
    const animateAttribute = useCallback((
        startValues: Float32Array,
        endValues: Float32Array,
        duration: number,
        ease: string,
        onComplete?: () => void
    ) => {
        const proxy = { t: 0 };
        const startSnapshot = new Float32Array(startValues); // Clone for stability
        
        return gsap.to(proxy, {
            t: 1,
            duration: duration,
            ease: ease,
            onUpdate: () => {
                if (!particlesRef.current) return;
                const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
                
                // Linear interpolation: start + (end - start) * t
                for (let i = 0; i < pos.length; i++) {
                    pos[i] = startSnapshot[i] + (endValues[i] - startSnapshot[i]) * proxy.t;
                }
                particlesRef.current.geometry.attributes.position.needsUpdate = true;
            },
            onComplete
        });
    }, []);

    const resetVelocities = () => {
        if (velocitiesRef.current) {
            velocitiesRef.current.fill(0);
        }
    };

    const triggerExplosion = useCallback(() => {
        if (!particlesRef.current || templateRef.current === ParticleTemplate.Fireworks || isTransitioningRef.current) return;

        isTransitioningRef.current = true;
        resetVelocities(); // clear physics momentum

        const geometry = particlesRef.current.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const initialPositions = geometry.attributes.initialPosition.array as Float32Array;
        const count = positions.length / 3;

        // Generate Explosion Target Positions
        const explodedPositions = new Float32Array(count * 3);
        const explosionForce = 20;

        for(let i=0; i<count; i++) {
            const ix = initialPositions[i*3];
            const iy = initialPositions[i*3+1];
            const iz = initialPositions[i*3+2];
            
            // Random direction
            const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
            
            explodedPositions[i*3] = ix + dir.x * explosionForce;
            explodedPositions[i*3+1] = iy + dir.y * explosionForce;
            explodedPositions[i*3+2] = iz + dir.z * explosionForce;
        }

        // Cleanup prev tweens
        if (explosionTweenRef.current) explosionTweenRef.current.kill();
        if (morphTweenRef.current) morphTweenRef.current.kill();

        // 1. Visual Flash
        const material = particlesRef.current.material as THREE.PointsMaterial;
        const originalColor = new THREE.Color(colorRef.current);
        
        material.color.setHex(0xffffff);
        material.size = 0.5;
        material.opacity = 1.0;

        gsap.to(material.color, {
            r: originalColor.r, g: originalColor.g, b: originalColor.b,
            duration: 0.5, ease: "power2.in"
        });
        gsap.to(material, {
            size: 0.2, opacity: 0.7, duration: 0.5, ease: "power2.out"
        });

        // 2. Explode Out & Return
        explosionTweenRef.current = animateAttribute(positions, explodedPositions, 0.25, "power3.out", () => {
            explosionTweenRef.current = animateAttribute(explodedPositions, initialPositions, 1.2, "elastic.out(1, 0.4)", () => {
                isTransitioningRef.current = false;
                resetVelocities(); // Ensure clean slate for physics
            });
        });

    }, [animateAttribute]);

    // Shape Morphing Logic
    useEffect(() => {
        if (!particlesRef.current || !sceneRef.current) return;

        if (template === ParticleTemplate.Fireworks) {
            // Reset to fireworks mode
            fireworksData.current = createFireworks();
            isTransitioningRef.current = false;
        } else {
            // Generate Target Points
            const pointGenerator = {
                [ParticleTemplate.Heart]: createHeart,
                [ParticleTemplate.Flower]: createFlower,
                [ParticleTemplate.Saturn]: createSaturn,
                [ParticleTemplate.Buddha]: createBuddha,
                [ParticleTemplate.Fireworks]: createFireworks,
            }[template];

            if (pointGenerator) {
                // @ts-ignore
                const newPoints = pointGenerator() as Float32Array;
                const geometry = particlesRef.current.geometry;
                const currentPositions = geometry.attributes.position.array as Float32Array;
                
                // Update 'initialPosition' target
                geometry.setAttribute('initialPosition', new THREE.BufferAttribute(newPoints.slice(), 3));

                // Cleanup active tweens
                if (explosionTweenRef.current) explosionTweenRef.current.kill();
                if (morphTweenRef.current) morphTweenRef.current.kill();

                isTransitioningRef.current = true;
                resetVelocities();

                morphTweenRef.current = animateAttribute(currentPositions, newPoints, 1.5, "power2.inOut", () => {
                    isTransitioningRef.current = false;
                    resetVelocities();
                });
            }
        }
    }, [template, animateAttribute]);

    // Color Update Logic
    useEffect(() => {
        if (particlesRef.current) {
            (particlesRef.current.material as THREE.PointsMaterial).color.set(color);
        }
    }, [color]);

    // Main Animation Loop
    const animate = useCallback(() => {
        const time = Date.now() * 0.001;
        
        // 1. Hand Detection Logic
        if (videoRef.current && handLandmarkerRef.current && videoRef.current.readyState >= 3) {
            const results = handLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
            
            if (results.landmarks && results.landmarks.length > 0) {
                setHandsDetected(true);
                
                // Map hand position to controls (scaling)
                const hands = results.landmarks;
                if(hands.length === 2 && particlesRef.current) {
                    // Logic: Distance between hands controls scale
                    const h1 = hands[0][9]; // Middle finger knuckle
                    const h2 = hands[1][9];
                    const dist = Math.hypot(h1.x - h2.x, h1.y - h2.y);
                    
                    const targetScale = THREE.MathUtils.mapLinear(dist, 0.2, 0.8, 0.5, 2.5);
                    const clampedScale = THREE.MathUtils.clamp(targetScale, 0.5, 3.0);
                    
                    gsap.to(particlesRef.current.scale, {
                        x: clampedScale, y: clampedScale, z: clampedScale,
                        duration: 0.3, overwrite: 'auto'
                    });

                    // Logic: Closing hands gesture
                    const isClosed = (lm: NormalizedLandmark[]) => {
                        const tip = lm[12]; // Middle finger tip
                        const wrist = lm[0];
                        const palm = lm[9];
                        const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
                        const palmDist = Math.hypot(palm.x - wrist.x, palm.y - wrist.y);
                        return tipDist < palmDist * 1.5; // Heuristic
                    };

                    const bothClosed = isClosed(hands[0]) && isClosed(hands[1]);
                    if (bothClosed && !prevHandsClosedRef.current) {
                        triggerExplosion();
                    }
                    prevHandsClosedRef.current = bothClosed;
                } else {
                    prevHandsClosedRef.current = false;
                }

            } else {
                setHandsDetected(false);
                prevHandsClosedRef.current = false;
            }
        }

        // 2. Particle Animation Logic
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            
            if (templateRef.current === ParticleTemplate.Fireworks) {
                // Fireworks Physics (Unchanged)
                const gravity = -0.015;
                let allDead = true;
                
                for(let i=0; i < fireworksData.current.length; i++) {
                    const p = fireworksData.current[i];
                    p.velocity.y += gravity;
                    p.position.add(p.velocity.clone().multiplyScalar(0.04));
                    p.alpha -= 0.008;

                    if (p.alpha > 0) {
                        allDead = false;
                        p.position.toArray(positions, i * 3);
                    } else {
                        // Hide
                        positions[i*3] = 99999;
                    }
                }
                
                if (allDead) {
                    fireworksData.current = createFireworks();
                }
                particlesRef.current.geometry.attributes.position.needsUpdate = true;

            } else if (!isTransitioningRef.current && velocitiesRef.current) {
                // REALISTIC PHYSICS SIMULATION
                // Spring force + Gravity + Air Resistance
                
                const initialPositions = particlesRef.current.geometry.attributes.initialPosition.array as Float32Array;
                const vels = velocitiesRef.current;
                const count = positions.length / 3;

                const springStrength = 0.08; // How strongly it pulls back to shape
                const damping = 0.92; // Air resistance (lower = thicker air)
                const gravity = -0.005; // Gentle downward pull
                
                for (let i = 0; i < count; i++) {
                    const idx = i * 3;
                    
                    // 1. Dynamic Target: Original Shape + Subtle Sine Drift
                    // This creates the "underwater/floating" feel but anchored to the shape
                    const ix = initialPositions[idx];
                    const iy = initialPositions[idx+1];
                    const iz = initialPositions[idx+2];

                    const tx = ix + Math.sin(time + iy * 0.4) * 0.2;
                    const ty = iy + Math.cos(time * 0.9 + ix * 0.4) * 0.2;
                    const tz = iz + Math.sin(time * 0.8 + iz * 0.4) * 0.2;

                    // 2. Calculate Forces
                    // Hooke's Law (Spring)
                    const forceX = (tx - positions[idx]) * springStrength;
                    const forceY = (ty - positions[idx]) * springStrength + gravity; // Apply gravity
                    const forceZ = (tz - positions[idx]) * springStrength;

                    // 3. Integrate Velocity (Acceleration + Friction)
                    vels[idx]   = (vels[idx]   + forceX) * damping;
                    vels[idx+1] = (vels[idx+1] + forceY) * damping;
                    vels[idx+2] = (vels[idx+2] + forceZ) * damping;

                    // 4. Update Position
                    positions[idx]   += vels[idx];
                    positions[idx+1] += vels[idx+1];
                    positions[idx+2] += vels[idx+2];
                }
                particlesRef.current.geometry.attributes.position.needsUpdate = true;
            }
        }

        // 3. Render
        if (controlsRef.current) controlsRef.current.update();
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        animationFrameId.current = requestAnimationFrame(animate);
    }, [triggerExplosion]);

    // Initialization Effect (Run Once)
    useEffect(() => {
        if (!mountRef.current) return;

        // Scene Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // Initialize Particles (Heart Default)
        const initialPoints = createHeart();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(initialPoints, 3));
        geometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPoints.slice(), 3));

        // Initialize Velocities Buffer for Physics
        const particleCount = initialPoints.length / 3;
        velocitiesRef.current = new Float32Array(particleCount * 3);

        const material = new THREE.PointsMaterial({
            color: colorRef.current,
            size: 0.2,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        particlesRef.current = points;
        scene.add(points);

        // Load MediaPipe
        const startTracking = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
                const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 2
                });
                handLandmarkerRef.current = handLandmarker;

                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = () => {
                        setLoading("");
                        animate();
                    };
                }
            } catch (err) {
                console.error(err);
                setLoading("Camera access denied or error loading model.");
            }
        };

        startTracking();

        const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(t => t.stop());
            }
        };
    }, []); // Empty dependency array = true run once

    return (
        <div className="relative w-full h-full">
            <div ref={mountRef} className="w-full h-full block" />
            
            {/* Hidden Video Element for MediaPipe */}
            <video 
                ref={videoRef} 
                className="absolute top-4 right-4 w-32 h-24 object-cover rounded-lg opacity-40 hover:opacity-100 transition-opacity -scale-x-100 border border-white/20" 
                autoPlay playsInline muted 
            />

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-indigo-300 font-light tracking-wider animate-pulse">{loading}</p>
                    </div>
                </div>
            )}

            {/* Status Indicator */}
            {!loading && handsDetected && (
                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-md">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-xs font-medium tracking-wide">HANDS CONNECTED</span>
                </div>
            )}
        </div>
    );
};

export default ParticleCanvas;