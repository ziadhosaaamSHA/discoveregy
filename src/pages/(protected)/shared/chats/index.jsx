import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { useAuth } from "../../../../context/AuthContext";
import { ConversationItem } from "../../../../components/chats/ConversationItem";
import { ChatDetail } from "../../../../components/chats/ChatDetail";
import { Button, EmptyState, LoadingState, SearchInput } from "../../../../components/ui";
import { useChats } from "./hooks/useChats";

// Chats renders the conversation list and the selected conversation detail pane.
export default function Chats() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const {
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
  } = useChats({ user, conversationId, navigate });

  return (
    <div className="min-h-screen bg-[#f2e0ca] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-28 pb-16">
        {/* Page title and clear button */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-[38px] font-bold text-black tracking-tight">
            {t("chats.title") || "Chats"}
          </h1>
          {conversations.length > 0 && (
            <Button type="button" variant="danger" onClick={clearAllConversations}>
              {t("chats.clearAll") || "Clear All"}
            </Button>
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
                onClick={selectConversation}
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
              onBack={backToList}
              messages={messages}
              onSendMessage={sendMessage}
              onDeleteChat={deleteChat}
              isLoading={isLoadingMessages}
              currentUserType={user?.type === "guide" ? "guide" : "tourist"}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
