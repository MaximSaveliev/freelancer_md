import { Hero } from '@/components/hero';
import { Stats } from '@/components/stats';
import { HowItWorks } from '@/components/how-it-works';
import { Features } from '@/components/features';
import { Categories } from '@/components/categories';
import { Projects } from '@/components/projects';
import { Freelancers } from '@/components/freelancers';
import { Pricing } from '@/components/pricing';
import { FAQ } from '@/components/faq';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Categories />
      <Projects />
      <Freelancers />
      <Pricing />
      <FAQ />
    </main>
  );
}
