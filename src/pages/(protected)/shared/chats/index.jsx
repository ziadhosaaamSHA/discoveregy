import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { useAuth } from "../../../../context/AuthContext";
import { ConversationItem } from "../../../../components/chats/ConversationItem";
import { ChatDetail } from "../../../../components/chats/ChatDetail";
import { tourismApi } from "../../../../services/tourism-api";
import { readStoredConversations, upsertStoredConversation } from "../../../../services/conversations-store";

function normalizeMessages(payload) {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return source.map((msg) => {
    const createdAt = msg?.createdAt || msg?.timestamp || msg?.sentAt || new Date().toISOString();
    return {
      id: String(msg?.id ?? `${Date.now()}-${Math.random()}`),
      text: msg?.content || msg?.text || "",
      sender: msg?.isMine || msg?.senderType === "Guide" ? "guide" : "tourist",
      timestamp: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  });
}

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeConversation(raw) {
  const conversationId =
    raw?.conversationId ??
    raw?.conversation?.id ??
    raw?.id ??
    null;

  if (conversationId === null || conversationId === undefined) return null;
  const id = String(conversationId);
  const touristName =
    raw?.touristName ??
    raw?.tourist?.name ??
    raw?.guideName ??
    raw?.guide?.name ??
    raw?.name ??
    `Conversation ${id}`;
  const lastMessage =
    raw?.lastMessage ??
    raw?.latestMessage ??
    raw?.title ??
    "";

  return {
    id,
    touristName,
    lastMessage,
    unread: false,
  };
}

// Chats renders the conversation list and the selected conversation detail pane.
export default function Chats() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState("");
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === conversationId) || null,
    [conversationId, conversations]
  );

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      setConversationsError("");
      const stored = readStoredConversations().map(normalizeConversation).filter(Boolean);
      let backendConversations = [];

      try {
        if (user?.type === "guide") {
          const response = await tourismApi.getGuideRequests();
          backendConversations = extractArray(response).map(normalizeConversation).filter(Boolean);
        } else {
          const response = await tourismApi.getBookings();
          backendConversations = extractArray(response).map(normalizeConversation).filter(Boolean);
        }
      } catch (error) {
        if (!cancelled) {
          setConversations([]);
          setConversationsError(error?.message || "Error retrieving.");
          setIsLoadingConversations(false);
        }
        return;
      }

      const byId = new Map();
      [...backendConversations, ...stored].forEach((conversation) => {
        if (!conversation?.id) return;
        byId.set(String(conversation.id), {
          ...byId.get(String(conversation.id)),
          ...conversation,
          id: String(conversation.id),
        });
      });

      const merged = Array.from(byId.values());
      const updated = await Promise.all(
        merged.map(async (conversation) => {
          const numericId = Number(conversation.id);
          if (!Number.isFinite(numericId)) return conversation;
          try {
            const response = await tourismApi.getMessages(numericId);
            const normalized = normalizeMessages(response);
            const last = normalized[normalized.length - 1];
            return {
              ...conversation,
              lastMessage: last?.text || conversation.lastMessage || "",
            };
          } catch {
            return conversation;
          }
        })
      );

      if (!cancelled) {
        setConversations(updated);
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
    return () => {
      cancelled = true;
    };
  }, [user?.type]);

  useEffect(() => {
    if (conversationId && !selectedConversation && conversations.length > 0) {
      navigate("/chats", { replace: true });
    }
  }, [conversationId, selectedConversation, conversations.length, navigate]);

  useEffect(() => {
    let cancelled = false;

      const loadMessages = async () => {
        if (!selectedConversation) {
          return;
        }

        const numericId = Number(selectedConversation.id);
        if (!Number.isFinite(numericId)) {
          return;
        }

      try {
        setIsLoadingMessages(true);
        const response = await tourismApi.getMessages(numericId);
        const normalized = normalizeMessages(response);
        if (!cancelled) {
          setMessages(normalized);
          tourismApi.markMessagesRead(numericId).catch(() => {});
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversation]);

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
    localStorage.removeItem("degy_conversations");
    setConversations([]);
    navigate("/chats");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.touristName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conv) => {
    navigate(`/chats/${conv.id}`);
  };

  const handleBackToList = () => {
    setMessages([]);
    navigate("/chats");
  };

  const handleSendMessage = async ({ content }) => {
    if (!selectedConversation) return;
    const numericId = Number(selectedConversation.id);
    if (!Number.isFinite(numericId)) return;

    const optimistic = {
      id: `${Date.now()}`,
      text: content,
      sender: user?.type === "guide" ? "guide" : "tourist",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await tourismApi.sendMessage({
        conversationId: numericId,
        content,
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          String(conversation.id) === String(numericId)
            ? { ...conversation, lastMessage: content }
            : conversation
        )
      );
      upsertStoredConversation({
        ...selectedConversation,
        id: String(numericId),
        lastMessage: content,
      });
    } catch {
      // Keep optimistic message for now to avoid blocking chat UX.
    }
  };

  return (
    <div className="min-h-screen bg-[#f2e0ca] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>

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
          {isLoadingConversations ? (
            <div className="text-center py-20">
              <p className="text-xl font-medium text-black/40 italic">
                {t("common.loading") || "Loading..."}
              </p>
            </div>
          ) : conversationsError ? (
            <div className="text-center py-20">
              <p className="text-xl font-medium text-red-600 italic">{t("chats.errorLoading") || "Error retrieving conversations."}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-medium text-black/40 italic">{t("chats.noConversations") || "No conversations found."}</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={handleSelectConversation}
              />
            ))
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
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
