import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { ALL_ROLES, ROLES } from "./roles";

const Landing = lazy(() => import("../pages/public/landing"));
const SearchResults = lazy(() => import("../pages/public/search"));
const DestinationDetail = lazy(() => import("../pages/public/destination"));
const Bookmarks = lazy(() => import("../pages/public/bookmarks"));
const Demo = lazy(() => import("../pages/public/demo"));
const Login = lazy(() => import("../pages/auth/login"));
const SignUp = lazy(() => import("../pages/auth/signup"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const AdminLogin = lazy(() => import("../pages/auth/admin"));
const RoleHome = lazy(() => import("../pages/(protected)/shared/home"));
const BookingForm = lazy(() => import("../pages/(protected)/tourist/pay"));
const Plans = lazy(() => import("../pages/(protected)/tourist/plans"));
const CreatePlan = lazy(() => import("../pages/(protected)/tourist/create-plan"));
const AvailableGuides = lazy(() => import("../pages/(protected)/tourist/available-guides"));
const Requests = lazy(() => import("../pages/(protected)/guide/requests"));
const Chats = lazy(() => import("../pages/(protected)/shared/chats"));
const Profile = lazy(() => import("../pages/(protected)/shared/profile"));
const Notifications = lazy(() => import("../pages/(protected)/shared/notifications"));
const AdminDashboard = lazy(() => import("../pages/(protected)/admin/dashboard"));
const TouristLayout = lazy(() => import("../pages/(protected)/tourist/layout"));
const GuideLayout = lazy(() => import("../pages/(protected)/guide/layout"));
const SharedLayout = lazy(() => import("../pages/(protected)/shared/layout"));

export function AppRoutes() {
  return (
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

        <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
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
  );
}
