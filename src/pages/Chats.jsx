import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { ConversationItem } from "../components/chats/ConversationItem";
import { ChatDetail } from "../components/chats/ChatDetail";

// Mock conversations data
const MOCK_CONVERSATIONS = [
  { id: "conv-1", touristName: "Ahmed Ali", lastMessage: "i want to go pyramids and The Egyptian Museum", avatar: null, unread: true },
  { id: "conv-2", touristName: "Sara Mohamed", lastMessage: "Can we start at 9 AM?", avatar: null, unread: true },
  { id: "conv-3", touristName: "John Doe", lastMessage: "The hotel is great!", avatar: null, unread: true },
  { id: "conv-4", touristName: "Elena Petrova", lastMessage: "Thank you for the tour", avatar: null, unread: false },
  { id: "conv-5", touristName: "Ziad Hossam", lastMessage: "I preferred the Red Sea", avatar: null, unread: false },
];

export default function Chats() {
  const { t, isRTL } = useLanguage();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Switch conversation based on URL param
  useEffect(() => {
    if (conversationId) {
      const found = conversations.find(c => c.id === conversationId);
      if (found) {
        setSelectedConversation(found);
      } else {
        // Conversation not found, clear URL but stay on list
        navigate("/chats", { replace: true });
      }
    } else {
      setSelectedConversation(null);
    }
  }, [conversationId, conversations, navigate]);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (selectedConversation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedConversation]);

  const handleClearAll = () => {
    setConversations([]);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.touristName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conv) => {
    navigate(`/chats/${conv.id}`);
  };

  const handleBackToList = () => {
    navigate("/chats");
  };

  return (
    <div className="min-h-screen bg-[#f2e0ca] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-28 pb-16">
        {/* Page title and clear button */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-[38px] font-bold text-black tracking-tight">
            {t("chats.title") || "Chats"}
          </h1>
          {conversations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-[#d43e0b] text-white font-bold rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:brightness-110 transition-all text-sm"
            >
              {t("chats.clearAll") || "Clear All"}
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-10 group">
          <div className="flex items-center bg-[#e8cfb0] rounded-2xl px-6 py-4 shadow-sm border border-black/5 group-focus-within:border-black/20 transition-all">
            <Search size={22} className="text-black/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("chats.searchPlaceholder") || "Search conversations..."}
              className="flex-1 bg-transparent text-lg outline-none text-black placeholder-black/30 px-4 font-medium"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onClick={handleSelectConversation}
            />
          ))}
          {filteredConversations.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl font-medium text-black/40 italic">
                {searchQuery ? "No matches found" : "No conversations yet"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Chat detail modal/overlay */}
      <AnimatePresence>
        {selectedConversation && (
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? -100 : 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <ChatDetail
              conversation={selectedConversation}
              onBack={handleBackToList}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}