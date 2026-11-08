import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import { Marquee, Benefits, HowItWorks, AppShowcase, About, Dollar, Faq, Footer, FloatingWhatsApp } from '../components/landing/Sections';

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Benefits />
        <HowItWorks />
        <AppShowcase />
        <About />
        <Dollar />
        <Faq />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
