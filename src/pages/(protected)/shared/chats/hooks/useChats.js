import { useEffect, useMemo, useState } from "react";
import { tourismApi } from "../../../../../services/tourism-api";
import {
  clearStoredConversations,
  readStoredConversations,
  removeStoredConversation,
  upsertStoredConversation,
} from "../../../../../services/conversations-store";
import { extractArray } from "../../../../../shared/utils/api-shapes";
import { isFallbackConversationName, readId } from "../../../../../shared/utils/identity";
import {
  hydrateConversationName,
  normalizeConversation,
  normalizeMessages,
} from "../../../../../features/chats/chatMappers";

// Owns conversation list loading, message loading, local search, and chat mutations.
export function useChats({ user, conversationId, navigate }) {
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
      const stored = readStoredConversations()
        .map((conversation) => normalizeConversation(conversation, user))
        .filter(Boolean);
      let backendConversations = [];

      try {
        const response = await tourismApi.getConversations();
        backendConversations = extractArray(response)
          .map((conversation) => normalizeConversation(conversation, user))
          .filter(Boolean);
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
      if (!selectedConversation) return;

      const numericId = Number(selectedConversation.id);
      if (!Number.isFinite(numericId)) return;

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

  useEffect(() => {
    document.body.style.overflow = selectedConversation ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedConversation]);

  const deleteChat = (id) => {
    removeStoredConversation(id);
    setConversations((prev) => prev.filter((item) => String(item.id) !== String(id)));
    navigate("/chats");
  };

  const clearAllConversations = () => {
    clearStoredConversations();
    setConversations([]);
    navigate("/chats");
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.touristName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectConversation = (conversation) => {
    navigate(`/chats/${conversation.id}`);
  };

  const backToList = () => {
    setMessages([]);
    navigate("/chats");
  };

  const sendMessage = async ({ content, attachment }) => {
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

  return {
    conversations,
    conversationsError,
    filteredConversations,
    isLoadingConversations,
    isLoadingMessages,
    messages,
    searchQuery,
    selectedConversation,
    backToList,
    clearAllConversations,
    deleteChat,
    selectConversation,
    sendMessage,
    setSearchQuery,
  };
}
