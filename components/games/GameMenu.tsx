
import React, { useState, useEffect } from 'react';
import { GameType } from '../../types';
import { WEEKLY_PRIZES } from '../../constants';

interface GameMenuProps {
    onSelectGame: (game: GameType) => void;
    onOpenLeaderboard: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSelectGame, onOpenLeaderboard }) => {
    const [prizeIdx, setPrizeIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPrizeIdx(prev => (prev + 1) % WEEKLY_PRIZES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const currentPrize = WEEKLY_PRIZES[prizeIdx];

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm pointer-events-auto scale-75 md:scale-90 origin-center max-h-full overflow-y-auto no-scrollbar">
            
            {/* PRIZE BANNER */}
            <div className="bg-gradient-to-r from-black/80 to-amber-900/50 border border-amber-400/50 p-3 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(251,191,36,0.2)] mb-2">
                <div className={`w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0 ${currentPrize.color}`}>
                    <i className={`fas ${currentPrize.icon} text-xl animate-pulse`}></i>
                </div>
                <div className="flex-1 overflow-hidden">
                     <div className="text-[9px] text-amber-400 font-bold uppercase tracking-widest truncate">THIS WEEK: {currentPrize.sponsor}</div>
                     <div className="text-white font-orbitron font-bold text-xs truncate leading-tight">{currentPrize.item}</div>
                </div>
            </div>

            {/* Leaderboard Button */}
            <button onClick={onOpenLeaderboard} className="bg-amber-500/80 hover:bg-amber-400 text-black font-bold font-orbitron py-2 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all flex justify-center items-center gap-2 mb-2">
                <i className="fas fa-trophy"></i> LEADERBOARD
            </button>

            <div className="grid grid-cols-2 gap-3 pb-4">
                <button onClick={() => onSelectGame(GameType.AR_HUNT)} className="bg-black/50 backdrop-blur-md border border-green-500/50 hover:bg-green-500/30 p-3 rounded-xl flex flex-col items-center gap-1 group transition-all shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                    <i className="fas fa-gift text-2xl text-green-400 group-hover:scale-110 transition-transform"></i>
                    <span className="font-orbitron font-bold text-white text-sm drop-shadow-md">AR HUNT</span>
                    <span className="text-[9px] text-gray-300">Collect in 3D</span>
                </button>
                <button onClick={() => onSelectGame(GameType.TIC_TAC_TOE)} className="bg-black/50 backdrop-blur-md border border-red-500/50 hover:bg-red-900/40 p-3 rounded-xl flex flex-col items-center gap-1 group transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                    <i className="fas fa-hashtag text-2xl text-red-500 group-hover:scale-110 transition-transform"></i>
                    <span className="font-orbitron font-bold text-white text-sm drop-shadow-md">TIC TAC TOE</span>
                    <span className="text-[9px] text-gray-300">City vs Globos</span>
                </button>
                <button onClick={() => onSelectGame(GameType.NEON_TRIVIA)} className="bg-black/50 backdrop-blur-md border border-cyan-500/50 hover:bg-cyan-500/30 p-3 rounded-xl flex flex-col items-center gap-1 group transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <i className="fas fa-brain text-2xl text-cyan-400 group-hover:scale-110 transition-transform"></i>
                    <span className="font-orbitron font-bold text-white text-sm drop-shadow-md">TRIVIA</span>
                    <span className="text-[9px] text-gray-300">Knowledge</span>
                </button>
                <button onClick={() => onSelectGame(GameType.REFLEX_GRID)} className="bg-black/50 backdrop-blur-md border border-purple-500/50 hover:bg-purple-500/30 p-3 rounded-xl flex flex-col items-center gap-1 group transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <i className="fas fa-hand-pointer text-2xl text-purple-400 group-hover:scale-110 transition-transform"></i>
                    <span className="font-orbitron font-bold text-white text-sm drop-shadow-md">REFLEX</span>
                    <span className="text-[9px] text-gray-300">Speed</span>
                </button>
                <button onClick={() => onSelectGame(GameType.TRAFFIC_SIMON)} className="col-span-2 bg-black/50 backdrop-blur-md border border-red-500/50 hover:bg-red-500/30 p-3 rounded-xl flex flex-col items-center gap-1 group transition-all shadow-[0_0_15px_rgba(248,113,113,0.2)]">
                    <i className="fas fa-traffic-light text-2xl text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span className="font-orbitron font-bold text-white text-sm drop-shadow-md">TRAFFIC MEMORY</span>
                </button>
            </div>
        </div>
    );
};

export default GameMenu;
