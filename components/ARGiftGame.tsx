
import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gift } from '../types';
import { ADS, APP_LINK, GLOBOS_LINK } from '../constants';

interface ARGiftGameProps {
    onCollect: (points: number) => void;
    onOpenLeaderboard: () => void;
    onExit: () => void;
}

const WAVE_GOALS = [5, 6, 8, 10, 12, 15, 20];
const REST_TIME = 5; 
const BAD_WORDS = ['bad', 'stupid', 'hate', 'kill', 'fuck', 'shit', 'ass', 'bitch']; // Basic filter

const ARGiftGame: React.FC<ARGiftGameProps> = ({ onCollect, onOpenLeaderboard, onExit }) => {
    // Game State
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isGameOver, setIsGameOver] = useState(false);
    
    // Animation State
    const [collectedIds, setCollectedIds] = useState<number[]>([]);
    
    // Wave State
    const [wave, setWave] = useState(1);
    const [collectedInWave, setCollectedInWave] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(REST_TIME);
    const [restAd, setRestAd] = useState<{title: string, body: string} | null>(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', nickname: '' });
    const [formError, setFormError] = useState('');

    const requestRef = useRef<number | null>(null);
    
    // Determine target for current wave
    const giftsNeeded = WAVE_GOALS[Math.min(wave - 1, WAVE_GOALS.length - 1)];

    // Calculate difficulty based on wave
    const getWaveDifficulty = () => {
        // Gentle speed increase (0.1 per wave)
        const speedMultiplier = 1 + (wave * 0.1); 
        
        // Slower decay for lifespan (starts at 5000ms, drops slowly)
        const baseLifespan = Math.max(2000, 5000 - ((wave - 1) * 400)); 
        
        return { speedMultiplier, baseLifespan };
    };

    // --- AUDIO FX ---
    const playCollectSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            // Cyber-Coin Sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6 (Slide up)
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            // Audio context might be blocked or not supported
        }
    };

    // --- SPAWNER ---
    const createRandomGift = (): Gift => {
        const { speedMultiplier, baseLifespan } = getWaveDifficulty();
        const startZ = Math.random() * 1.5 + 0.2; 
        
        return {
            id: Date.now() + Math.random(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 10,
            z: startZ, 
            vx: (Math.random() - 0.5) * 0.4 * speedMultiplier,
            vy: (Math.random() - 0.5) * 0.4 * speedMultiplier,
            vz: (Math.random() - 0.5) * 0.06 * speedMultiplier,
            rot: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 5,
            createdAt: Date.now(),
            lifespan: baseLifespan
        };
    };

    // Spawning Loop
    useEffect(() => {
        if (isResting || isGameOver) return;

        const intervalTime = Math.max(1000, 3000 - ((wave - 1) * 300)); 

        const spawnInterval = setInterval(() => {
            setGifts(current => {
                const activeGifts = current.length; // Count gifts
                // If we have enough collected OR enough active on screen, don't spawn
                if (collectedInWave + activeGifts >= giftsNeeded) return current;
                if (activeGifts >= 6) return current; 
                return [...current, createRandomGift()];
            });
        }, intervalTime);

        return () => clearInterval(spawnInterval);
    }, [isResting, isGameOver, collectedInWave, giftsNeeded, wave]);

    // --- REST TIMER ---
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isResting) {
            setRestTimer(REST_TIME);
            interval = setInterval(() => {
                setRestTimer(prev => {
                    if (prev <= 1) {
                        setIsResting(false);
                        setWave(w => w + 1);
                        setCollectedInWave(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isResting]);


    // --- PHYSICS & LOGIC LOOP ---
    const animate = useCallback(() => {
        if (isGameOver || isResting) return;

        const now = Date.now();

        setGifts(prevGifts => {
            const nextGifts: Gift[] = [];
            let livesLost = 0;

            prevGifts.forEach(g => {
                // If it's being collected (animation playing), just keep it in place or let it float
                if (collectedIds.includes(g.id)) {
                    nextGifts.push(g);
                    return;
                }

                // Check Expiration (Missed Gift)
                if (now - g.createdAt > g.lifespan) {
                    livesLost++;
                    return; // Remove gift
                }

                // Physics Movement
                let nx = g.x + g.vx;
                let ny = g.y + g.vy;
                let nz = g.z + g.vz;
                let nrot = g.rot + g.vRot;

                let nvx = g.vx;
                let nvy = g.vy;
                let nvz = g.vz;

                // Bounce off walls
                if (nx <= 2 || nx >= 98) nvx *= -1;
                if (ny <= 2 || ny >= 85) nvy *= -1;

                // Bounce off depth limits
                if (nz <= 0.2) {
                    nz = 0.2;
                    nvz = Math.abs(nvz) + 0.005;
                } else if (nz >= 2.0) {
                    nz = 2.0;
                    nvz = -Math.abs(nvz) - 0.005;
                }

                // Random jitter
                if (Math.random() < 0.05) {
                    nvx += (Math.random() - 0.5) * 0.05;
                    nvy += (Math.random() - 0.5) * 0.05;
                }

                nextGifts.push({
                    ...g,
                    x: nx,
                    y: ny,
                    z: nz,
                    vx: nvx,
                    vy: nvy,
                    vz: nvz,
                    rot: nrot
                });
            });

            // Update Lives
            if (livesLost > 0) {
                setLives(prev => {
                    const newLives = prev - livesLost;
                    if (newLives <= 0) {
                        setIsGameOver(true);
                        return 0;
                    }
                    return newLives;
                });
            }

            return nextGifts;
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [isGameOver, isResting, collectedIds]);

    useEffect(() => {
        if (!isGameOver && !isResting) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animate, isGameOver, isResting]);

    // --- INTERACTION ---
    const handleGiftClick = (id: number, e: React.MouseEvent | React.TouchEvent, z: number) => {
        if (isGameOver || collectedIds.includes(id)) return;
        e.stopPropagation();
        
        // 1. Play Sound
        playCollectSound();

        // 2. Mark as Collecting (starts visual animation)
        setCollectedIds(prev => [...prev, id]);

        let difficulty = 0;
        if (z < 0.5) difficulty = 1;
        else if (z < 1.0) difficulty = 3;
        else difficulty = 5;
        
        const gainedPoints = difficulty * 20;
        setScore(s => s + gainedPoints);
        onCollect(gainedPoints);

        // 3. Trigger Enhanced Confetti
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const x = clientX / window.innerWidth;
        const y = clientY / window.innerHeight;

        // Burst 1: Golden Stars (Points)
        confetti({
            particleCount: 20 + (difficulty * 5),
            spread: 60,
            origin: { x, y },
            colors: ['#fbbf24', '#f59e0b', '#ffffff'],
            shapes: ['star'],
            scalar: 1.2,
            zIndex: 150,
            gravity: 0.8,
            ticks: 60,
            disableForReducedMotion: true
        });

        // Burst 2: Holographic Debris (Cyan/Magenta Squares)
        setTimeout(() => {
            confetti({
                particleCount: 30,
                spread: 100,
                origin: { x, y },
                colors: ['#22d3ee', '#e879f9', '#ffffff'],
                shapes: ['square', 'circle'],
                scalar: 0.6,
                zIndex: 140,
                gravity: 0.5,
                startVelocity: 25,
                decay: 0.9,
                ticks: 150,
                disableForReducedMotion: true
            });
        }, 50);

        // 4. Remove Logic after Animation
        const nextCount = collectedInWave + 1;
        setCollectedInWave(nextCount);

        setTimeout(() => {
            setGifts(current => current.filter(g => g.id !== id));
            setCollectedIds(prev => prev.filter(cid => cid !== id));

            // Check Wave Completion AFTER animation ensures smoothness
            if (nextCount >= giftsNeeded) {
                setIsResting(true);
                const randomAd = ADS[Math.floor(Math.random() * ADS.length)];
                setRestAd({ title: randomAd.title, body: randomAd.body });

                setTimeout(() => {
                    confetti({
                        particleCount: 150,
                        spread: 120,
                        origin: { y: 0.5 },
                        colors: ['#4ade80', '#fbbf24', '#ffffff', '#22d3ee'],
                        zIndex: 200,
                        ticks: 300
                    });
                }, 300);
            }
        }, 500); // 500ms matches CSS transition
    };

    // --- FORM SUBMISSION ---
    const handleFormSubmit = () => {
        // Validation
        if (!formData.name || !formData.email || !formData.nickname) {
            setFormError("All fields are required.");
            return;
        }
        
        // Profanity Check
        const lowerNick = formData.nickname.toLowerCase();
        if (BAD_WORDS.some(word => lowerNick.includes(word))) {
            setFormError("Nickname contains inappropriate words.");
            return;
        }

        // SAVE TO LEADERBOARD LIST (Local "Database")
        const entry = {
            id: Date.now().toString(),
            nickname: formData.nickname,
            score: score,
            date: new Date().toISOString()
        };
        
        // Get existing list
        const existingData = localStorage.getItem('leaderboardData');
        let currentList = existingData ? JSON.parse(existingData) : [];
        if (!Array.isArray(currentList)) currentList = [];
        
        // Append new entry
        currentList.push(entry);
        
        // Save back
        localStorage.setItem('leaderboardData', JSON.stringify(currentList));
        
        // Also save last user info for convenience
        localStorage.setItem('lastUserEntry', JSON.stringify(entry));
        
        onOpenLeaderboard();
        onExit();
    };

    return (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden perspective-1000">
            <style>{`
                @keyframes hologramScan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                @keyframes floatPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.05); filter: brightness(1.2); } }
                @keyframes heartbeat { 0% { transform: scale(1); } 25% { transform: scale(1.2); } 50% { transform: scale(1); } 75% { transform: scale(1.2); } }
                @keyframes shockwave { 0% { transform: scale(0.8); opacity: 1; border-width: 6px; } 100% { transform: scale(2); opacity: 0; border-width: 0px; } }
            `}</style>
            
            {/* TOP HUD: LIVES & WAVE */}
            <div className="absolute top-28 left-0 right-0 flex justify-center items-center gap-6 z-50 pointer-events-auto">
                {/* Wave Info */}
                <div className="bg-black/60 backdrop-blur-md border border-green-500/50 px-4 py-1 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                    <span className="text-green-400 font-orbitron font-bold text-sm">WAVE {wave}</span>
                    <div className="w-px h-4 bg-white/20"></div>
                    <span className="text-white font-exo2 text-xs">{collectedInWave} / {giftsNeeded}</span>
                </div>

                {/* Lives */}
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <i 
                            key={i} 
                            className={`fas fa-heart text-xl transition-all duration-300 ${i < lives ? 'text-red-500 drop-shadow-[0_0_10px_red]' : 'text-gray-600'}`}
                            style={i < lives ? { animation: 'heartbeat 1.5s infinite' } : {}}
                        ></i>
                    ))}
                </div>
            </div>

            {/* GAME OVER MODAL */}
            {isGameOver && (
                <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300 pointer-events-auto">
                    <div className="w-full max-w-md bg-zinc-900 border-2 border-red-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                        <h2 className="text-3xl font-orbitron font-bold text-red-500 text-center mb-1 animate-pulse">GAME OVER</h2>
                        <div className="text-center font-exo2 text-gray-400 mb-6">You missed 3 signals.</div>
                        
                        <div className="flex justify-center mb-6">
                            <div className="bg-black border border-amber-500 px-6 py-3 rounded-lg">
                                <span className="text-gray-400 text-xs block text-center tracking-widest uppercase">Final Score</span>
                                <span className="text-4xl font-orbitron font-bold text-amber-400">{score}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-white font-bold font-orbitron text-sm border-b border-gray-700 pb-2">WEEKLY REWARD REGISTRATION</h3>
                            
                            <input 
                                type="text" placeholder="Full Name (Private)"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                            />
                            <input 
                                type="email" placeholder="Email (Private)"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                            />
                            
                            <div className="relative">
                                <input 
                                    type="text" placeholder="Nickname (Public Leaderboard)"
                                    value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})}
                                    maxLength={12}
                                    className="w-full bg-black/50 border border-amber-400/50 rounded px-3 py-2 text-amber-400 font-bold text-sm outline-none focus:border-amber-400 focus:shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                />
                                <i className="fas fa-globe absolute right-3 top-2.5 text-gray-500 text-xs"></i>
                            </div>

                            {formError && <div className="text-red-400 text-xs font-bold text-center">{formError}</div>}
                            
                            <button 
                                onClick={handleFormSubmit}
                                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-orbitron font-bold py-3 rounded-lg mt-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95"
                            >
                                SUBMIT SCORE
                            </button>
                        </div>
                        
                        <p className="text-[9px] text-gray-500 text-center mt-4">
                            *Personal data is used only for reward delivery. Only Nickname is public.
                        </p>
                    </div>
                </div>
            )}

            {/* REST MODE OVERLAY (UNCHANGED) */}
            {isResting && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out] bg-black/40 backdrop-blur-sm pointer-events-auto">
                    <div className="text-center p-4 transform transition-all w-full max-w-md flex flex-col items-center">
                        <div className="flex gap-3 mb-6 animate-[slideDown_0.5s_ease-out]">
                            <div 
                                onClick={() => window.open(APP_LINK, '_blank')}
                                className="bg-black/80 border border-white/30 backdrop-blur-sm px-4 py-2 rounded flex items-center gap-2 border-l-4 border-l-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-pointer hover:bg-gray-800 transition-all active:scale-95"
                            >
                                <i className="fas fa-taxi text-amber-400 text-xl"></i>
                                <span className="text-sm font-bold font-exo2 tracking-wide text-amber-400">CITY APP</span>
                            </div>
                            <div 
                                onClick={() => window.open(GLOBOS_LINK, '_blank')}
                                className="bg-black/80 border border-white/30 backdrop-blur-sm px-4 py-2 rounded flex items-center gap-2 border-l-4 border-l-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)] cursor-pointer hover:bg-gray-800 transition-all active:scale-95"
                            >
                                <i className="fas fa-shield-alt text-green-400 text-xl"></i>
                                <span className="text-sm font-bold font-exo2 tracking-wide text-green-400">GLOBOS</span>
                            </div>
                        </div>

                         <h2 className="font-orbitron text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-amber-400 font-bold mb-6 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse">
                            WAVE {wave} COMPLETE
                        </h2>
                        
                        {restAd && (
                            <div className="bg-black/80 border-y-2 border-amber-400/50 p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] mb-6 w-full">
                                <div className="text-amber-400 font-orbitron font-bold text-lg mb-2 uppercase tracking-widest border-b border-white/10 pb-2">
                                    {restAd.title}
                                </div>
                                <p className="font-exo2 text-white text-base md:text-lg font-semibold leading-relaxed">
                                    {restAd.body}
                                </p>
                            </div>
                        )}

                        <div className="font-orbitron text-5xl text-white/80 drop-shadow-md">{restTimer}</div>
                        <div className="text-xs text-gray-400 mt-2 font-orbitron tracking-widest">NEXT WAVE STARTING...</div>
                    </div>
                </div>
            )}

            {/* GIFTS */}
            {!isResting && !isGameOver && gifts.map((gift) => {
                const now = Date.now();
                const timeLeft = Math.max(0, gift.lifespan - (now - gift.createdAt));
                const lifePercent = timeLeft / gift.lifespan;
                const isExpiring = lifePercent < 0.3;
                const isCollected = collectedIds.includes(gift.id);

                const isFar = gift.z < 0.6;
                const blurAmount = isFar ? (0.6 - gift.z) * 10 : 0;
                const opacity = Math.min(1, Math.max(0.4, gift.z + 0.1));
                const zIndex = Math.floor(gift.z * 100);

                return (
                    <div
                        key={gift.id}
                        onMouseDown={(e) => handleGiftClick(gift.id, e, gift.z)}
                        onTouchStart={(e) => handleGiftClick(gift.id, e, gift.z)}
                        className={`absolute cursor-pointer pointer-events-auto will-change-transform group ${isCollected ? 'transition-all duration-300 scale-[2] opacity-0' : ''}`}
                        style={{
                            left: `${gift.x}%`,
                            top: `${gift.y}%`,
                            transform: `translate(-50%, -50%) scale(${gift.z}) rotate(${gift.rot}deg)`,
                            zIndex: zIndex,
                            opacity: isCollected ? 0 : opacity,
                            filter: isCollected ? 'brightness(2) blur(2px)' : `blur(${blurAmount}px)`
                        }}
                    >
                        {/* Expiration Ring */}
                        {isExpiring && !isCollected && (
                            <div className="absolute inset-[-20%] border-2 border-red-500 rounded-full animate-ping opacity-50"></div>
                        )}

                        <div className={`relative w-32 h-32 flex items-center justify-center transition-transform duration-200 active:scale-95 ${isExpiring && !isCollected ? 'animate-pulse' : ''}`} style={{ animation: isExpiring && !isCollected ? 'none' : 'floatPulse 3s infinite ease-in-out' }}>
                            
                            {/* Outer Hologram Ring 1 */}
                            <div className={`absolute inset-0 border ${isExpiring ? 'border-red-500' : 'border-cyan-400/30'} rounded-full animate-[spin_8s_linear_infinite]`}></div>
                            
                            {/* Outer Hologram Ring 2 (Counter Spin) */}
                            <div className={`absolute inset-2 border border-dashed ${isExpiring ? 'border-red-500' : 'border-amber-400/40'} rounded-full animate-[spin_6s_linear_infinite_reverse]`}></div>
                            
                            {/* Main Hex/Cube Container */}
                            <div className={`absolute inset-4 bg-gradient-to-br from-cyan-900/40 to-amber-900/20 backdrop-blur-sm border ${isExpiring ? 'border-red-500' : 'border-cyan-400/50'} rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] overflow-hidden group-hover:border-white/80 transition-colors`}>
                                
                                {/* Scanline Effect */}
                                <div className={`absolute w-full h-1 ${isExpiring ? 'bg-red-500/50' : 'bg-cyan-400/50'} blur-[2px] shadow-[0_0_10px_#22d3ee] mix-blend-screen`} 
                                     style={{ animation: 'hologramScan 2s linear infinite' }}></div>
                                
                                {/* Grid Pattern Overlay */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] mix-blend-screen"></div>
                            </div>
                            
                            {/* Icon Center */}
                            <i className={`fas fa-gift text-5xl ${isExpiring ? 'text-red-500' : 'text-amber-400'} relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,1)] filter brightness-110`}></i>
                            
                            {/* Collection Text Popup */}
                            {isCollected && (
                                <div className="absolute z-20 font-orbitron font-bold text-amber-300 text-lg whitespace-nowrap animate-[pop_0.3s_ease-out]">
                                    +POINTS
                                </div>
                            )}

                             {/* Collection Shockwave */}
                            {isCollected && (
                                <div className="absolute inset-0 rounded-full border-cyan-400 animate-[shockwave_0.5s_ease-out]" style={{ animationFillMode: 'forwards' }}></div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ARGiftGame;
