
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { trackUserActivity } from '../../services/geminiService';
import { TriviaQuestion } from '../../types';

interface TriviaProps {
    onScoreUpdate: (points: number) => void;
}

const TRIVIA_DATA: TriviaQuestion[] = [
    { q: "Koji je broj telefona City Taxija?", options: ["021 400 400", "021 123 456", "021 999 999"], correct: 0 },
    { q: "Cena vožnje do aerodroma u City Taxiju je?", options: ["Fiksna", "Zavisi od gužve", "Nepoznata"], correct: 0 },
    { q: "Globos Osiguranje je lider u?", options: ["Ažurnosti u isplati šteta", "Prodaji sladoleda", "Popravci guma"], correct: 0 },
    { q: "Ograničenje brzine u zoni škole je?", options: ["30 km/h", "50 km/h", "40 km/h"], correct: 0 },
    { q: "Šta je obavezno za putovanje u inostranstvo?", options: ["Putno osiguranje", "Kupaći kostim", "Sendvič"], correct: 0 },
    { q: "Prvi taksi na svetu je bio?", options: ["Kočija", "Parni automobil", "Bicikl"], correct: 0 },
    { q: "Koja boja se najlakše uočava u saobraćaju?", options: ["Žuta", "Crna", "Siva"], correct: 0 },
    { q: "Kasko osiguranje pokriva?", options: ["Štetu i kad ste vi krivi", "Samo tuđu štetu", "Samo krađu guma"], correct: 0 },
    { q: "Koliko točkova je imao prvi automobil?", options: ["3", "4", "5"], correct: 0 },
    { q: "City Taxi vozila su prepoznatljiva po?", options: ["Čistoći i urednosti", "Glasnoj muzici", "Brzoj vožnji"], correct: 0 },
    { q: "Evropski izveštaj se popunjava kod?", options: ["Manjih nezgoda", "Kupovine goriva", "Registracije"], correct: 0 },
    { q: "Šta znači ABS u automobilu?", options: ["Anti-lock Braking System", "Auto Brzo Staje", "Automatic Brake Sensor"], correct: 0 },
    { q: "Ako semafor ne radi, poštuju se?", options: ["Saobraćajni znaci", "Dogovor vozača", "Pravilo jačeg"], correct: 0 },
    { q: "Globos 'Pomoć na putu' važi?", options: ["24 sata dnevno", "Samo radnim danima", "Samo leti"], correct: 0 },
    { q: "Glavni cilj City Taxija je?", options: ["Bezbednost putnika", "Što brža vožnja", "Ušteda goriva"], correct: 0 },
    { q: "Najčešći uzrok nesreća je?", options: ["Neprilagođena brzina", "Loš put", "Kvar na vozilu"], correct: 0 },
    { q: "Zeleni karton je?", options: ["Međunarodna potvrda osiguranja", "Dozvola za parkiranje", "Eko taksa"], correct: 0 },
    { q: "Ko ima prednost na pešačkom prelazu?", options: ["Pešak", "Taksi", "Autobus"], correct: 0 },
    { q: "Globos Putno osiguranje pokriva troškove?", options: ["Lečenja u inostranstvu", "Kvara na vozilu", "Izgubljenog prtljaga (samo)"], correct: 0 },
    { q: "Aplikacija City Taxija omogućava?", options: ["Plaćanje karticom", "Gledanje filmova", "Igranje šaha"], correct: 0 }
];

const Trivia: React.FC<TriviaProps> = ({ onScoreUpdate }) => {
    const [qIndex, setQIndex] = useState(0);
    const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const handleAnswer = (idx: number) => {
        if (feedback) return;
        
        setSelectedOption(idx);
        const correctIdx = TRIVIA_DATA[qIndex].correct;

        if (idx === correctIdx) {
            setFeedback('correct');
            onScoreUpdate(50);
            trackUserActivity('GAME_PLAYED', 'Trivia Correct Answer');
            
            const scalar = 2;
            const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });
            
            confetti({
                particleCount: 80,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#22d3ee', '#f0abfc', '#fbbf24'],
                shapes: ['circle', 'square', triangle],
                scalar
            });

            setTimeout(() => {
                setFeedback(null);
                setSelectedOption(null);
                setQIndex((prev) => (prev + 1) % TRIVIA_DATA.length);
            }, 2000); 
        } else {
            setFeedback('wrong');
            setTimeout(() => {
                setFeedback(null);
                setSelectedOption(null);
                setQIndex((prev) => (prev + 1) % TRIVIA_DATA.length);
            }, 2000); 
        }
    };

    return (
        <div className="w-full max-w-sm flex flex-col gap-3 pointer-events-auto scale-75 md:scale-90 origin-center relative">
            
            {feedback === 'correct' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center animate-[pop_0.5s_ease-out]">
                    <div className="font-orbitron font-black text-6xl text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] stroke-black tracking-widest transform -rotate-12 bg-black/80 p-4 rounded-xl border-2 border-amber-400">
                        +50
                    </div>
                </div>
            )}

            <div className="bg-black/60 backdrop-blur-md border border-cyan-400/50 p-3 rounded-xl min-h-[60px] flex items-center justify-center text-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <p className="text-sm font-exo2 text-white font-bold">{TRIVIA_DATA[qIndex].q}</p>
            </div>
            
            <div className="grid grid-rows-3 gap-2">
                {TRIVIA_DATA[qIndex].options.map((opt, idx) => {
                    let btnClass = "bg-black/50 border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400";
                    const isCorrect = idx === TRIVIA_DATA[qIndex].correct;
                    const isSelected = idx === selectedOption;

                    if (feedback) {
                        if (isCorrect) {
                            btnClass = "bg-green-500/80 border-green-300 text-black shadow-[0_0_15px_#4ade80] scale-105";
                        } else if (isSelected) {
                            btnClass = "bg-red-600/80 border-red-500 text-white opacity-50";
                        } else {
                            btnClass = "bg-black/30 border-gray-700 text-gray-600 opacity-30";
                        }
                    }

                    return (
                        <button 
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={feedback !== null}
                            className={`p-3 rounded-lg border font-bold text-sm transition-all duration-300 backdrop-blur-sm ${btnClass}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Trivia;
