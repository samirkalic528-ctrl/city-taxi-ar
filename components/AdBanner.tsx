
import React, { useState, useEffect, useRef } from 'react';
import { ADS } from '../constants';
import { AdItem } from '../types';
import { trackUserActivity } from '../services/geminiService';

const AdBanner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentAd, setCurrentAd] = useState<AdItem>(ADS[0]);
    
    // Tracking Refs
    const startTimeRef = useRef<number>(Date.now());
    const isManualChangeRef = useRef<boolean>(false);

    useEffect(() => {
        const interval = setInterval(() => {
            isManualChangeRef.current = false; // Auto rotation
            handleNext(false);
        }, 6000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    // Tracking Logic: Runs whenever currentAd changes (view ends)
    useEffect(() => {
        const endTime = Date.now();
        const duration = (endTime - startTimeRef.current) / 1000; // seconds
        
        // Log previous ad interaction (skip first render)
        // We log the *previous* ad, but since we don't have easy access to prev state here without complexities,
        // we'll log the just-finished interaction based on duration and trigger type.
        
        // Note: This effect runs ON MOUNT (start time set) and ON CHANGE.
        // On Change, we log the *previous* session.
        
        return () => {
            // Cleanup/Unmount or Change: Log the interaction
            const logDuration = (Date.now() - startTimeRef.current) / 1000;
            
            if (isManualChangeRef.current && logDuration < 2) {
                 trackUserActivity('AD_SKIPPED', currentAd.title, logDuration);
            } else if (logDuration > 4) {
                 trackUserActivity('AD_VIEWED', currentAd.title, logDuration);
            }
            
            // Reset for next
            startTimeRef.current = Date.now();
        };
    }, [currentAd]); // Re-run when ad changes

    const handleNext = (manual = true) => {
        if (manual) isManualChangeRef.current = true;
        setIsAnimating(true);
        setTimeout(() => {
            const nextIndex = (currentIndex + 1) % ADS.length;
            setCurrentIndex(nextIndex);
            setCurrentAd(ADS[nextIndex]);
            setIsAnimating(false);
        }, 500); 
    };

    const handlePrev = () => {
        isManualChangeRef.current = true;
        setIsAnimating(true);
        setTimeout(() => {
            const nextIndex = (currentIndex - 1 + ADS.length) % ADS.length;
            setCurrentIndex(nextIndex);
            setCurrentAd(ADS[nextIndex]);
            setIsAnimating(false);
        }, 500);
    };

    const handleAdClick = () => {
        trackUserActivity('AD_CLICKED', currentAd.title);
        window.open(currentAd.url, '_blank');
    };

    const getColors = (type: string) => {
        switch(type) {
            case 'globos': return { text: 'text-green-400', border: 'border-green-400', glow: 'shadow-green-400/50' };
            case 'pitch': return { text: 'text-blue-400', border: 'border-blue-400', glow: 'shadow-blue-400/50' };
            default: return { text: 'text-amber-400', border: 'border-amber-400', glow: 'shadow-amber-400/50' };
        }
    };

    const colors = getColors(currentAd.type);

    return (
        <div className="relative w-full max-w-lg mx-auto z-20 pointer-events-auto">
            {/* Nav Arrows */}
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                className="absolute left-0 md:-left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-amber-400 text-2xl md:text-3xl transition-colors p-2 z-30 bg-black/30 md:bg-transparent rounded-r-lg md:rounded-none backdrop-blur-sm"
            >
                <i className="fas fa-chevron-left"></i>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                className="absolute right-0 md:-right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-amber-400 text-2xl md:text-3xl transition-colors p-2 z-30 bg-black/30 md:bg-transparent rounded-l-lg md:rounded-none backdrop-blur-sm"
            >
                <i className="fas fa-chevron-right"></i>
            </button>

            {/* Category Tag */}
            <div className={`absolute -top-4 right-5 bg-black/90 border ${colors.border} ${colors.text} px-3 py-0.5 text-[10px] font-bold tracking-widest skew-x-[-20deg] transition-all duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'} z-10`}>
                {currentAd.type.toUpperCase()}
            </div>

            {/* Main Content Box */}
            <div 
                className={`relative overflow-hidden bg-gradient-to-r from-transparent via-black/70 to-transparent border-t border-b ${colors.border} transition-all duration-500 min-h-[80px] flex items-center justify-center cursor-pointer group backdrop-blur-sm`}
                onClick={handleAdClick}
            >
                {/* Content Container with Animation */}
                <div className={`flex items-center gap-4 px-10 md:px-6 py-2 w-full transition-all duration-500 transform ${isAnimating ? 'scale-110 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'}`}>
                    <i className={`fas ${currentAd.icon} text-2xl ${colors.text} filter drop-shadow-[0_0_10px_currentColor] animate-pulse`}></i>
                    <div className="flex-1 text-left">
                        <h3 className={`font-exo2 text-sm font-extrabold uppercase leading-tight ${colors.text} mb-0.5 drop-shadow-md`}>
                            {currentAd.title}
                        </h3>
                        <p className="font-exo2 text-[11px] text-gray-200 font-semibold leading-snug">
                            {currentAd.body}
                        </p>
                    </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-[spin_3s_linear_infinite]" style={{ animationName: 'scan' }}></div>
            </div>
            
            <style>{`
                @keyframes scan {
                    0% { left: -100%; }
                    50% { left: 200%; }
                    100% { left: 200%; }
                }
            `}</style>
        </div>
    );
};

export default AdBanner;