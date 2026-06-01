import Header from "../../../components/home/Header";
import Hero from "../../../components/home/Hero";
import Explore from "../../../components/home/Explore";
import About from "../../../components/home/About";
import Features from "../../../components/home/Features";
import Footer from "../../../components/home/Footer";

// Landing composes the public marketing/home sections shown at the root route.
export default function Landing() {
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
