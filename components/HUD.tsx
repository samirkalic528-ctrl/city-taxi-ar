
import React from 'react';
import AdBanner from './AdBanner';
import MapWidget from './MapWidget';
import { GeoState } from '../types';
import { APP_LINK, GLOBOS_LINK } from '../constants';

interface HUDProps {
    currentTime: string;
    geo: GeoState;
    streak: number;
    points: number;
    onRewardClick: () => void;
    onGameMenuClick: () => void;
    children?: React.ReactNode; // For the GamesOverlay
}

const HUD: React.FC<HUDProps> = ({ 
    currentTime, 
    geo, 
    streak, 
    points, 
    onRewardClick, 
    onGameMenuClick,
    children 
}) => {
    return (
        <div className="absolute inset-0 z-10 flex flex-col pointer-events-none overflow-hidden">
            
            {/* SECTION 1: TOP BAR */}
            <div className="flex-none p-4 pb-2 flex justify-between items-start pointer-events-auto z-50 relative">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <div 
                            onClick={() => window.open(APP_LINK, '_blank')}
                            className="bg-black/70 border border-white/30 backdrop-blur-sm px-3 py-1 rounded flex items-center gap-2 border-l-4 border-l-amber-400 active:scale-95 transition-transform cursor-pointer hover:bg-white/10"
                        >
                            <i className="fas fa-taxi text-amber-400"></i>
                            <span className="text-xs font-bold font-exo2 tracking-wide text-amber-400">CITY APP</span>
                        </div>
                        <div 
                            onClick={() => window.open(GLOBOS_LINK, '_blank')}
                            className="bg-black/70 border border-white/30 backdrop-blur-sm px-3 py-1 rounded flex items-center gap-2 border-l-4 border-l-green-400 active:scale-95 transition-transform cursor-pointer hover:bg-white/10"
                        >
                            <i className="fas fa-shield-alt text-green-400"></i>
                            <span className="text-xs font-bold font-exo2 tracking-wide text-green-400">GLOBOS</span>
                        </div>
                    </div>
                    <div className="self-start bg-black/60 px-2 py-0.5 rounded border border-white/10 font-orbitron text-lg font-bold shadow-md">
                        {currentTime}
                    </div>
                </div>

                {/* Top Right Stats Group */}
                <div className="flex flex-col gap-2 items-end">
                    {/* Reward Widget */}
                    <div 
                        onClick={onRewardClick}
                        className={`bg-black/80 border-2 ${streak >= 5 ? 'border-white animate-bounce bg-gradient-to-br from-amber-600 to-amber-400' : 'border-amber-400'} rounded-xl px-3 py-1 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all`}
                    >
                        <i className={`fas fa-gift text-xl ${streak >= 5 ? 'text-white' : 'text-amber-400'}`}></i>
                        <div className="flex flex-col items-end">
                            <span className={`font-orbitron font-black text-base leading-none ${streak >= 5 ? 'text-white' : 'text-white'}`}>{streak}/5</span>
                            <span className="text-[9px] uppercase tracking-wider text-gray-300">DAY STREAK</span>
                        </div>
                    </div>

                    {/* Game Center Button */}
                    <div 
                        onClick={onGameMenuClick}
                        className="bg-black/80 border-2 border-cyan-500 rounded-xl px-3 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer hover:bg-cyan-900/50 transition-colors pointer-events-auto"
                    >
                        <i className="fas fa-gamepad text-cyan-400 text-sm animate-pulse"></i>
                        <div className="flex flex-col items-end">
                            <span className="font-orbitron font-black text-base leading-none text-white">{points}</span>
                            <span className="text-[9px] uppercase tracking-wider text-gray-300">PLAY GAMES</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: AD BANNER */}
            <div className="flex-none px-4 z-20 mt-6 md:mt-0">
                <AdBanner />
            </div>

            {/* SECTION 3: GAME / MIDDLE AREA */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 z-40 relative overflow-hidden">
                {children}
            </div>

            {/* SECTION 4: MAP AREA */}
            <div className="flex-none h-[22%] md:h-[35%] w-full relative z-10 flex justify-center items-end pb-4 px-4">
                 {/* Speedometer Left */}
                 <div className="absolute left-6 bottom-16 flex flex-col items-center pointer-events-none z-20">
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-amber-400 border-l-amber-400 bg-black/60 backdrop-blur-md flex items-center justify-center transform -rotate-45 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        <div className="transform rotate-45 text-center">
                            <div className="font-orbitron text-2xl font-bold text-white leading-none">{geo.speed}</div>
                            <div className="text-[8px] font-bold text-amber-400 font-exo2">KM/H</div>
                        </div>
                    </div>
                 </div>

                 {/* 3D Map Center */}
                 <div className="w-full md:w-[60%] h-full pointer-events-auto">
                     <MapWidget lat={geo.lat} lng={geo.lng} />
                 </div>
            </div>

        </div>
    );
};

export default HUD;
