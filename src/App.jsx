import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/public/landing";
import SearchResults from "./pages/public/search";
import DestinationDetail from "./pages/public/destination";
import Bookmarks from "./pages/public/bookmarks";
import Demo from "./pages/public/demo";
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgot-password";
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
//import AdminDashboard from "./pages/protected/admin/dashboard";
import AdminLogin from "./pages/auth/admin";
import AdminDashboard from "./pages/public/admin";
import TouristLayout from "./pages/(protected)/tourist/layout";
import GuideLayout from "./pages/(protected)/guide/layout";
import SharedLayout from "./pages/(protected)/shared/layout";

const ROLES = {
  TOURIST: "tourist",
  GUIDE: "guide",
  ADMIN: "admin",
};

const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/admin/login", element: <AdminLogin /> },
];

const publicRoutes = [
  { path: "/search", element: <SearchResults /> },
  { path: "/destination/:id", element: <DestinationDetail /> },
  { path: "/tourist/destination/:id", element: <DestinationDetail /> },
  { path: "/guide/destination/:id", element: <DestinationDetail /> },
  { path: "/search", element: <SearchResults /> },
  { path: "/tourist/search", element: <SearchResults /> },
  { path: "/guide/search", element: <SearchResults /> },
  { path: "/bookmarks", element: <Bookmarks /> },
  { path: "/demo", element: <Demo /> },
  { path: "/admin", element: <AdminDashboard /> },
];

const touristRoutes = [
  { path: "/tourist/home", element: <RoleHome /> },
  { path: "/tourist/pay", element: <BookingForm /> },
  { path: "/tourist/plans", element: <Plans /> },
  { path: "/tourist/create-plan", element: <CreatePlan /> },
  { path: "/tourist/available-guides", element: <AvailableGuides /> },
];

const guideRoutes = [
  { path: "/guide/home", element: <RoleHome /> },
];

const touristDefaultLayoutRoutes = [
  { path: "/available-guides", element: <AvailableGuides /> },
];

const guideDefaultLayoutRoutes = [
  { path: "/requests", element: <Requests /> },
];

// admin is exposed as a public route (see `publicRoutes`).
// The admin default-layout protected route was removed so the page is accessible publicly.

const sharedRoutes = [
  { path: "/profile", element: <Profile /> },
];

const sharedDefaultLayoutRoutes = [
  { path: "/chats", element: <Chats /> },
  { path: "/chats/:conversationId", element: <Chats /> },
  { path: "/notifications", element: <Notifications /> },
];

// App owns URL-to-page mapping and keeps route protection explicit.
function App() {
  const location = useLocation();
  const hideChat = ["/login", "/signup", "/forgot-password", "/admin/login"].includes(location.pathname) || location.pathname.startsWith("/chats");

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedRoute />}>
          {/* Tourist specific pages wrapped in TouristLayout */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.TOURIST]} />}>
            <Route element={<TouristLayout />}>
              {touristRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              {touristDefaultLayoutRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          </Route>

          {/* Guide specific pages wrapped in GuideLayout */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.GUIDE]} />}>
            <Route element={<GuideLayout />}>
              {guideRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              {guideDefaultLayoutRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          </Route>

          {/* Shared protected pages wrapped in SharedLayout */}
          <Route element={<ProtectedRoute allowedRoles={Object.values(ROLES)} />}>
            <Route element={<SharedLayout />}>
              {sharedRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              {sharedDefaultLayoutRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          </Route>
        </Route>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      {!hideChat && <FloatingChatWidget />}
    </>
  );
}

export default App;
