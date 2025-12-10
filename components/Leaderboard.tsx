
import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { ADMIN_EMAIL, WEEKLY_PRIZES } from '../constants';

interface LeaderboardProps {
    onClose: () => void;
}

const MOCK_NAMES = ["NeoRider", "TaxiKing", "SkyWalker", "CityDrift", "GlobosFan", "NightOwl", "SpeedDemon", "SafeDriver"];
const ADMIN_PASS = "GLOBOS-CITY-SECURE-2025";

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const [tab, setTab] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [currentPrizeIdx, setCurrentPrizeIdx] = useState(0);
    
    // Admin State
    const [secretCount, setSecretCount] = useState(0);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    // Rotate Prizes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPrizeIdx(prev => (prev + 1) % WEEKLY_PRIZES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // 1. Get List of ALL User Scores from LocalStorage (Array)
        const storedData = localStorage.getItem('leaderboardData');
        let realEntries: LeaderboardEntry[] = [];
        
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                if (Array.isArray(parsed)) {
                    realEntries = parsed.map((e: any) => ({
                        ...e,
                        isUser: true // Mark all local entries as "User"
                    }));
                }
            } catch (e) {}
        } else {
             // Fallback for old single-entry data format
             const oldSingle = localStorage.getItem('userHighscore');
             if(oldSingle) {
                 try {
                     realEntries.push({...JSON.parse(oldSingle), isUser: true});
                 } catch(e) {}
             }
        }

        // 2. Generate Mock Data (Simulating a Backend)
        const mockData: LeaderboardEntry[] = Array.from({ length: 8 }).map((_, i) => ({
            id: `mock-${i}`,
            nickname: MOCK_NAMES[i % MOCK_NAMES.length] + (Math.floor(Math.random() * 99)),
            score: Math.floor(Math.random() * 500) + 100,
            date: new Date().toISOString()
        }));

        // 3. Merge Real + Mock
        let allEntries = [...realEntries, ...mockData];
        
        // Sort descending
        allEntries.sort((a, b) => b.score - a.score);
        
        // Take top 20
        setEntries(allEntries.slice(0, 20));
    }, [tab]);

    const handleSecretClick = () => {
        if (isAdmin) return;
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        if (newCount === 5) {
            setShowAdminLogin(true);
            setSecretCount(0);
        }
    };

    const handleLogin = () => {
        if (passwordInput === ADMIN_PASS) {
            setIsAdmin(true);
            setShowAdminLogin(false);
            setPasswordInput('');
            setLoginError('');
        } else {
            setLoginError('ACCESS DENIED');
            setPasswordInput('');
        }
    };

    const handleExportReport = () => {
        // Export all local entries
        const storedData = localStorage.getItem('leaderboardData');
        
        let body = "WEEKLY REPORT - CITY TAXI AR\n\n";
        
        if (storedData) {
            const data = JSON.parse(storedData);
            body += `ALL LOCAL ENTRIES (${data.length}):\n`;
            if (Array.isArray(data)) {
                 data.forEach((entry: any, i: number) => {
                     body += `[${i+1}] ${entry.nickname} | ${entry.score} | ${entry.email || 'No Email'} | ${entry.name || 'No Name'}\n`;
                 });
            }
            body += `--------------------------\n`;
        } else {
            body += "No local user data found on this device.\n";
        }
        
        body += "\nTOP 3 CURRENT DISPLAY (MIXED):\n";
        entries.slice(0, 3).forEach((e, i) => {
            body += `#${i+1} ${e.nickname} - ${e.score} pts\n`;
        });

        window.location.href = `mailto:${ADMIN_EMAIL}?subject=CITY TAXI WEEKLY REPORT&body=${encodeURIComponent(body)}`;
    };

    const currentPrize = WEEKLY_PRIZES[currentPrizeIdx];

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 pointer-events-auto">
            <div className="w-full max-w-md bg-zinc-900 border border-amber-400 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.2)] relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-amber-500 p-4 flex justify-between items-center select-none flex-shrink-0">
                    <div className="flex items-center gap-3" onClick={handleSecretClick}>
                        <i className={`fas fa-trophy text-black text-2xl ${isAdmin ? 'animate-bounce' : ''}`}></i>
                        <h2 className="font-orbitron text-2xl text-black font-bold tracking-wider">
                            {isAdmin ? 'ADMIN PANEL' : 'LEADERBOARD'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-black hover:text-white transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* ADMIN LOGIN OVERLAY */}
                {showAdminLogin && (
                    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
                        <i className="fas fa-lock text-red-500 text-4xl mb-4"></i>
                        <h3 className="text-red-500 font-orbitron font-bold text-xl mb-4">RESTRICTED ACCESS</h3>
                        <input 
                            type="password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="ENTER PASSCODE"
                            className="bg-zinc-800 border border-red-500 text-white font-mono text-center px-4 py-2 rounded mb-2 w-full outline-none focus:shadow-[0_0_10px_red]"
                        />
                        {loginError && <div className="text-red-500 text-xs font-bold mb-2">{loginError}</div>}
                        <div className="flex gap-2 w-full">
                            <button onClick={() => setShowAdminLogin(false)} className="flex-1 bg-gray-700 text-white py-2 rounded font-bold text-sm">CANCEL</button>
                            <button onClick={handleLogin} className="flex-1 bg-red-600 text-white py-2 rounded font-bold text-sm">UNLOCK</button>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                {!isAdmin ? (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        
                        {/* PRIZE SHOWCASE */}
                        <div className="bg-black/50 p-4 border-b border-white/10 flex-shrink-0 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl">THIS WEEK'S PRIZE</div>
                            <div className="flex items-center gap-4 relative z-10 transition-all duration-500">
                                <div className={`w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center bg-black/50 ${currentPrize.color}`}>
                                    <i className={`fas ${currentPrize.icon} text-2xl drop-shadow-[0_0_10px_currentColor] animate-pulse`}></i>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-0.5">SPONSORED BY {currentPrize.sponsor}</div>
                                    <div className="text-white font-orbitron font-bold leading-tight">{currentPrize.item}</div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">{currentPrize.desc}</div>
                                </div>
                            </div>
                            
                            {/* Slide indicators */}
                            <div className="flex justify-center gap-1 mt-3">
                                {WEEKLY_PRIZES.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentPrizeIdx ? 'w-4 bg-amber-400' : 'w-1 bg-gray-700'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-amber-500/30 flex-shrink-0">
                            <button 
                                onClick={() => setTab('WEEKLY')}
                                className={`flex-1 py-3 font-orbitron font-bold text-sm transition-colors ${tab === 'WEEKLY' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                THIS WEEK
                            </button>
                            <button 
                                onClick={() => setTab('MONTHLY')}
                                className={`flex-1 py-3 font-orbitron font-bold text-sm transition-colors ${tab === 'MONTHLY' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                THIS MONTH
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-4 overflow-y-auto flex-1 scrollbar-hide">
                            <div className="flex justify-between text-xs text-gray-500 font-exo2 mb-2 px-2">
                                <span>RANK / NICKNAME</span>
                                <span>SCORE</span>
                            </div>
                            
                            <div className="space-y-2">
                                {entries.map((entry, index) => (
                                    <div 
                                        key={entry.id}
                                        className={`flex justify-between items-center p-3 rounded-lg border font-exo2 ${
                                            entry.isUser 
                                            ? 'bg-amber-500/20 border-amber-400 text-white' 
                                            : 'bg-black/40 border-white/10 text-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`font-orbitron font-bold w-6 text-center ${index < 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                                                {index + 1}
                                            </div>
                                            <span className={`font-bold tracking-wide ${entry.isUser ? 'text-amber-400' : ''}`}>
                                                {entry.nickname}
                                            </span>
                                            {index === 0 && <i className="fas fa-crown text-amber-400 text-xs"></i>}
                                        </div>
                                        <div className="font-orbitron font-bold text-amber-400">
                                            {entry.score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="p-3 bg-black/60 text-center border-t border-white/10 flex-shrink-0">
                            <p className="text-[10px] text-gray-500 font-exo2">
                                * Top rank wins the prize shown above.
                                <br/>
                                Real names are hidden for privacy.
                            </p>
                        </div>
                    </div>
                ) : (
                    // ADMIN VIEW
                    <div className="p-6 bg-zinc-900 flex-1 flex flex-col items-center text-center">
                        <i className="fas fa-user-shield text-5xl text-green-500 mb-4"></i>
                        <h3 className="font-orbitron text-xl text-white font-bold mb-2">ADMIN DASHBOARD</h3>
                        <p className="text-gray-400 text-sm mb-8">System Access Granted.</p>
                        
                        <div className="w-full space-y-4">
                            <button 
                                onClick={handleExportReport}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 shadow-lg"
                            >
                                <i className="fas fa-envelope"></i>
                                EXPORT WEEKLY REPORT
                            </button>
                            
                            <div className="p-4 bg-black/50 rounded-lg border border-white/10 text-left">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-green-400 font-mono text-sm">ONLINE - DATA SYNCED</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest mt-2">Target Email</div>
                                <div className="text-white font-mono text-sm">{ADMIN_EMAIL}</div>
                            </div>

                            <button 
                                onClick={() => setIsAdmin(false)}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg mt-4"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
