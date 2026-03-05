import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { BookingForm } from './BookingForm';

function ChatTooltip({ isOpen }: { isOpen: boolean }) {
    const phrases = ["¿En qué te ayudo?", "Ventas y gestión", "Agendá tu demo"];
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (isOpen) return;

        let timeout: any;

        if (isTyping) {
            if (displayedText.length < phrases[currentPhraseIndex].length) {
                timeout = setTimeout(() => {
                    setDisplayedText(phrases[currentPhraseIndex].slice(0, displayedText.length + 1));
                }, 60);
            } else {
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
            }
        } else {
            timeout = setTimeout(() => {
                setDisplayedText("");
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                setIsTyping(true);
            }, 100);
        }

        return () => clearTimeout(timeout);
    }, [displayedText, isTyping, currentPhraseIndex, isOpen]);

    if (isOpen) return null;

    return (
        <motion.div
            className="mb-3 mr-2"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
        >
            <div className="bg-white text-gray-800 text-[13px] font-bold py-2.5 px-6 rounded-2xl shadow-xl border border-gray-100 relative min-w-[140px] text-center backdrop-blur-sm bg-white/90">
                {displayedText}
                <span className="animate-pulse border-r-2 border-[#01b5f7] ml-0.5" />
                <div className="absolute -bottom-1 right-6 w-2.5 h-2.5 bg-white border-r border-b border-gray-100 rotate-45"></div>
            </div>
        </motion.div>
    );
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Session ID persistence
    const [sessionId] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chat_session_id');
            if (stored) return stored;
            const newId = 'web-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('chat_session_id', newId);
            return newId;
        }
        return 'web-' + Math.random().toString(36).substring(2, 9);
    });

    const apiUrl = import.meta.env.PUBLIC_CHATBOT_API_URL || 'https://api-production-531f.up.railway.app';
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    const [messages, setMessages] = useState<any[]>([
        { id: '1', role: 'assistant', content: '¡Hola! Soy **Rogelio**, el asistente virtual de CarniApp. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const assistantId = (Date.now() + 1).toString();

        try {
            console.log('[ChatWidget] Sending to:', `${cleanApiUrl}/api/conversations/chat/stream`);
            const response = await fetch(`${cleanApiUrl}/api/conversations/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content, sessionId })
            });

            console.log('[ChatWidget] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[ChatWidget] Error response:', errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // Add empty placeholder for assistant message
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '...' }]);

            if (response.body) {
                // Streaming path
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let assistantContent = '';

                try {
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        console.log('[ChatWidget] Chunk received:', JSON.stringify(chunk));
                        assistantContent += chunk;

                        setMessages(prev => prev.map(m =>
                            m.id === assistantId ? { ...m, content: assistantContent } : m
                        ));
                    }
                    // Flush any remaining bytes
                    const remaining = decoder.decode();
                    if (remaining) {
                        assistantContent += remaining;
                        setMessages(prev => prev.map(m =>
                            m.id === assistantId ? { ...m, content: assistantContent } : m
                        ));
                    }
                } finally {
                    reader.releaseLock();
                }

                if (!assistantContent.trim()) {
                    // Fallback: try reading as text
                    const text = await response.clone().text().catch(() => '');
                    assistantContent = text || 'No se recibió respuesta.';
                    setMessages(prev => prev.map(m =>
                        m.id === assistantId ? { ...m, content: assistantContent } : m
                    ));
                }

                // Booking keywords check
                const msgLower = assistantContent.toLowerCase();
                const bookingKeywords = ['formulario', 'agendar', 'demo', 'reunión', 'cita', 'agenda'];
                if (bookingKeywords.some(k => msgLower.includes(k))) {
                    setShowBookingForm(true);
                }

            } else {
                // No body, fallback
                setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, content: 'No se recibió respuesta del servidor.' } : m
                ));
            }

        } catch (err) {
            console.error('[ChatWidget] Error:', err);
            setMessages(prev => [
                ...prev.filter(m => m.id !== assistantId),
                { id: Date.now().toString(), role: 'assistant', content: 'Lo siento, ocurrió un error en la conexión. Por favor intenta de nuevo.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="mb-4 w-[380px] md:w-[420px] max-h-[600px] h-[80vh] bg-white border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl flex flex-col pointer-events-auto overflow-hidden relative"
                    >
                        {/* Premium Header */}
                        <div className="p-5 flex justify-between items-center bg-gradient-to-r from-[#01b5f7] to-[#018af7] text-white">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner rotate-3">
                                        🤖
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[#01b5f7] rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight tracking-tight">Rogelio</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                                        <p className="text-[11px] font-medium opacity-90 uppercase tracking-widest text-white/80">En línea ahora</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                    <Minus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                        max-w-[85%] rounded-2xl px-5 py-3.5 text-[14.5px] shadow-sm leading-relaxed
                                        ${msg.role === 'user'
                                                ? 'bg-[#01b5f7] text-white rounded-tr-none font-medium'
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
                                    `}
                                    >
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                        <p className={`text-[10px] mt-1.5 opacity-40 ${msg.role === 'user' ? 'text-white/80 text-right' : 'text-gray-400'}`}>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 rounded-tl-none flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-[#01b5f7] rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-[#01b5f7] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-[#01b5f7] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Booking Form Overlay/Item */}
                            {showBookingForm && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white border-2 border-[#01b5f7]/20 rounded-3xl p-1 shadow-lg overflow-hidden"
                                >
                                    <div className="bg-[#01b5f7]/5 px-4 py-2 border-b border-[#01b5f7]/10 flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-[#01b5f7] uppercase tracking-wider">Formulario de Agendamiento</span>
                                        <button onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <BookingForm
                                        apiUrl={cleanApiUrl}
                                        sessionId={sessionId}
                                        onComplete={(msg) => {
                                            setShowBookingForm(false);
                                            setMessages([...messages, { id: Date.now().toString(), role: 'assistant', content: msg }]);
                                        }}
                                        onCancel={() => setShowBookingForm(false)}
                                    />
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Premium Input Area */}
                        <div className="p-5 bg-white border-t border-gray-100">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }}
                                className="relative flex items-center bg-gray-100 rounded-2xl px-2 py-1.5 transition-all focus-within:bg-gray-50 focus-within:ring-2 focus-within:ring-[#01b5f7]/20"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-transparent border-none rounded-xl px-4 py-2 text-sm focus:ring-0 outline-none text-gray-900 placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-[#01b5f7] hover:bg-[#018af7] text-white p-2.5 rounded-xl disabled:opacity-30 disabled:grayscale transition-all shadow-md active:scale-95 flex items-center justify-center"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </form>
                            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                                Potenciado por <span className="text-[#01b5f7] font-bold">CarniApp AI</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div className="relative pointer-events-auto flex flex-col items-end">
                <ChatTooltip isOpen={isOpen} />

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                relative bg-gradient-to-br from-[#01b5f7] to-[#018af7] text-white p-0 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white overflow-hidden w-14 h-14 md:w-16 md:h-16
                ${isOpen ? 'rotate-90' : 'hover:shadow-[#01b5f7]/30'}
            `}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                                <X size={28} strokeWidth={2.5} />
                            </motion.div>
                        ) : (
                            <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="relative">
                                <span className="text-3xl md:text-4xl drop-shadow-lg">🤖</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
    );
}
