
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { Message } from '../types';

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: 'init', 
            role: 'model', 
            text: 'Dobro došli! Ja sam Vaš City Taxi x Globos AI asistent. Tu sam da brinem o Vama i Vašoj sigurnosti. Kako Vam mogu pomoći danas?' 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const aiResponse = await sendMessageToGemini(input);
        
        const aiMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: aiResponse.text,
            sources: aiResponse.sources
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
    };

    return (
        <>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${isOpen ? 'bg-red-500 border-red-300 rotate-45' : 'bg-cyan-600 border-cyan-300 hover:scale-110'}`}
            >
                <i className={`fas fa-plus text-white text-2xl`}></i>
            </button>

            {/* Chat Interface */}
            <div 
                className={`absolute bottom-24 right-6 w-80 md:w-96 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-2xl flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden z-40 ${isOpen ? 'scale-100 opacity-100 h-96' : 'scale-0 opacity-0 h-0'}`}
                style={{ boxShadow: '0 0 30px rgba(8, 145, 178, 0.3)' }}
            >
                {/* Header */}
                <div className="p-3 border-b border-cyan-500/30 bg-cyan-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-robot text-cyan-400"></i>
                        <span className="font-orbitron font-bold text-white text-sm tracking-widest">AI ASSISTANT</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm font-exo2 leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-cyan-700/40 border border-cyan-500/30 text-white rounded-tr-none' 
                                : 'bg-gray-800/60 border border-gray-600/30 text-gray-200 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                            
                            {/* Sources Display */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-1 max-w-[85%] flex flex-wrap gap-1">
                                    {msg.sources.map((src, idx) => (
                                        <a 
                                            key={idx} 
                                            href={src.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] bg-black/50 border border-white/10 px-2 py-0.5 rounded text-cyan-300 hover:text-white hover:bg-cyan-900/50 transition-colors truncate max-w-full"
                                        >
                                            <i className="fas fa-link mr-1"></i>
                                            {src.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800/60 border border-gray-600/30 p-3 rounded-lg rounded-tl-none flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-black/40 border-t border-cyan-500/30 flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pitajte o taxiju ili osiguranju..."
                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-exo2"
                    />
                    <button 
                        onClick={handleSend}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white w-10 h-10 rounded flex items-center justify-center transition-colors"
                    >
                        <i className="fas fa-paper-plane text-sm"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatBot;