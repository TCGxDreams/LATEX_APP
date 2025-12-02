import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SidebarView, GrammarSuggestion, ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { Button } from './Button';
import { X, Check, MessageSquare, AlertCircle, Sparkles, Send, User, Bot, AlertTriangle, RefreshCw } from 'lucide-react';

interface SidebarProps {
  view: SidebarView;
  onClose: () => void;
  grammarSuggestions: GrammarSuggestion[] | null;
  isCheckingGrammar: boolean;
  onApplySuggestion: (original: string, suggestion: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view,
  onClose,
  grammarSuggestions,
  isCheckingGrammar,
  onApplySuggestion
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am your AI LaTeX assistant. Ask me anything about LaTeX syntax, errors, or formatting!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    const apiHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    let accumulatedText = "";
    setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

    await streamChatResponse(apiHistory, userMsg.text, (chunk) => {
      accumulatedText += chunk;
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastMsg = newHistory[newHistory.length - 1];
        if (lastMsg.role === 'model') {
           lastMsg.text = accumulatedText;
        }
        return newHistory;
      });
    });

    setIsChatting(false);
  };

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col shadow-xl">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          {view === SidebarView.GRAMMAR ? (
            <>
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Grammar Check</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>AI Assistant</span>
            </>
          )}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Grammar View */}
        {view === SidebarView.GRAMMAR && (
          <div className="space-y-4">
            {isCheckingGrammar ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-sm">Analyzing your document...</p>
              </div>
            ) : grammarSuggestions === null ? (
               <div className="text-center text-gray-500 mt-10 px-4">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-2" />
                <p className="font-medium text-gray-800">Connection Error</p>
                <p className="text-xs mt-1 mb-4">Could not connect to the AI service. Please try again.</p>
              </div>
            ) : grammarSuggestions.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <Check className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="font-medium">No issues found!</p>
                <p className="text-xs mt-1">Your document looks great.</p>
              </div>
            ) : (
              grammarSuggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 group">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400 font-mono mb-1 truncate" title={suggestion.context}>
                        {suggestion.context ? `...${suggestion.context}...` : 'Context unavailable'}
                      </div>
                      <div className="text-sm font-medium text-red-600 line-through decoration-red-300 opacity-80 mb-1">
                        {suggestion.original}
                      </div>
                      <div className="text-sm font-bold text-emerald-700 mb-2">
                        {suggestion.suggestion}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2 rounded mb-3">
                        {suggestion.explanation}
                      </p>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        onClick={() => onApplySuggestion(suggestion.original, suggestion.suggestion)}
                      >
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat View */}
        {view === SidebarView.CHAT && (
          <div className="space-y-4 pb-4">
             {chatHistory.map((msg, idx) => (
               <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-emerald-600'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gray-100 text-gray-800 rounded-tr-sm' 
                      : 'bg-emerald-50 text-gray-800 border border-emerald-100 rounded-tl-sm'
                  }`}>
                    {msg.role === 'model' ? (
                       <div className="prose prose-sm prose-emerald max-w-none">
                         <ReactMarkdown 
                           components={{
                             code: ({className, children, ...props}) => {
                               const match = /language-(\w+)/.exec(className || '')
                               return match ? (
                                 <pre className="bg-gray-800 text-white p-2 rounded text-xs overflow-x-auto my-2">
                                   <code className={className} {...props}>{children}</code>
                                 </pre>
                               ) : (
                                 <code className="bg-emerald-100 px-1 py-0.5 rounded text-xs font-mono text-emerald-800" {...props}>
                                   {children}
                                 </code>
                               )
                             }
                           }}
                         >
                           {msg.text}
                         </ReactMarkdown>
                       </div>
                    ) : (
                      msg.text
                    )}
                  </div>
               </div>
             ))}
             <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      {view === SidebarView.CHAT && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="relative">
            <textarea 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask for LaTeX help..."
              className="w-full resize-none rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 pr-12 text-sm max-h-32 min-h-[44px]"
              rows={1}
              disabled={isChatting}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isChatting}
              className="absolute right-2 bottom-2 p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChatting ? <span className="animate-spin block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};