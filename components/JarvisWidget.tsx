import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToJarvis } from '../services/geminiService';
import { speak, playClickSound, stopSpeaking } from '../services/audioService';
import { ChatMessage, Project } from '../types';
import { getProjects } from '../services/dataService';

const JarvisWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Greetings. J.A.R.V.I.S. online. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [lastProject, setLastProject] = useState<Project | null>(null);

  const quickOptions = [
    { label: 'IDENTITY (ABOUT)', query: 'Tell me about Swopnil.' },
    { label: 'MISSION LOG (PROJECTS)', query: 'Show me the projects.' },
    { label: 'TECH SPECS (STACK)', query: 'What is the tech stack?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Show prompt after a delay and keep it until opened
  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleOpen = () => {
    playClickSound();
    
    // If closing, stop any ongoing speech
    if (isOpen) {
        stopSpeaking();
    }

    setIsOpen(!isOpen);
    
    if (showPrompt) setShowPrompt(false);
    
    // Only greet if opening and it's the first time/no history
    if (!isOpen && messages.length === 1) {
        speak("Greetings. J.A.R.V.I.S. online.");
    }
  };

  const processMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    playClickSound();
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToJarvis(userMsg);

      // Append model response
      setMessages(prev => [...prev, { role: 'model', text: response }]);

      // Try to detect a project match from the user's message
      const projects = getProjects();
      const lowered = userMsg.toLowerCase();
      const projectMatch = projects.find(p => {
        const title = p.title.toLowerCase();
        return lowered.includes(title) || title.includes(lowered) || lowered === title;
      });

      if (projectMatch) {
        // Speak the project's long description (or description)
        const description = projectMatch.longDescription || projectMatch.description || 'No further details available.';
        speak(description);
        // Add a follow-up model message indicating actions
        setMessages(prev => [...prev, { role: 'model', text: `I found project "${projectMatch.title}". You can preview it, go to the projects section, or learn more in About.` }]);
        setLastProject(projectMatch);
      } else {
        speak(response);
        setLastProject(null);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to servers.", isError: true }]);
      setLastProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };

  const handleQuickOption = (query: string) => {
    processMessage(query);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-auto">
      
      {/* "Talk to me" Prompt Bubble */}
      {!isOpen && showPrompt && (
        <div 
          onClick={toggleOpen}
          className="cursor-pointer absolute right-16 top-2 bg-cyan-900/80 text-cyan-300 px-4 py-2 rounded-lg font-mono-tech text-xs border border-cyan-500 whitespace-nowrap animate-bounce shadow-[0_0_10px_#00E5FF] hover:bg-cyan-800 transition-colors hidden md:block"
        >
            TALK TO ME
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-cyan-500 border-b-[6px] border-b-transparent"></div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group border-2 border-cyan-500 bg-black/80 backdrop-blur-md relative"
        aria-label="Toggle Jarvis"
      >
        <div className={`w-8 h-8 rounded-full border-2 border-cyan-400 ${isOpen ? 'bg-cyan-500 shadow-[0_0_15px_#00E5FF]' : 'bg-transparent group-hover:bg-cyan-500/20'}`}></div>
        <div className="absolute inset-0 rounded-full border border-cyan-500 opacity-50 animate-ping"></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[85vw] md:w-96 h-[500px] bg-black/90 backdrop-blur-xl border border-cyan-500/50 rounded-lg overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,229,255,0.2)] animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-cyan-900/20 p-3 border-b border-cyan-500/30 flex justify-between items-center">
            <span className="font-mono-tech text-cyan-400 tracking-widest text-sm">J.A.R.V.I.S. SYSTEM</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm font-mono-tech leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-700' 
                      : 'bg-gray-900/80 text-gray-300 border border-gray-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Project Action Buttons */}
            {lastProject && (
              <div className="flex gap-2 mt-2 px-1">
                <button
                  onClick={() => {
                    playClickSound();
                    if (lastProject?.link) window.open(lastProject.link, '_blank');
                  }}
                  className="bg-cyan-500 text-black px-3 py-1 rounded text-xs font-bold"
                >
                  View Preview
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    const el = document.getElementById('projects');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-cyan-900/20 text-cyan-300 px-3 py-1 rounded text-xs border border-cyan-500"
                >
                  Go To Projects
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    const el = document.getElementById('about');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-transparent text-cyan-400 px-3 py-1 rounded text-xs border border-cyan-500"
                >
                  Click Here
                </button>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700">
                  <span className="text-cyan-500 text-xs animate-pulse">PROCESSING...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Options */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-cyan-900/30">
             {quickOptions.map((opt) => (
               <button 
                 key={opt.label}
                 onClick={() => handleQuickOption(opt.query)}
                 disabled={isLoading}
                 className="whitespace-nowrap bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 text-[10px] font-mono-tech px-3 py-1.5 rounded hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-50"
               >
                 {opt.label}
               </button>
             ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-cyan-500/30 bg-black/50">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Command..."
                className="w-full bg-gray-900/50 text-cyan-500 border border-cyan-900 rounded px-4 py-2 focus:outline-none focus:border-cyan-500 font-mono-tech text-sm placeholder-cyan-900"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-400"
                disabled={isLoading}
              >
                ➔
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JarvisWidget;