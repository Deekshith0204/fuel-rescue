import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  User, 
  Navigation,
  Sparkles
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function RoadsideChatModal({
  isOpen,
  onClose,
  requestId,
  currentUserRole = 'customer', // 'customer' or 'partner'
  partnerName = 'Rapid Assist Unit',
  customerName = 'Motorist'
}) {
  if (!isOpen) return null;

  const storageKey = `fuelrescue_chat_${requestId || 'active'}`;

  const defaultMessages = [
    {
      id: 1,
      sender: 'system',
      text: 'Encrypted Roadside Safety Channel established. Messages are shared directly between responder and motorist.',
      time: 'Just now'
    },
    {
      id: 2,
      sender: 'partner',
      text: 'Hello! I am dispatched and en route with your fuel canister. Please keep hazard lights flashing if safe.',
      time: '2m ago'
    }
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const customerQuickChips = [
    "Hazard lights are ON",
    "Car hood is raised",
    "Near HP fuel station exit",
    "Tank cap is on left side",
    "Standing safely on the sidewalk"
  ];

  const partnerQuickChips = [
    "I am entering your street now",
    "Arriving in 2 minutes",
    "I have arrived at your vehicle",
    "Looking for your hazard lights",
    "Ready to dispense safely"
  ];

  const quickChips = currentUserRole === 'customer' ? customerQuickChips : partnerQuickChips;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUserRole,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    setInputValue('');
    audioService.playDispatchPing();

    // If customer sends a message, simulate partner reply after 2 seconds if first time
    if (currentUserRole === 'customer' && !messages.some(m => m.id === 'partner_auto')) {
      setTimeout(() => {
        const partnerReply = {
          id: 'partner_auto',
          sender: 'partner',
          text: `Understood! I see you on GPS radar. Approaching your exact spot now.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => {
          const next = [...prev, partnerReply];
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {}
          return next;
        });
        audioService.playDispatchPing();
      }, 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[560px] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {currentUserRole === 'customer' ? partnerName : customerName}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Roadside Dispatch Channel</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-400 font-medium">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === currentUserRole;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${
                  isMe 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {isMe ? (currentUserRole === 'customer' ? <User className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />) : (currentUserRole === 'customer' ? <Truck className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-brand-400" />)}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-brand-500 text-white rounded-tr-none shadow-glow'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`block text-[10px] text-slate-500 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Roadside Chips */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700/60 whitespace-nowrap transition"
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message ${currentUserRole === 'customer' ? 'driver' : 'motorist'}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition shadow-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
