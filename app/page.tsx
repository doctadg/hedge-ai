import { HeroSection } from "@/components/hero-section"
// import { FeatureSection } from "@/components/feature-section" // Removed import
import { DataSection } from "@/components/data-section"
import { GeniusSection } from "@/components/genius-section"
import { FooterSection } from "@/components/footer-section"
import { Navbar } from "@/components/navbar"

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black">
      <Navbar />
      <HeroSection />
      {/* <FeatureSection /> */} {/* Removed usage */}
      <DataSection /> {/* This now contains the combined content */}
      <GeniusSection />
      <FooterSection />
    </main>
  )
}
