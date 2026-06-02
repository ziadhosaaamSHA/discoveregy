import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/public/landing";
import SearchResults from "./pages/public/search";
import DestinationDetail from "./pages/public/destination";
import Bookmarks from "./pages/public/bookmarks";
import Demo from "./pages/public/demo";
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgot-password";
import AdminLogin from "./pages/auth/admin";
import RoleHome from "./pages/(protected)/shared/home";
import ProtectedRoute from "./components/ProtectedRoute";
import { FloatingChatWidget } from "./components/ui/floating-chat-widget";
import BookingForm from "./pages/(protected)/tourist/pay";
import Plans from "./pages/(protected)/tourist/plans";
import CreatePlan from "./pages/(protected)/tourist/create-plan";
import AvailableGuides from "./pages/(protected)/tourist/available-guides";
import Requests from "./pages/(protected)/guide/requests";
import Chats from "./pages/(protected)/shared/chats";
import Profile from "./pages/(protected)/shared/profile";
import Notifications from "./pages/(protected)/shared/notifications";
import AdminDashboard from "./pages/(protected)/admin/dashboard";
import TouristLayout from "./pages/(protected)/tourist/layout";
import GuideLayout from "./pages/(protected)/guide/layout";
import SharedLayout from "./pages/(protected)/shared/layout";

const ROLES = {
  TOURIST: "tourist",
  GUIDE: "guide",
  ADMIN: "admin",
};

const CHAT_HIDDEN_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/admin/login",
  "/admin",
  "/tourist/pay",
  "/tourist/plans",
  "/tourist/create-plan",
  "/tourist/available-guides",
  "/guide/home",
  "/guide/requests",
  "/available-guides",
  "/requests",
  "/chats",
  "/notifications",
];

function shouldHideFloatingChat(pathname) {
  return CHAT_HIDDEN_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// App owns URL-to-page mapping and keeps route protection explicit.
function App() {
  const location = useLocation();
  const hideChat = shouldHideFloatingChat(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/search" element={<SearchResults />} />
        <Route path="/tourist/search" element={<SearchResults />} />
        <Route path="/guide/search" element={<SearchResults />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/tourist/destination/:id" element={<DestinationDetail />} />
        <Route path="/guide/destination/:id" element={<DestinationDetail />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/demo" element={<Demo />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.TOURIST]} />}>
            <Route path="/tourist" element={<TouristLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<RoleHome />} />
              <Route path="pay" element={<BookingForm />} />
              <Route path="plans" element={<Plans />} />
              <Route path="create-plan" element={<CreatePlan />} />
              <Route path="available-guides" element={<AvailableGuides />} />
            </Route>
            <Route element={<TouristLayout />}>
              <Route path="/available-guides" element={<AvailableGuides />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.GUIDE]} />}>
            <Route path="/guide" element={<GuideLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<RoleHome />} />
              <Route path="requests" element={<Requests />} />
            </Route>
            <Route element={<GuideLayout />}>
              <Route path="/requests" element={<Requests />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={Object.values(ROLES)} />}>
            <Route element={<SharedLayout />}>
              <Route path="/home" element={<RoleHome />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/:conversationId" element={<Chats />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      {!hideChat && <FloatingChatWidget />}
    </>
  );
}

export default App;
