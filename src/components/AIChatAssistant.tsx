import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  User,
  Loader2,
  ShieldAlert,
  BrainCircuit,
} from 'lucide-react';
import { requestAIChatReply } from '../services/api';
import { UserRole } from '../types';

interface AIChatAssistantProps {
  userRole: UserRole;
  initialMessage?: string;
  onConsumeInitialMessage?: () => void;
  patientContext?: any;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  userRole,
  initialMessage,
  onConsumeInitialMessage,
  patientContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Hello! I am your MediExplain AI Health Assistant. I can explain diagnostic results, SHAP value feature importances, medical parameters, medication timing, and lifestyle adjustments. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      handleSendMessage(initialMessage);
      onConsumeInitialMessage?.();
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messagesRef.current, userMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = updatedHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const replyText = await requestAIChatReply(historyPayload, userRole, patientContext);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText || 'I have analyzed your query. Please consult your physician for personalized clinical care.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'I apologize, but I encountered an error connecting to the AI medical server. Please verify your query or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-teal-500 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
            <BotMessageSquare className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>MediExplain Assistant</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] uppercase font-bold">
                Gemini 4 Hydrogen
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive Explainable AI Medical Chatbot & Health Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 bg-amber-950/60 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Clinical Disclaimer:</strong> AI responses are decision-support suggestions for educational purposes only. Always consult a licensed physician.
        </span>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl shrink-0">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium shadow-md shadow-cyan-600/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1.5 font-mono ${
                      isBot ? 'text-slate-500' : 'text-cyan-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>MediExplain AI is processing medical knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Shortcuts */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
          {[
            'Explain my SHAP values simply',
            'What lifestyle changes lower Fasting Sugar?',
            'What are common side effects of Metformin?',
            'How do I prepare for an ECG test?',
          ].map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(promptText)}
              className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium transition-all disabled:opacity-50"
            >
              + {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a medical question, XAI feature query, or lifestyle advice..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
