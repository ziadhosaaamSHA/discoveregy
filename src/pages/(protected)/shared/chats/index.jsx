import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { useAuth } from "../../../../context/AuthContext";
import { ConversationItem } from "../../../../components/chats/ConversationItem";
import { ChatDetail } from "../../../../components/chats/ChatDetail";
import { tourismApi } from "../../../../services/tourism-api";
import { readStoredConversations, upsertStoredConversation } from "../../../../services/conversations-store";
import { EmptyState, LoadingState, SearchInput } from "../../../../components/shared";
import { extractArray } from "../../../../shared/utils/api-shapes";
import { isFallbackConversationName, readId } from "../../../../shared/utils/identity";
import {
  hydrateConversationName,
  normalizeConversation,
  normalizeMessages,
} from "../../../../features/chats/chatMappers";

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
      const stored = readStoredConversations().map((conversation) => normalizeConversation(conversation, user)).filter(Boolean);
      let backendConversations = [];

      try {
        const response = await tourismApi.getConversations();
        backendConversations = extractArray(response).map((conversation) => normalizeConversation(conversation, user)).filter(Boolean);
      } catch (error) {
        if (!cancelled) {
          setConversations([]);
          setConversationsError(error?.message || "Error retrieving.");
          setIsLoadingConversations(false);
        }
        return;
      }

      const byId = new Map();
      [...stored, ...backendConversations].forEach((conversation) => {
        if (!conversation?.id) return;
        const existing = byId.get(String(conversation.id));
        const nextName = isFallbackConversationName(conversation.touristName, conversation.id) && existing?.touristName
          ? existing.touristName
          : conversation.touristName;
        byId.set(String(conversation.id), {
          ...existing,
          ...conversation,
          id: String(conversation.id),
          touristName: nextName,
        });
      });

      const merged = Array.from(byId.values());
      const updated = await Promise.all(
        merged.map(async (conversation) => {
          const numericId = Number(conversation.id);
          let hydratedConversation = conversation;
          if (isFallbackConversationName(hydratedConversation.touristName, hydratedConversation.id)) {
            hydratedConversation = await hydrateConversationName(hydratedConversation, user);
          }
          if (!Number.isFinite(numericId)) return hydratedConversation;
          try {
            const response = await tourismApi.getMessages(numericId);
            const normalized = normalizeMessages(response, user);
            const last = normalized[normalized.length - 1];
            return {
              ...hydratedConversation,
              lastMessage: last?.text || hydratedConversation.lastMessage || "",
            };
          } catch {
            return hydratedConversation;
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
  }, [user]);

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
        const normalized = normalizeMessages(response, user);
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
  }, [selectedConversation, user]);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (selectedConversation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedConversation]);

  const handleDeleteChat = (id) => {
    const current = readStoredConversations();
    const next = current.filter((item) => String(item.id) !== String(id));
    localStorage.setItem("degy_conversations", JSON.stringify(next));
    setConversations((prev) => prev.filter((item) => String(item.id) !== String(id)));
    navigate("/chats");
  };

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

  const handleSendMessage = async ({ content, attachment }) => {
    if (!selectedConversation) return;
    const numericId = Number(selectedConversation.id);
    if (!Number.isFinite(numericId)) return;

    const optimistic = {
      id: `${Date.now()}`,
      text: content,
      sender: user?.type === "guide" ? "guide" : "tourist",
      isMine: true,
      senderId: readId(user?.id, user?.userId),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await tourismApi.sendMessage({
        conversationId: numericId,
        content,
        attachment: attachment ? {
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
        } : undefined,
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
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("chats.searchPlaceholder") || "Search conversations..."}
          dir={isRTL ? "rtl" : "ltr"}
          className="mb-10"
        />

        {/* Conversations list */}
        <div className="space-y-4">
          {isLoadingConversations ? (
            <LoadingState className="py-20">{t("common.loading") || "Loading..."}</LoadingState>
          ) : conversationsError ? (
            <EmptyState tone="error" className="py-20">{t("chats.errorLoading") || "Error retrieving conversations."}</EmptyState>
          ) : filteredConversations.length === 0 ? (
            <EmptyState className="py-20">{t("chats.noConversations") || "No conversations found."}</EmptyState>
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
              onDeleteChat={handleDeleteChat}
              isLoading={isLoadingMessages}
              currentUserType={user?.type === "guide" ? "guide" : "tourist"}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
