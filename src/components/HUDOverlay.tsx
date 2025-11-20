import React from 'react';
import { Scan, Activity, Cpu, Wifi } from 'lucide-react';

interface HUDOverlayProps {
    faces: any[];
    hands: any[];
    moods: string[];
    identities: string[];
    gestures: string[];
}

const HUDOverlay: React.FC<HUDOverlayProps> = ({ faces, hands, moods, identities, gestures }) => {
    return (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="bg-cyber-panel border border-cyber-primary/50 p-3 rounded-lg backdrop-blur-sm">
                        <h1 className="font-orbitron text-2xl text-cyber-primary text-glow font-bold tracking-wider">
                            SENTINEL<span className="text-white">OS</span>
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-cyber-secondary mt-1 font-rajdhani">
                            <Activity size={14} className="animate-pulse" />
                            <span>SYSTEM ONLINE</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="bg-cyber-panel border border-cyber-secondary/50 p-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <Wifi size={18} className="text-cyber-secondary" />
                        <span className="text-cyber-secondary font-rajdhani font-bold">CONNECTED</span>
                    </div>
                    <div className="bg-cyber-panel border border-cyber-accent/50 p-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <Cpu size={18} className="text-cyber-accent" />
                        <span className="text-cyber-accent font-rajdhani font-bold">AI ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Center Reticle (Decorative) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                <Scan size={300} className="text-cyber-primary animate-pulse-fast" strokeWidth={0.5} />
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-end">
                <div className="bg-cyber-panel border-t-2 border-cyber-primary/50 p-4 rounded-tr-2xl backdrop-blur-md max-w-md">
                    <h3 className="text-cyber-primary font-orbitron text-sm mb-2">LIVE TELEMETRY</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-rajdhani">
                        <div>
                            <span className="text-gray-400">FACES DETECTED:</span>
                            <span className="text-white text-lg font-bold ml-2">{faces.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">HANDS DETECTED:</span>
                            <span className="text-white text-lg font-bold ml-2">{hands.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Overlays for Faces */}
            {faces.map((face, idx) => (
                <div
                    key={`face-${idx}`}
                    className="absolute border-2 border-cyber-secondary/80 rounded-lg p-2 bg-cyber-secondary/10 backdrop-blur-sm transition-all duration-200 ease-out"
                    style={{
                        left: `${face.box.x * 100}%`,
                        top: `${face.box.y * 100}%`,
                        width: `${face.box.width * 100}%`,
                        height: `${face.box.height * 100}%`,
                    }}
                >
                    {/* Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white"></div>

                    {/* Info Tag */}
                    <div className="absolute -top-12 left-0 bg-cyber-panel border border-cyber-secondary text-cyber-secondary px-3 py-1 rounded text-xs font-orbitron whitespace-nowrap">
                        <div className="text-white font-bold text-sm">{identities[idx] || 'UNKNOWN'}</div>
                        <div>MOOD: {moods[idx] || 'ANALYZING...'}</div>
                    </div>
                </div>
            ))}

            {/* Dynamic Overlays for Hands */}
            {hands.map((hand, idx) => {
                // Calculate bounding box for hand
                let minX = 1, minY = 1, maxX = 0, maxY = 0;
                for (const lm of hand) {
                    if (lm.x < minX) minX = lm.x;
                    if (lm.x > maxX) maxX = lm.x;
                    if (lm.y < minY) minY = lm.y;
                    if (lm.y > maxY) maxY = lm.y;
                }
                const width = maxX - minX;
                const height = maxY - minY;

                return (
                    <div
                        key={`hand-${idx}`}
                        className="absolute border border-cyber-accent/50 rounded-lg bg-cyber-accent/5 backdrop-blur-sm transition-all duration-200 ease-out"
                        style={{
                            left: `${minX * 100}%`,
                            top: `${minY * 100}%`,
                            width: `${width * 100}%`,
                            height: `${height * 100}%`,
                        }}
                    >
                        <div className="absolute -bottom-8 right-0 bg-cyber-panel border border-cyber-accent text-cyber-accent px-2 py-1 rounded text-xs font-orbitron whitespace-nowrap">
                            GESTURE: {gestures[idx] || 'UNKNOWN'}
                        </div>

                        {/* Render Skeleton Points */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                            {hand.map((lm: any, i: number) => (
                                <circle
                                    key={i}
                                    cx={`${(lm.x - minX) / width * 100}%`}
                                    cy={`${(lm.y - minY) / height * 100}%`}
                                    r="2"
                                    fill="#ff0055"
                                />
                            ))}
                        </svg>
                    </div>
                );
            })}
        </div>
    );
};

export default HUDOverlay;
