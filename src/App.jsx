import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { FloatingChatWidget } from "./components/ui/floating-chat-widget";
import { AppRoutes } from "./routes/AppRoutes";
import { shouldHideFloatingChat } from "./routes/chatVisibility";
import { LoadingState } from "./components/shared";

function App() {
  const location = useLocation();
  const hideChat = shouldHideFloatingChat(location.pathname);

  return (
    <>
      <Suspense fallback={<LoadingState variant="page">Loading Discover Egypt...</LoadingState>}>
        <AppRoutes />
      </Suspense>
      {!hideChat && <FloatingChatWidget />}
    </>
  );
}

export default App;
