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
import { resolveApiAssetUrl } from "../../../../services/api-client";

const resolveAttachmentUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  return resolveApiAssetUrl(url);
};

function normalizeRole(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("guide")) return "guide";
  if (normalized.includes("tourist") || normalized.includes("tour")) return "tourist";
  return "";
}

function readId(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
}

function readName(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text && !/^conversation\s+\d+$/i.test(text)) return text;
  }
  return "";
}

function readPersonName(person) {
  if (!person || typeof person !== "object") return "";
  const fullName = `${person.firstName || ""} ${person.lastName || ""}`.trim();
  return readName(
    fullName,
    person.fullName,
    person.displayName,
    person.name,
    person.userName,
    person.username,
    person.email
  );
}

function isFallbackConversationName(name, id) {
  const text = String(name || "").trim();
  return !text || text.toLowerCase() === `conversation ${id}`.toLowerCase();
}

function normalizeMessages(payload, user) {
  const currentUserType = normalizeRole(user?.type) || "tourist";
  const currentUserId = readId(user?.id, user?.userId);
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return source.map((msg) => {
    const createdAt = msg?.createdAt || msg?.timestamp || msg?.sentAt || new Date().toISOString();
    const senderId = readId(msg?.senderId, msg?.senderUserId, msg?.fromUserId, msg?.userId, msg?.sender?.id, msg?.sender?.userId);
    const receiverId = readId(msg?.receiverId, msg?.receiverUserId, msg?.toUserId, msg?.recipientId, msg?.receiver?.id, msg?.receiver?.userId);
    const senderType = normalizeRole(msg?.senderType ?? msg?.senderRole ?? msg?.sender?.role ?? msg?.sender?.type ?? msg?.sender);
    const receiverType = normalizeRole(msg?.receiverType ?? msg?.receiverRole ?? msg?.receiver?.role ?? msg?.receiver?.type);

    let isMine = false;
    if (typeof msg?.isMine === "boolean") {
      isMine = msg.isMine;
    } else if (currentUserId && senderId) {
      isMine = senderId === currentUserId;
    } else if (currentUserId && receiverId) {
      isMine = receiverId !== currentUserId;
    } else if (senderType) {
      isMine = senderType === currentUserType;
    } else if (receiverType) {
      isMine = receiverType !== currentUserType;
    }

    const sender = senderType || (isMine ? currentUserType : currentUserType === "guide" ? "tourist" : "guide");
    return {
      id: String(msg?.id ?? `${Date.now()}-${Math.random()}`),
      text: msg?.content || msg?.text || "",
      sender,
      isMine,
      senderId,
      receiverId,
      timestamp: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment: msg?.attachment ? {
        name: msg.attachment.name || "File",
        type: msg.attachment.type || "application/octet-stream",
        url: resolveAttachmentUrl(msg.attachment.url),
      } : null,
    };
  });
}

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function normalizeConversation(raw, user) {
  const conversationId =
    raw?.conversationId ??
    raw?.conversation?.id ??
    raw?.id ??
    null;

  if (conversationId === null || conversationId === undefined) return null;
  const id = String(conversationId);
  const currentUserType = normalizeRole(user?.type) || "tourist";
  const guideName = readName(raw?.guideName, raw?.guideFullName, readPersonName(raw?.guide));
  const touristName = readName(raw?.touristName, raw?.touristFullName, readPersonName(raw?.tourist));
  const otherUserName = readName(
    raw?.otherUserName,
    raw?.otherUserFullName,
    readPersonName(raw?.otherUser),
    readPersonName(raw?.participant),
    readPersonName(raw?.user)
  );
  const participantName = currentUserType === "guide" ? touristName : guideName;
  const displayName = readName(participantName, otherUserName, guideName, touristName, raw?.name, raw?.title) || `Conversation ${id}`;
  const lastMessage =
    raw?.lastMessage ??
    raw?.latestMessage ??
    raw?.title ??
    "";

  const guideImage = raw?.guide?.imageUrl || raw?.guideImageUrl || raw?.imageUrl || null;
  const touristImage = raw?.tourist?.imageUrl || raw?.touristImageUrl || null;
  const rawImage = currentUserType === "guide" ? touristImage || guideImage : guideImage || touristImage;
  const image = rawImage ? resolveApiAssetUrl(rawImage) : null;
  const guideId = readId(raw?.guideId, raw?.guideUserId, raw?.guide?.id, raw?.guide?.userId);
  const touristId = readId(raw?.touristId, raw?.touristUserId, raw?.tourist?.id, raw?.tourist?.userId);
  const otherUserId = readId(raw?.otherUserId, raw?.otherUser?.id, raw?.otherUser?.userId, raw?.participant?.id, raw?.participant?.userId);

  return {
    id,
    touristName: displayName,
    lastMessage,
    unread: false,
    image,
    guideId,
    touristId,
    otherUserId,
  };
}

async function hydrateConversationName(conversation, user) {
  if (!isFallbackConversationName(conversation?.touristName, conversation?.id)) return conversation;
  const numericId = Number(conversation.id);
  if (!Number.isFinite(numericId)) return conversation;

  try {
    const details = await tourismApi.getConversationById(numericId);
    const normalizedDetails = normalizeConversation(details, user);
    if (normalizedDetails && !isFallbackConversationName(normalizedDetails.touristName, normalizedDetails.id)) {
      return { ...conversation, ...normalizedDetails };
    }
  } catch {
    // Try participant IDs below.
  }

  const currentUserType = normalizeRole(user?.type) || "tourist";
  const participantId = conversation.otherUserId || (currentUserType === "guide" ? conversation.touristId : conversation.guideId);
  if (!participantId) return conversation;

  try {
    const person = await tourismApi.getUserById(participantId);
    const name = readPersonName(person?.data && typeof person.data === "object" ? person.data : person);
    if (name) return { ...conversation, touristName: name };
  } catch {
    return conversation;
  }

  return conversation;
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
