import { motion } from "framer-motion";

export function ConversationItem({ conversation, onClick }) {
  const hasImage = !!conversation.image;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={() => onClick(conversation)}
      className="flex items-center gap-4 p-5 bg-[#e8cfb0] rounded-3xl border border-black/5 cursor-pointer hover:bg-[#dfc9a5] hover:border-[#5c3505]/20 transition-all duration-300 shadow-sm active:scale-[0.98]"
    >
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-[#d4b483] border border-[#5c3505]/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
        {hasImage ? (
          <img src={conversation.image} alt={conversation.touristName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-[#5c3505]">
            {conversation.touristName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-black truncate">{conversation.touristName}</h3>
          <div className="flex items-center gap-2">
            {conversation.unread && (
              <div className="w-2.5 h-2.5 bg-[#d43e0b] rounded-full shadow-[0_0_10px_rgba(212,62,11,0.5)] animate-pulse" />
            )}
          </div>
        </div>
        <p className="text-sm font-medium text-[#5c3505] opacity-80 truncate">{conversation.lastMessage || "No messages yet."}</p>
      </div>
    </motion.div>
  );
}

