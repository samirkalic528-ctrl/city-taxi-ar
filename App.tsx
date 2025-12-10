
import React, { useState, useEffect, useRef } from 'react';
import StartScreen from './components/StartScreen';
import VideoBackground from './components/VideoBackground';
import ChatBot from './components/ChatBot';
import ARGiftGame from './components/ARGiftGame';
import GamesOverlay from './components/GamesOverlay';
import Leaderboard from './components/Leaderboard';
import HUD from './components/HUD';
import { AppState, GeoState, GameType } from './types';
import confetti from 'canvas-confetti';

// Helper for manual speed calculation (Haversine formula subset)
const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radius of earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.LOADING);
    const [geo, setGeo] = useState<GeoState>({ speed: 0, lat: 44.7866, lng: 20.4489 });
    const [currentTime, setCurrentTime] = useState("12:00");
    const [streak, setStreak] = useState(1);
    const [points, setPoints] = useState(0); 
    const [showModal, setShowModal] = useState<'none' | 'phone' | 'reward' | 'status'>('none');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Game State
    const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);
    const [showGameMenu, setShowGameMenu] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Refs for manual speed calculation and throttling
    const lastPosRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
    const lastGeoUpdateRef = useRef<number>(0); // Throttle Ref

    // Clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Geolocation with Manual Speed Fallback AND Throttling
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    // THROTTLING: Only update max once per second (1000ms)
                    const now = Date.now();
                    if (now - lastGeoUpdateRef.current < 1000) return;
                    lastGeoUpdateRef.current = now;

                    let currentSpeed = 0;
                    
                    // 1. Try to use hardware speed (converted to km/h)
                    if (pos.coords.speed !== null && pos.coords.speed >= 0) {
                        currentSpeed = Math.round(pos.coords.speed * 3.6);
                    } 
                    // 2. Fallback: Calculate manually if hardware speed is null/missing
                    else if (lastPosRef.current) {
                        const dist = getDistanceFromLatLonInMeters(
                            lastPosRef.current.lat, 
                            lastPosRef.current.lng, 
                            pos.coords.latitude, 
                            pos.coords.longitude
                        );
                        const timeDiff = (pos.timestamp - lastPosRef.current.time) / 1000; // seconds
                        
                        if (timeDiff > 0 && dist > 2) { // Only update if moved > 2 meters to avoid jitter
                            const mps = dist / timeDiff;
                            currentSpeed = Math.round(mps * 3.6);
                        }
                    }

                    // Update Ref
                    lastPosRef.current = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        time: pos.timestamp
                    };

                    setGeo({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        speed: currentSpeed 
                    });
                },
                (err) => console.log("Geo error", err),
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Streak Logic (Fixed)
    useEffect(() => {
        const storedPhone = localStorage.getItem('userPhone');
        const storedStreak = parseInt(localStorage.getItem('streak') || '0');
        const lastVisit = localStorage.getItem('lastVisit');
        
        // Dates
        const today = new Date();
        const todayStr = today.toDateString();
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (storedPhone) setPhoneNumber(storedPhone);

        if (!lastVisit) {
            setStreak(1);
            localStorage.setItem('streak', '1');
            localStorage.setItem('lastVisit', todayStr);
        } else if (lastVisit === todayStr) {
            setStreak(Math.max(1, storedStreak)); // Keep current
        } else if (lastVisit === yesterdayStr) {
            const newStreak = Math.min(storedStreak + 1, 5);
            setStreak(newStreak);
            localStorage.setItem('streak', newStreak.toString());
            localStorage.setItem('lastVisit', todayStr);
        } else {
            // Streak broken
            setStreak(1);
            localStorage.setItem('streak', '1');
            localStorage.setItem('lastVisit', todayStr);
        }
    }, []);

    const handleRewardClick = () => {
        if (!phoneNumber) {
            setShowModal('phone');
        } else {
            if (streak >= 5) {
                setShowModal('reward');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#fbbf24', '#4ade80', '#ffffff']
                });
            } else {
                setShowModal('status');
            }
        }
    };

    const handlePhoneSubmit = () => {
        if (phoneNumber.length > 5) {
            localStorage.setItem('userPhone', phoneNumber);
            setShowModal('none');
            setTimeout(handleRewardClick, 300);
        }
    };

    const handleCollectGift = (val: number) => {
        setPoints(prev => prev + val);
    };
    
    const handleGameSelect = (game: GameType) => {
        setActiveGame(game);
        if (game === GameType.AR_HUNT) {
            setShowGameMenu(false); 
        } 
    };

    const handleOpenLeaderboard = () => {
        setShowLeaderboard(true);
    };

    const handleCloseLeaderboard = () => {
        setShowLeaderboard(false);
        setActiveGame(GameType.NONE); 
        setShowGameMenu(false);
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden text-white select-none">
            {/* Scanline Overlay */}
            <div className="scanline z-50 opacity-20 pointer-events-none"></div>

            {/* 1. Start Screen */}
            {appState === AppState.LOADING && (
                <StartScreen onComplete={() => setAppState(AppState.ACTIVE)} />
            )}

            {/* 2. Main AR View */}
            <div className={`transition-opacity duration-1000 w-full h-full ${appState === AppState.ACTIVE ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Background Camera Feed */}
                <VideoBackground />

                {/* AR GAME LAYER (Only active if AR_HUNT is selected) */}
                {appState === AppState.ACTIVE && activeGame === GameType.AR_HUNT && (
                    <ARGiftGame 
                        onCollect={handleCollectGift} 
                        onOpenLeaderboard={handleOpenLeaderboard}
                        onExit={() => setActiveGame(GameType.NONE)}
                    />
                )}

                {/* HUD Interface */}
                <HUD 
                    currentTime={currentTime}
                    geo={geo}
                    streak={streak}
                    points={points}
                    onRewardClick={handleRewardClick}
                    onGameMenuClick={() => { setShowGameMenu(true); setActiveGame(GameType.NONE); }}
                >
                    {/* Render GamesOverlay INSIDE HUD Middle Area */}
                    {showGameMenu && (
                        <GamesOverlay 
                            activeGame={activeGame} 
                            onSelectGame={handleGameSelect} 
                            onClose={() => setShowGameMenu(false)}
                            onScoreUpdate={handleCollectGift}
                            onOpenLeaderboard={handleOpenLeaderboard}
                        />
                    )}
                </HUD>

                {/* AI Chatbot Overlay (Floating on top) */}
                <ChatBot />

                {/* MODALS */}
                {showModal !== 'none' && (
                    <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border-2 border-amber-400 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(251,191,36,0.4)] animate-[pop_0.3s_ease-out]">
                            {showModal === 'phone' && (
                                <>
                                    <i className="fas fa-mobile-alt text-5xl text-green-400 mb-4"></i>
                                    <h2 className="font-orbitron text-2xl text-amber-400 font-bold mb-2">WELCOME</h2>
                                    <p className="font-exo2 text-gray-300 mb-4">Enter your number to track rewards.</p>
                                    <input 
                                        type="tel" 
                                        className="w-full bg-white/10 border-2 border-green-400 rounded-lg px-4 py-3 text-center text-xl text-green-400 outline-none mb-4 font-orbitron placeholder-green-400/30"
                                        placeholder="06x xxx xxxx"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                    <button onClick={handlePhoneSubmit} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold font-orbitron py-3 rounded-lg transition-colors">SAVE NUMBER</button>
                                </>
                            )}

                            {showModal === 'reward' && (
                                <>
                                    <i className="fas fa-trophy text-5xl text-amber-400 mb-4 animate-bounce"></i>
                                    <h2 className="font-orbitron text-2xl text-white font-bold mb-2">CONGRATULATIONS!</h2>
                                    <p className="font-exo2 text-gray-300 mb-4">You've reached a 5-day streak! Here is your discount code:</p>
                                    <div className="bg-black border border-dashed border-green-400 p-3 w-full mb-4">
                                        <span className="font-mono text-xl text-green-400 tracking-widest">CITY-{phoneNumber.slice(-4)}-WIN</span>
                                    </div>
                                    <button onClick={() => setShowModal('none')} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold font-orbitron py-3 rounded-lg">CLOSE</button>
                                </>
                            )}

                             {showModal === 'status' && (
                                <>
                                    <i className="fas fa-fire text-5xl text-orange-500 mb-4"></i>
                                    <h2 className="font-orbitron text-2xl text-amber-400 font-bold mb-2">STATUS CHECK</h2>
                                    <p className="font-exo2 text-gray-300 mb-6 text-lg">
                                        Current Streak: <span className="text-white font-bold">{streak}/5</span><br/>
                                        Come back {5 - streak} more days for a reward!
                                    </p>
                                    <button onClick={() => setShowModal('none')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold font-orbitron py-3 rounded-lg">GOT IT</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {/* LEADERBOARD OVERLAY */}
                {showLeaderboard && (
                    <Leaderboard onClose={handleCloseLeaderboard} />
                )}
            </div>
        </div>
    );
};

export default App;
