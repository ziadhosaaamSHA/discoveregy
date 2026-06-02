import { apiRequest } from "../api-client";
import { validateCreateConversationRequest, validateCreateMessageRequest } from "../contracts";

/**
 * Chat endpoints only move transport data.
 * Conversation/message display mapping lives in the chat feature.
 */
export const chatApi = {
  // Starts or returns a conversation with a guide.
  createConversation: (payload) =>
    apiRequest("/api/conversations", { method: "POST", body: validateCreateConversationRequest(payload) }),
  // Loads all conversations for the current user.
  getConversations: () => apiRequest("/api/conversations"),
  // Loads one conversation by id.
  getConversationById: (id) => apiRequest(`/api/conversations/${id}`),
  // Loads messages inside one conversation.
  getMessages: (conversationId) => apiRequest(`/api/messages/${conversationId}`),
  // Sends a message to a conversation.
  sendMessage: (payload) => apiRequest("/api/messages", { method: "POST", body: validateCreateMessageRequest(payload) }),
  // Marks all messages in a conversation as read.
  markMessagesRead: (conversationId) => apiRequest(`/api/messages/${conversationId}/read`, { method: "PUT" }),
};
