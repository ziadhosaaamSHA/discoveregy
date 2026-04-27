import { motion } from "framer-motion";

export function ConversationItem({ conversation, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(conversation)}
      className="flex items-center gap-4 p-5 bg-[#e8cfb0] rounded-2xl border border-black/5 cursor-pointer hover:bg-[#dfc9a5] transition-all shadow-sm active:scale-[0.98]"
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-[#d4b483] border-2 border-[#5c3505]/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
        <span className="text-xl font-bold text-[#5c3505]">
          {conversation.touristName.charAt(0)}
        </span>
      </div>

      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xl font-bold text-black truncate">{conversation.touristName}</h3>
          {conversation.unread && (
            <div className="w-3 h-3 bg-[#d43e0b] rounded-full shadow-sm" />
          )}
        </div>
        <p className="text-[15px] text-[#5c3505] truncate opacity-80">{conversation.lastMessage}</p>
      </div>
    </motion.div>
  );
}
