
import React, { useState } from 'react';

interface StartScreenProps {
    onComplete: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("SYSTEM INITIALIZATION...");
    const [opacity, setOpacity] = useState(1);
    const [started, setStarted] = useState(false);

    const handleStart = () => {
        setStarted(true);
        // Start visuals immediately
        setProgress(5); 

        const steps = [
             { t: "Dobrodošli u City Taxi.", p: 20, d: 1000 },
             { t: "Uspostavljanje bezbedne veze...", p: 40, d: 1200 },
             { t: "Aktiviranje Globos paketa zaštite...", p: 70, d: 1500 },
             { t: "Vaša polisa je uspešno učitana.", p: 90, d: 1000 },
             { t: "Uživajte u sigurnoj vožnji.", p: 100, d: 1000 }
        ];

        let accumulatedTime = 0;

        steps.forEach((step, index) => {
            setTimeout(() => {
                setStatusText(step.t);
                setProgress(step.p);
                
                // If it's the last step, trigger completion
                if (index === steps.length - 1) {
                    setTimeout(() => {
                        setOpacity(0);
                        setTimeout(onComplete, 1000);
                    }, 1000);
                }
            }, accumulatedTime + 500); // 500ms initial delay before first step
            accumulatedTime += step.d;
        });
    };

    return (
        <div 
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#0a1a0f_0%,_#000000_100%)] transition-opacity duration-1000"
            style={{ opacity }}
        >
            <h1 className="font-orbitron text-4xl md:text-6xl text-amber-400 mb-2 tracking-widest animate-pulse glow-text">
                CITY TAXI AR
            </h1>
            <h2 className="font-exo2 text-green-400 text-lg md:text-xl font-bold tracking-wider mb-12 uppercase drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
                Secure by Globos Osiguranje
            </h2>

            {!started ? (
                <button 
                    onClick={handleStart} 
                    className="px-10 py-4 border-2 border-green-400 text-green-400 font-exo2 font-bold text-lg rounded-full hover:bg-green-400 hover:text-black transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] uppercase tracking-widest active:scale-95"
                >
                    Oživi vožnju
                </button>
            ) : (
                <div className="w-72 md:w-96 flex flex-col items-center">
                    <div className="text-green-400 font-exo2 text-sm md:text-base font-semibold mb-3 h-6 text-center w-full animate-pulse tracking-wide">
                        {statusText}
                    </div>
                    <div className="w-full h-1 bg-gray-900 border border-gray-800 rounded overflow-hidden">
                        <div 
                            className="h-full bg-green-400 shadow-[0_0_10px_#4ade80] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartScreen;