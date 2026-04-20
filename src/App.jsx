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
import PayPage from "./pages/Pay";
import ProtectedRoute from "./components/ProtectedRoute";
import { FloatingChatWidget } from "./components/ui/floating-chat-widget";
import BookingForm from "./pages/Pay";

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
  const hideChat = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pay" element={<BookingForm />} />
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
