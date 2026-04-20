import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  X,
  ImagePlus,
  Loader2,
  RotateCcw
} from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import { DESTINATIONS } from "@/data/destinations";
import { useLanguage } from "@/context/LanguageContext";
import ReactMarkdown from 'react-markdown';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const MODEL_NAME = "gpt-4o-mini";
const SESSION_STORAGE_KEY = "degy_chat_session";
const SESSION_EXPIRY_MS = 5 * 60 * 1000;
const MAX_CONTEXT_MESSAGES = 10;

const containerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
};

const messageVariants = {
  hidden: { opacity: 0, y: 10, x: -10 },
  visible: { opacity: 1, y: 0, x: 0, transition: { type: "spring", stiffness: 500, damping: 30 } },
};

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hello! I'm your Discover Egypt AI Guide. I can help you plan your trip, suggest the best times to visit, or identify landmarks from your photos. How can I assist you today?",
};

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const { messages: savedMessages, lastActivity } = JSON.parse(saved);
        if (Date.now() - lastActivity < SESSION_EXPIRY_MS) return savedMessages;
      } catch (e) { console.error(e); }
    }
    return [INITIAL_MESSAGE];
  });
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { language, isRTL } = useLanguage();
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ messages, lastActivity: Date.now() }));
  }, [messages]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen, isLoading]);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  const restartSession = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في إعادة ضبط الجلسة؟' : 'Are you sure you want to reset the session?')) {
      setMessages([INITIAL_MESSAGE]);
      clearImage();
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedImage(reader.result); // Save full data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = { role: "user", content: input };
    if (imagePreview) userMessage.image = imagePreview;

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    const currentInput = input;
    const currentImage = selectedImage;
    
    // Clear UI now to show we're processing
    clearImage();
    setIsLoading(true);

    try {
      const destList = DESTINATIONS.map(d => `- ${d.copy.en.name} (${d.copy.en.location})`).join('\n');
      const currentDate = new Date().toLocaleDateString();
      
      const systemPrompt = `You are the Discover Egypt AI Guide.
Today's date is: ${currentDate}.
Your missions:
1. Create custom travel plans for users based on their intentions. Use Markdown to make the plans readable.
2. Suggest the best time to visit specific Egyptian locations.
3. Identify Egyptian landmarks from uploaded images.
4. Perform web searches (via Tavily) for real-time information (weather, diving conditions, events).

CRITICAL CONSTRAINT: You must ONLY suggest or include destinations from the supported list:
${destList}

If a user asks about a place not in this list, politely explain it's not covered by our packages.

Language: Please respond in ${language === 'ar' ? 'Arabic' : 'English'}.
Style: Be helpful, welcoming, and professional. Use markdown for better presentation.`;

      let searchContext = "";
      const searchKeywords = ["weather", "time to visit", "diving", "conditions", "events", "temperature", "best time", "how to get to"];
      if (searchKeywords.some(kw => (currentInput || "").toLowerCase().includes(kw))) {
        const searchRes = await fetch("/api/tavily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: currentInput,
            search_depth: "advanced"
          })
        });
        const searchData = await searchRes.json();
        searchContext = `\n\n[Web Search Context]:\n${searchData.results?.map(r => r.content).join('\n')}`;
      }

      const compactedHistory = updatedMessages.slice(-MAX_CONTEXT_MESSAGES);
      const apiMessages = [
        { role: "system", content: systemPrompt + searchContext },
        ...compactedHistory.map(m => ({ 
          role: m.role, 
          content: m.role === 'user' && m.image ? [
            { type: "text", text: m.content || "Analyze this image" },
            { type: "image_url", image_url: { url: m.image } }
          ] : m.content 
        })),
      ];

      const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GITHUB_TOKEN}` },
        body: JSON.stringify({ messages: apiMessages, model: MODEL_NAME, temperature: 0.7, max_tokens: 1000 })
      });

      const data = await response.json();
      if (data.choices?.[0]) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
      } else {
        throw new Error(data.error?.message || "Invalid response");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: language === 'ar' ? "عذرًا، حدث خطأ." : "Sorry, an error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[380px] overflow-hidden rounded-2xl border border-border/40 bg-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10 flex flex-col"
          >
            <div className="relative border-b border-border/40 bg-primary p-4 overflow-hidden">
              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src="/images/DiscoverEgyptLogo.png" />
                      <AvatarFallback className="bg-white text-primary">DE</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {language === 'ar' ? 'دليل الذكاء الاصطناعي' : 'AI Travel Guide'}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/80">
                        {language === 'ar' ? 'متصل الآن' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={restartSession} title={language === 'ar' ? 'إعادة تشغيل الجلسة' : 'Restart Session'}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className={`flex h-[400px] flex-col gap-4 overflow-y-auto p-4 bg-gray-50 ${isRTL ? 'text-right' : 'text-left'}`}>
              {messages.map((msg, idx) => (
                <motion.div key={idx} variants={messageVariants} initial="hidden" animate="visible" className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 border border-border/40 shadow-sm shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{msg.role === 'assistant' ? "AI" : "ME"}</AvatarFallback>
                  </Avatar>
                  <div className={`flex max-w-[85%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <span className="text-[10px] font-medium text-muted px-1">
                      {msg.role === 'assistant' ? (language === 'ar' ? 'الدليل' : 'Guide') : (language === 'ar' ? 'أنت' : 'You')}
                    </span>
                    <div className={cn("rounded-2xl px-4 py-2.5 text-sm shadow-sm border whitespace-pre-wrap prose prose-sm", msg.role === 'assistant' ? "rounded-tl-none bg-white border-gray-100 text-secondary" : "rounded-tr-none bg-primary border-primary text-white")}>
                      {msg.image && <img src={msg.image} alt="Uploaded" className="w-full rounded-lg mb-2 max-h-48 object-cover" />}
                      {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <p>{msg.content}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-border/40 shadow-sm shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="rounded-2xl rounded-tl-none bg-white border-gray-100 px-4 py-3 shadow-sm w-20 flex items-center justify-center gap-1.5">
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="h-2 w-2 rounded-full bg-primary/60" />
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="h-2 w-2 rounded-full bg-primary/60" />
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="h-2 w-2 rounded-full bg-primary/60" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-border/40 bg-white p-3">
              {imagePreview && (
                <div className="flex items-center gap-2 mb-2 bg-gray-100 p-2 rounded-lg">
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="h-10 w-10 object-cover rounded border border-primary/20" />
                    <button 
                      onClick={clearImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X size={8} />
                    </button>
                  </div>
                  <span className="text-xs text-secondary font-medium">
                    {language === 'ar' ? 'تم رفع الصورة' : 'Image uploaded'}
                  </span>
                </div>
              )}
              
              <form className="relative flex items-center gap-2" onSubmit={handleSend}>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="h-5 w-5" />
                </Button>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={language === 'ar' ? 'اسأل الدليل...' : 'Ask the guide...'} className={`flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`} />
                <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-white" disabled={isLoading}><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleOpen} className={cn("cursor-pointer relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all", isOpen ? "bg-secondary text-white" : "bg-primary text-white")}>
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
