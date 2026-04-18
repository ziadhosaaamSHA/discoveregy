import { Routes, Route } from "react-router-dom";
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
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/destination/:id" element={<DestinationDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
    </Routes>
  );
}

export default App;
