import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Explore from "./components/Explore";
import About from "./components/About";
import Features from "./components/Features";
import Footer from "./components/Footer";
import SearchResults from "./pages/SearchResults";
import DestinationDetail from "./pages/DestinationDetail";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Bookmarks from "./pages/Bookmarks";
import Demo from "./pages/Demo";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { FloatingChatWidget } from "./components/ui/floating-chat-widget";
import BookingForm from "./pages/Pay";
import Requests from "./pages/Requests";
import Chats from "./pages/Chats";
import Plans from "./pages/Plans";
import CreatePlan from "./pages/CreatePlan";
import AvailableGuides from "./pages/AvailableGuides";

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Explore />
        <About />
        <Features />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const location = useLocation();
  const hideChat = ["/login", "/signup"].includes(location.pathname) || location.pathname.startsWith("/chats");

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pay" element={<BookingForm />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/:conversationId" element={<Chats />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/create-plan" element={<CreatePlan />} />
          <Route path="/available-guides" element={<AvailableGuides />} />
        </Route>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
      {!hideChat && <FloatingChatWidget />}
    </>
  );
}

export default App;
