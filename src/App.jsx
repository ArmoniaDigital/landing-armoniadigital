import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Stats from "./components/Stats/Stats";
import Benefits from "./components/Benefits/Benefits";
import Pricing from "./components/pricing/Pricing";
import Portfolio from "./components/Portfolio/Portfolio";
import Extras from "./components/Extras/Extras";
import Preparation from "./components/Preparation/Preparation";
import Testimonials from "./components/Testimonials/Testimonials";
import FAQ from "./components/FAQ/FAQ";
import FinalStat from "./components/FinalStat/FinalStat";
import Blog from "./components/Blog/Blog";
import Welcome from "./components/Welcome/Welcome";
import Appointment from "./components/Appointment/Appointment";
import Checkout from "./components/Checkout/Checkout";
import Onboarding from "./components/Onboarding/Onboarding";
import Footer from "./components/Footer/Footer";
import CookieConsent from "./components/CookieConsent/CookieConsent";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Benefits />
      <Pricing />
      <Portfolio />
      <Extras />
      <Preparation />
      <Testimonials />
      <FAQ />
      <FinalStat />
      <Blog />
      <Footer />
      <CookieConsent />
      <Appointment />
      <Checkout />
      <Onboarding />
    </>
  );
}