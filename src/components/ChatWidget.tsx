import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: '¡Hola! Soy el asistente virtual de CarniApp. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Calling the mchatbot server directly
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, hubo un error de conexión con el servidor. Asegúrate de que mchatbot esté corriendo.' }]);
    } finally {
      setIsLoading(false);
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
                    <h3 className="font-semibold text-gray-900">CarniBot 🥩</h3>
                    <p className="text-xs text-gray-500">Asistente Virtual</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                                    ? 'bg-yellow-500 text-black rounded-tr-none font-medium' 
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
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white rounded-b-2xl flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none text-black placeholder-gray-400"
                    autoFocus
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-yellow-500 hover:bg-yellow-600 text-black p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white"
      >
         {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
