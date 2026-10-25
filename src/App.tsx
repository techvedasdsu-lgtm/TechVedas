import { useState } from "react";
import ScrollCanvasBackground from "./components/ScrollCanvasBackground";
import Navbar from "./components/Navbar";
import LoginDialog from "./components/LoginDialog";
import Hero from "./components/Hero";
import About from "./components/About";
import Values from "./components/Values";
import WhatWeDo from "./components/WhatWeDo";
import Vision from "./components/Vision";
import Events from "./components/Events";
import Gallery from "./components/Gallery";
import Team from "./components/Team";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  return (
    <div className="relative bg-[#030305] text-cream min-h-screen">
      <ScrollCanvasBackground />
      <div className="grain" />
      <Navbar onLoginClick={() => setLoginMessage("Choose an account type to continue.")} />
      <main className="relative z-10">
        <Hero />
        <About />
        <Values />
        <WhatWeDo />
        <Vision />
        <Events onLoginRequired={() => setLoginMessage("Sign in to access event details and registration.")} />
        <Gallery />
        <Team />
        <Contact />
      </main>
      <Footer />
      {loginMessage && (
        <LoginDialog message={loginMessage} onClose={() => setLoginMessage(null)} />
      )}
    </div>
  );
}
