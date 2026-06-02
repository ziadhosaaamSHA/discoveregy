import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreVertical, Paperclip, Send, X, Download, Eye, FileText, Flag, Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { Modal } from "../common/Modal";

export function ChatDetail({
  conversation,
  onBack,
  messages = [],
  onSendMessage,
  onDeleteChat,
  isLoading = false,
  currentUserType = "tourist"
}) {
  const { t, isRTL } = useLanguage();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isFirstLoad = useRef(true);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      if (isFirstLoad.current) {
        scrollToBottom("auto");
        isFirstLoad.current = false;
      } else {
        scrollToBottom("smooth");
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;

    if (onSendMessage) {
      await onSendMessage({
        content: message,
        attachment,
      });
    }
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

  const isImageAttachment = (att) => {
    if (!att) return false;
    if (att.type && typeof att.type === 'string' && att.type.startsWith('image/')) return true;
    if (att.url && typeof att.url === 'string' && /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(att.url)) return true;
    return false;
  };

  const deleteText = isRTL ? "حذف المحادثة" : (t("chats.deleteChat") || "Delete Chat");
  const reportText = isRTL ? "الإبلاغ عن المرشد" : (t("chats.reportUser") || "Report Guide");
  const reportConfirmTitle = isRTL ? "تأكيد الإبلاغ" : "Confirm Report";
  const reportConfirmBody = isRTL ? "هل أنت متأكد من أنك تريد الإبلاغ عن هذا المرشد؟" : "Are you sure you want to report this guide?";
  const reportSuccessBody = isRTL ? "تم تسجيل بلاغك بنجاح. شكرًا لمساعدتنا في الحفاظ على أمان مجتمعنا." : "Your report has been successfully recorded. Thank you for helping keep our community safe.";
  const successTitle = isRTL ? "تم الإبلاغ بنجاح" : "Report Submitted Successfully";
  const cancelLabel = isRTL ? "إلغاء" : (t("common.cancel") || "Cancel");
  const reportActionLabel = isRTL ? "إبلاغ" : "Report";
  const doneLabel = isRTL ? "تم" : (t("booking.done") || "Done");

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#F2E0CA]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#e8cfb0] border-b border-black/10 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
            aria-label="Go back"
          >
            {isRTL ? <ArrowLeft size={22} className="text-black rotate-180" /> : <ArrowLeft size={22} className="text-black" />}
          </button>
          <div className="w-11 h-11 rounded-full bg-[#d4b483] flex items-center justify-center border border-[#5c3505]/10 shadow-sm shrink-0 overflow-hidden">
            {conversation.image ? (
              <img src={conversation.image} alt={conversation.touristName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-[#5c3505]">
                {conversation.touristName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-black leading-tight">{conversation.touristName}</h2>
            <p className="text-[11px] text-[#5c3505]/60 font-medium">{t("chats.online") || "Online"}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={20} className="text-black" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`absolute ${isRTL ? "left-0" : "right-0"} top-12 z-50 bg-[#e8cfb0] rounded-2xl shadow-xl border border-black/10 overflow-hidden w-52`}
                >
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      if (onDeleteChat) onDeleteChat(conversation.id);
                    }}
                    className="w-full px-5 py-3 text-left text-sm text-black hover:bg-black/5 transition-colors flex items-center justify-between font-medium"
                  >
                    <span>{deleteText}</span>
                    <X size={15} className="text-red-600" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      setIsReportModalOpen(true);
                    }}
                    className="w-full px-5 py-3 text-left text-sm text-black hover:bg-black/5 border-t border-black/5 transition-colors flex items-center justify-between font-medium"
                  >
                    <span>{reportText}</span>
                    <Flag size={15} className="text-red-600" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin bg-[#F2E0CA]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#c59d75 transparent'
        }}
      >
        {isLoading && (
          <div className="text-center text-xs font-bold text-black/40 italic py-2">
            {t("common.loading") || "Loading..."}
          </div>
        )}
        
        {messages.map((msg) => {
          const isMine = typeof msg.isMine === "boolean" ? msg.isMine : msg.sender === currentUserType;
          const isImg = isImageAttachment(msg.attachment);

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}
            >
              {/* Other User Avatar (shown only for incoming messages) */}
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-[#d4b483] border border-[#5c3505]/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {conversation.image ? (
                    <img src={conversation.image} alt={conversation.touristName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-[#5c3505]">
                      {conversation.touristName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              {/* Message Bubble container */}
              <div
                className={`max-w-[72%] px-4 py-3 shadow-sm relative transition-all ${
                  isMine
                    ? `bg-[#154d7d] text-white ${
                        isRTL ? "rounded-3xl rounded-bl-none" : "rounded-3xl rounded-br-none"
                      }`
                    : `bg-[#e8cfb0] text-black ${
                        isRTL ? "rounded-3xl rounded-br-none" : "rounded-3xl rounded-bl-none"
                      }`
                }`}
              >
                {/* Message attachment */}
                {msg.attachment && (
                  <div className="mb-2 max-w-full overflow-hidden">
                    {isImg ? (
                      <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-inner border border-black/5" onClick={() => setPreviewImage(msg.attachment.url)}>
                        <img src={msg.attachment.url} alt="attachment" className="max-h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={20} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${
                        isMine ? "bg-black/10 border-white/5" : "bg-black/5 border-black/10"
                      }`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={16} className={`shrink-0 ${isMine ? "text-white/80" : "text-black/60"}`} />
                          <span className="text-xs font-semibold truncate max-w-[120px]">{msg.attachment.name}</span>
                        </div>
                        <button 
                          onClick={() => downloadFile(msg.attachment.url, msg.attachment.name)} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            isMine ? "hover:bg-white/10" : "hover:bg-black/10"
                          }`}
                          aria-label="Download file"
                        >
                          <Download size={14} className={isMine ? "text-white" : "text-black"} />
                        </button>
                      </div>
                    )}
                    {isImg && (
                      <button 
                        onClick={() => downloadFile(msg.attachment.url, msg.attachment.name)}
                        className={`mt-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity ${
                          isMine ? "text-white" : "text-black"
                        }`}
                      >
                        <Download size={10} /> {t("chats.download") || "Download"}
                      </button>
                    )}
                  </div>
                )}
                
                <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[9px] mt-1 font-bold text-right tracking-tight opacity-50`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-6 py-4 bg-[#e8cfb0] border-t border-black/5 shrink-0">
        {attachment && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 bg-[#d4b483] rounded-2xl flex items-center justify-between border border-black/5 shadow-sm"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-[#5c3505] overflow-hidden">
              {isImageAttachment(attachment) ? (
                <img src={attachment.url} alt="Attached" className="w-10 h-10 object-cover rounded-lg border border-black/10" />
              ) : (
                <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center shrink-0">
                  <Paperclip size={18} className="text-gray-500" />
                </div>
              )}
              <span className="truncate max-w-[180px]">{attachment.name}</span>
            </div>
            <button onClick={() => setAttachment(null)} className="p-1.5 hover:bg-black/10 rounded-full transition-colors">
              <X size={16} className="text-[#5c3505]" />
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
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-black/5 hover:bg-black/10 transition-colors shrink-0"
            aria-label="Attach file"
          >
            <Paperclip size={18} className="text-[#5c3505]" />
          </button>
          
          <div className="flex-grow bg-[#decebb] rounded-2xl px-4 py-2.5 transition-all">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chats.typeMessage") || "Type a message..."}
              className="w-full bg-transparent text-sm text-black placeholder-black/30 outline-none"
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() && !attachment}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#d43e0b] text-white hover:brightness-110 disabled:opacity-40 disabled:scale-95 transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
            aria-label="Send message"
          >
            <Send size={16} />
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
            <button className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform duration-300">
              <X size={28} />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain border border-white/5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportSubmitted(false);
        }}
        title=""
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center p-4">
          {reportSubmitted ? (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100"
              >
                <Check size={40} className="text-green-600" strokeWidth={3} />
              </motion.div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">
                {successTitle}
              </h3>
              <p className="text-sm font-semibold text-gray-500 mb-8 leading-relaxed max-w-[280px]">
                {reportSuccessBody}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportSubmitted(false);
                }}
                className="w-full py-4 rounded-2xl bg-[#d43e0b] text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                {doneLabel}
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
                <Flag size={36} className="text-[#d43e0b]" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">
                {reportConfirmTitle}
              </h3>
              <p className="text-sm font-semibold text-gray-500 mb-8 leading-relaxed max-w-[280px]">
                {reportConfirmBody}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-150 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setReportSubmitted(true)}
                  className="flex-1 py-3.5 rounded-2xl bg-[#d43e0b] text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  {reportActionLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
