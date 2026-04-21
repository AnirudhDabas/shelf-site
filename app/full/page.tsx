import BackgroundCanvas from "@/components/BackgroundCanvas";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WorksWith from "@/components/WorksWith";
import HowItWorks from "@/components/HowItWorks";
import BeforeAfter from "@/components/BeforeAfter";
import Stats from "@/components/Stats";
import Credits from "@/components/Credits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function FullPage() {
  return (
    <>
      <BackgroundCanvas />
      <Nav />
      <main>
        <Hero />
        <WorksWith />
        <HowItWorks />
        <BeforeAfter />
        <Stats />
        <Credits />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
