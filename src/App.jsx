import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { FloatingChatWidget } from "./components/ui/floating-chat-widget";
import { AppRoutes } from "./routes/AppRoutes";
import { shouldHideFloatingChat } from "./routes/chatVisibility";
import { LoadingState } from "./components/ui";
import { useLanguage } from "./context/LanguageContext";

function App() {
  const location = useLocation();
  const hideChat = shouldHideFloatingChat(location.pathname);
  const { t } = useLanguage();

  return (
    <>
      <Suspense fallback={<LoadingState variant="page">{t("common.loading")}</LoadingState>}>
        <AppRoutes />
      </Suspense>
      {!hideChat && <FloatingChatWidget />}
    </>
  );
}

export default App;
