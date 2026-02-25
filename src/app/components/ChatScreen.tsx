import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PipMascot } from './PipMascot';
import type { UserProfile, Discovery } from '@/app/types';
import { chatAPI } from '@/services/apiService';

interface ChatScreenProps {
  profile: UserProfile;
  onBack: () => void;
  discoveries: Discovery[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'pip';
  content: string;
  timestamp: Date;
}

export function ChatScreen({ profile, onBack, discoveries }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'pip',
      content: `Hi ${profile.name}! I'm so excited to chat with you! Ask me anything about the discoveries you've found, or tell me about the amazing things you've seen! 🌟`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    // Call real AI backend
    try {
      const discoveryNames = discoveries.map(d => d.name);
      const data = await chatAPI.send({
        message: inputValue,
        child_name: profile.name,
        child_age: profile.age,
        discoveries: discoveryNames,
      });

      const pipMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'pip',
        content: data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, pipMessage]);
    } catch (err) {
      const pipMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'pip',
        content: `Hmm, I'm having a little trouble connecting right now. Try again in a moment! 🌐`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, pipMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-blue-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Chat with Pip</h1>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <p className="text-sm text-gray-600 mt-2">Ask Pip about your discoveries or anything you're curious about!</p>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'pip' && (
                <div className="flex gap-3 max-w-xs">
                  <div className="flex-shrink-0">
                    <PipMascot message={message.content} emotion="happy" size="small" />
                  </div>
                </div>
              )}

              {message.sender === 'user' && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[1.5rem] px-6 py-3 max-w-xs shadow-lg">
                  <p className="text-base leading-relaxed">{message.content}</p>
                  <p className="text-xs text-white/70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              </div>
              <p className="text-white text-sm font-semibold">Pip is thinking...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-[0_-4px_12px_rgba(0,0,0,0.1)] p-4">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="h-12 text-base rounded-[1.5rem]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            size="lg"
            className="h-12 w-12 p-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
