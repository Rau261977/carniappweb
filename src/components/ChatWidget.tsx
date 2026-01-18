import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BookingForm } from './BookingForm';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: '¡Hola! Soy **Rogelio**, el asistente virtual de CarniApp. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        setUnreadCount(0);
        // Persist that we've seen all messages
        localStorage.setItem('chat_last_seen_count', messages.length.toString());
        scrollToBottom();
    }
  }, [messages, isOpen]);

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

  // Get last seen count from localStorage
  const getLastSeenCount = (): number => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('chat_last_seen_count');
    return stored ? parseInt(stored, 10) : 0;
  };

  // Fetch history function
  const fetchHistory = async () => {
      try {
        let apiUrl = import.meta.env.PUBLIC_CHATBOT_API_URL || 'http://localhost:3000';
        if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

        const res = await fetch(`${apiUrl}/api/chat/history?sessionId=${sessionId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.messages && Array.isArray(data.messages)) {
                if (data.messages.length > 0) {
                     const lastSeenCount = getLastSeenCount();
                     
                     // Only count new messages if widget is closed AND this is not the initial load
                     if (!isOpen && !isInitialLoad && data.messages.length > lastSeenCount) {
                         const diff = data.messages.length - lastSeenCount;
                         setUnreadCount(diff);
                     }
                     
                     // On initial load, just sync the last seen count without showing badge
                     if (isInitialLoad) {
                         // If we have stored count, compare. If new messages since last visit, show badge
                         if (lastSeenCount > 0 && data.messages.length > lastSeenCount) {
                             setUnreadCount(data.messages.length - lastSeenCount);
                         }
                         setIsInitialLoad(false);
                     }
                     
                     // Only update if messages actually changed to prevent auto-scroll on polling
                     if (JSON.stringify(data.messages) !== JSON.stringify(messages)) {
                        setMessages(data.messages);
                     }
                }
            }
        }
      } catch (e) {
          console.error("Polling error", e);
      }
  };

  // Initial load and Polling
  useEffect(() => {
      fetchHistory(); // Immediate
      const interval = setInterval(fetchHistory, 3000); // Every 3s
      return () => clearInterval(interval);
  }, [isOpen, sessionId]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const msgLower = userMsg.toLowerCase();
    
    // Check if user wants to book an appointment
    const bookingKeywords = ['agendar', 'reservar', 'cita', 'demo', 'reunion', 'llamada', 'turno'];
    const wantsToBook = bookingKeywords.some(keyword => msgLower.includes(keyword));
    
    if (wantsToBook) {
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
      setInput('');
      
      // Add bot response and open booking form
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: '¡Perfecto! 📅 Completá el formulario de abajo para agendar tu demo con el equipo de CarniApp.' 
      }]);
      setShowBookingForm(true);
      return;
    }
    
    // Regular chat flow
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      let apiUrl = import.meta.env.PUBLIC_CHATBOT_API_URL || 'http://localhost:3000';
      if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);
      
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: userMsg,
            sessionId: sessionId
        }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
      
      // Update last seen count after sending message
      const newCount = messages.length + 2;
      localStorage.setItem('chat_last_seen_count', newCount.toString());
      
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, hubo un error de conexión.' }]);
    } finally {
      setIsLoading(false);
      fetchHistory(); 
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end pointer-events-none font-sans">
        {/* Chat Window */}
        <div 
            className={`
                mb-4 w-[350px] max-h-[500px] h-[70vh] bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col pointer-events-auto transition-all duration-300 origin-bottom-right
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 hidden'}
            `}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div>
                    <h3 className="font-semibold text-gray-900">Rogelio 🤖</h3>
                    <p className="text-xs text-gray-500">Asistente Virtual</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar chat">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`
                                max-w-[85%] rounded-2xl px-4 py-2 text-sm
                                ${msg.role === 'user' 
                                    ? 'bg-[#01b5f7] text-white rounded-tr-none font-medium' 
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'}
                            `}
                        >
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-tl-none">
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                
                {/* Booking Form */}
                {showBookingForm && (
                    <BookingForm
                        apiUrl={import.meta.env.PUBLIC_CHATBOT_API_URL || 'http://localhost:3000'}
                        sessionId={sessionId}
                        onComplete={(msg) => {
                            setShowBookingForm(false);
                            setMessages(prev => [...prev, { role: 'bot', content: msg }]);
                        }}
                        onCancel={() => setShowBookingForm(false)}
                    />
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white rounded-b-2xl flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#01b5f7] outline-none text-black placeholder-gray-400"
                    autoFocus
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-[#01b5f7] hover:bg-[#000CFF] text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Enviar mensaje"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>

      {/* Toggle Button */}
      <div className="relative pointer-events-auto">
          {unreadCount > 0 && !isOpen && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm z-10">
                  {unreadCount}
              </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-[#01b5f7] hover:bg-[#000CFF] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white"
            aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
          >
             {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
          </button>
      </div>
    </div>
  );
}
