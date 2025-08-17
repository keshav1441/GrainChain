import React, { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowsPointingInIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotMascotProps {
  className?: string;
}

const ChatbotMascot: React.FC<ChatbotMascotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const response = await api.get('/chatbot/suggestions');
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (messageText: string = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/chat', {
        message: messageText.trim()
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      if (response.data.error) {
        toast.error('Chatbot encountered an issue');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hi! I'm GrainBot 🌾 Your agricultural assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isOpen) {
      setIsOpen(true);
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          text: "Hi! I'm GrainBot 🌾 Your agricultural assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  };

  return (
    <>
      {/* Chat Window */}
{/* Chat Window */}
{isOpen && (
  <div
    className={`fixed backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-300 ${
      isFullScreen
        ? 'inset-0 m-auto max-w-5xl w-full h-[90vh]'  // ✅ max width + centered + good height
        : 'bottom-24 right-6 w-96 h-[30rem]'
    }`}
  >

    {/* Header */}


<div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-t-2xl flex items-center justify-between shadow">
  <div className="flex items-center space-x-3">
    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
      <SparklesIcon className="h-5 w-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-sm">GrainBot</h3>
      <p className="text-xs text-green-100">Agricultural Assistant</p>
    </div>
  </div>
  <div className="flex items-center space-x-2">
    <button
      onClick={toggleFullScreen}
      className="p-2 hover:bg-white/20 rounded-full transition"
      title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
    >
      {isFullScreen ? (
        <ArrowsPointingInIcon className="h-5 w-5 text-white" />
      ) : (
        <ArrowTopRightOnSquareIcon className="h-5 w-5 text-white" />
      )}
    </button>
    <button
      onClick={toggleChat}
      className="p-2 hover:bg-white/20 rounded-full transition"
    >
      <XMarkIcon className="h-5 w-5 text-white" />
    </button>
  </div>
</div>


    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-2xl px-4 py-2 rounded-2xl text-sm shadow-sm ${
              message.isBot
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                : 'bg-gradient-to-r from-green-600 to-green-500 text-white'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 px-3 py-2 rounded-2xl text-sm text-gray-600 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* Suggestions */}
    {messages.length <= 1 && suggestions.length > 0 && (
      <div className="px-5 pb-3">
        <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border rounded-full shadow-sm text-gray-700 transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Input */}
    <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about farming..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !inputMessage.trim()}
          className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
)}


      {/* Mascot Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-40 flex items-center justify-center ${className}`}
      >
        {isOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <div className="relative">
            <ChatBubbleLeftRightIcon className="h-7 w-7" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-6 right-24 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-30">
          Chat with GrainBot 🌾
        </div>
      )}
    </>
  );
};

export default ChatbotMascot;
