import { tourismApi } from "../../services/tourism-api";
import { resolveApiAssetUrl } from "../../services/api-client";
import { extractArray } from "../../shared/utils/api-shapes";
import {
  isFallbackConversationName,
  normalizeRole,
  readId,
  readName,
  readPersonName,
} from "../../shared/utils/identity";
import { conversationSchema, messageSchema } from "../../shared/schemas/chat";

const resolveAttachmentUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  return resolveApiAssetUrl(url);
};

export function normalizeMessages(payload, user) {
  const currentUserType = normalizeRole(user?.type) || "tourist";
  const currentUserId = readId(user?.id, user?.userId);
  const source = extractArray(payload);

  return source.map((rawMessage) => {
    const parsed = messageSchema.safeParse(rawMessage);
    const msg = parsed.success ? parsed.data : rawMessage;
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

export function normalizeConversation(rawConversation, user) {
  const parsed = conversationSchema.safeParse(rawConversation);
  const raw = parsed.success ? parsed.data : rawConversation;
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
  const lastMessage = raw?.lastMessage ?? raw?.latestMessage ?? raw?.title ?? "";

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

export async function hydrateConversationName(conversation, user) {
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
    const source = person?.data && typeof person.data === "object" ? person.data : person;
    const name = readPersonName(source);
    if (name) return { ...conversation, touristName: name };
  } catch {
    return conversation;
  }

  return conversation;
}
