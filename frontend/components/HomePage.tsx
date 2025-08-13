import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { SmartMatchmaking } from "./SmartMatchmaking";
import { FeaturedProperties } from "./FeaturedProperties";
import { PropertyCategories } from "./PropertyCategories";
import { TrustSection } from "./TrustSection";
import { Footer } from "./Footer";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SmartMatchmaking />
        <FeaturedProperties />
        <PropertyCategories />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}