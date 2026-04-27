import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreVertical, Paperclip, Send, X, Download, Eye } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const MOCK_MESSAGES = [
  { id: "1", text: "Where do you wanna go?", sender: "guide", timestamp: "10:30 AM" },
  { id: "2", text: "I want Luxor", sender: "tourist", timestamp: "10:32 AM" },
  { id: "3", text: "Okay Then, I can arrange that for you. What date suits you best?", sender: "guide", timestamp: "10:35 AM" },
];

export function ChatDetail({ conversation, onBack }) {
  const { t, isRTL } = useLanguage();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [showMenu, setShowMenu] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() && !attachment) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "guide",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachment ? { 
        name: attachment.name, 
        type: attachment.type,
        url: attachment.url 
      } : null
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
    setAttachment(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachment({
        name: file.name,
        type: file.type,
        url: url,
        raw: file
      });
    }
  };

  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#F2E0CA]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#e8cfb0] border-b border-black/10 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          >
            {isRTL ? <ArrowLeft size={24} className="text-black rotate-180" /> : <ArrowLeft size={24} className="text-black" />}
          </button>
          <div className="w-12 h-12 rounded-full bg-[#d4b483] flex items-center justify-center border border-[#5c3505]/10 shadow-sm">
            <span className="text-lg font-bold text-[#5c3505]">
              {conversation.touristName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black leading-tight">{conversation.touristName}</h2>
            <p className="text-xs text-[#5c3505]/60 font-medium">{t("chats.online")}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          >
            <MoreVertical size={24} className="text-black" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 z-50 bg-[#e8cfb0] rounded-2xl shadow-xl border border-black/10 overflow-hidden w-56"
                >
                  <button className="w-full px-5 py-4 text-left text-black hover:bg-black/5 transition-colors flex items-center justify-between font-medium">
                    <span>{t("chats.deleteChat")}</span>
                    <X size={16} className="text-red-600" />
                   </button>
                  <button className="w-full px-5 py-4 text-left text-black hover:bg-black/5 border-t border-black/5 transition-colors flex items-center justify-between font-medium">
                    <span>{t("chats.reportUser")}</span>
                    <MoreVertical size={16} className="text-black/40" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide bg-[#F2E0CA]">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex ${msg.sender === "guide" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm relative ${
                msg.sender === "guide"
                  ? "bg-[#154d7d] text-white rounded-tr-none"
                  : "bg-[#e8cfb0] text-black rounded-tl-none"
              }`}
            >
              {msg.attachment && (
                <div className="mb-3">
                  {msg.attachment.type.startsWith('image/') ? (
                    <div className="relative group cursor-pointer" onClick={() => setPreviewImage(msg.attachment.url)}>
                      <img src={msg.attachment.url} alt="attachment" className="rounded-xl max-h-48 w-full object-cover border border-white/10" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <Eye size={24} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-black/10 rounded-xl flex items-center justify-between gap-3 border border-white/5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip size={16} className="shrink-0" />
                        <span className="text-sm truncate">{msg.attachment.name}</span>
                      </div>
                      <button onClick={() => downloadFile(msg.attachment.url, msg.attachment.name)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                  {msg.attachment.type.startsWith('image/') && (
                    <button 
                      onClick={() => downloadFile(msg.attachment.url, msg.attachment.name)}
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Download size={12} /> {t("chats.download")}
                    </button>
                  )}
                </div>
              )}
              <p className="text-[16px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-1 text-right font-medium ${msg.sender === "guide" ? "text-white/60" : "text-black/40"}`}>
                {msg.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-6 py-4 bg-[#e8cfb0] border-t border-black/5 shrink-0">
        {attachment && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 bg-[#d4b483] rounded-2xl flex items-center justify-between shadow-sm border border-black/5"
          >
            <div className="flex items-center gap-3 text-sm font-bold text-[#5c3505] overflow-hidden">
              {attachment.type.startsWith('image/') ? (
                <img src={attachment.url} alt="Attached" className="w-10 h-10 object-cover rounded-lg border border-black/10" />
              ) : (
                <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                  <Paperclip size={20} />
                </div>
              )}
              <span className="truncate max-w-[200px]">{attachment.name}</span>
            </div>
            <button onClick={() => setAttachment(null)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <X size={20} className="text-[#5c3505]" />
            </button>
          </motion.div>
        )}
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 hover:bg-black/10 transition-colors shrink-0"
          >
            <Paperclip size={22} className="text-[#5c3505]" />
          </button>
          
          <div className="flex-1 bg-[#decebb] rounded-2xl px-5 py-3 shadow-inner">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chats.typeMessage") || "Type a message..."}
              className="w-full bg-transparent text-[16px] text-black placeholder-black/30 outline-none"
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() && !attachment}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#d43e0b] text-white hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all shadow-md shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Image Fullscreen Preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform">
              <X size={32} />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
