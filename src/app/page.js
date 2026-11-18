import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { VendorCta } from "@/components/home/VendorCta";
import { WhyChoose } from "@/components/home/WhyChoose";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <CategoryGrid />
      <WhyChoose />
      <HowItWorks />
      <VendorCta />
    </>
  );
}
