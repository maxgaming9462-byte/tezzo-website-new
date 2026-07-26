import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User, CheckCheck, MapPin } from 'lucide-react';
import { Driver, Ride, UserProfile } from '../types';

interface Message {
  id: string;
  sender: 'driver' | 'passenger';
  text: string;
  time: string;
}

interface DriverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  ride: Ride;
  user: UserProfile | null;
  onOpenAuth?: () => void;
}

export const DriverChatModal: React.FC<DriverChatModalProps> = ({
  isOpen,
  onClose,
  driver,
  ride,
  user,
  onOpenAuth,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial message when opened
  useEffect(() => {
    if (isOpen) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        {
          id: '1',
          sender: 'driver',
          text: `Hi${user ? ' ' + user.name.split(' ')[0] : ''}! 👋 I'll be picking passengers up near ${
            ride.originDetails || ride.origin
          } around ${ride.departureTime}. What's your exact location or preferred spot?`,
          time: nowTime,
        },
      ]);
      setInputText('');
    }
  }, [isOpen, driver.name, ride.origin, ride.originDetails, ride.departureTime, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!user && onOpenAuth) {
      onOpenAuth();
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'passenger',
      text,
      time: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate driver typing and auto-reply
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let replyText = `Got it! I've noted that spot. I'll reach ${ride.originDetails || ride.origin} by ${ride.departureTime}. See you soon! 🚗`;
      
      const lower = text.toLowerCase();
      if (lower.includes('metro') || lower.includes('gate') || lower.includes('station')) {
        replyText = `Perfect! The metro station area works great for a quick pull-over. I'll call you when I'm 2 mins away! 👍`;
      } else if (lower.includes('running late') || lower.includes('late') || lower.includes('delay')) {
        replyText = `No worries at all! Just ping me when you're nearby. We have a few minutes buffer time.`;
      } else if (lower.includes('bag') || lower.includes('luggage')) {
        replyText = `Boots space is clear! I can easily accommodate 2-3 bags in my ${ride.car.model}.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `driver-${Date.now()}`,
          sender: 'driver',
          text: replyText,
          time: replyTime,
        },
      ]);
    }, 1200);
  };

  const quickReplies = [
    `I'm near Metro Gate 2`,
    `Will meet at main landmark exit`,
    `I have 1 handbag with me`,
    `Will be there 5 mins early!`,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[var(--color-border)] h-[550px] max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[var(--color-primary)] text-white p-4 flex items-center justify-between border-b border-[#00522e]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-accent-mint)]"
              />
              <span className="w-3 h-3 bg-[var(--color-accent-mint)] border-2 border-[var(--color-primary)] rounded-full absolute bottom-0 right-0"></span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                {driver.name}
                <span className="text-[10px] bg-white/20 font-normal px-2 py-0.5 rounded-full text-white">
                  Driver
                </span>
              </h4>
              <p className="text-[11px] text-[var(--color-accent-mint)] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {ride.origin} → {ride.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#f9fbf9] flex flex-col gap-3">
          <div className="text-center my-1">
            <span className="text-[10px] bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] border border-[var(--color-primary-light)] px-3 py-1 rounded-full font-semibold">
              Coordinating Pick-Up Spot for {ride.date}
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'passenger';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 max-w-[82%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                      : 'bg-white text-[var(--color-on-surface)] border border-[var(--color-border)] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[var(--color-outline)] px-1 flex items-center gap-1">
                  {msg.time}
                  {isMe && <CheckCheck className="w-3 h-3 text-[var(--color-primary)]" />}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-outline)] bg-white border border-[var(--color-border)] px-3 py-2 rounded-2xl rounded-bl-none w-max">
              <span className="font-medium text-[var(--color-primary)]">{driver.name}</span> is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="p-2 bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-container)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="whitespace-nowrap text-[11px] bg-white hover:bg-[var(--color-success-bg-soft)] hover:text-[var(--color-primary)] text-[var(--color-on-surface-variant)] border border-[var(--color-border)] px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[var(--color-surface-container)] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${driver.name.split(' ')[0]}...`}
            className="flex-1 bg-[var(--color-surface-container-low)] text-xs px-3.5 py-2.5 rounded-full border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
