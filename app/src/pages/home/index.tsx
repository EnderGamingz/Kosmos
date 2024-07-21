import { Hero } from '@pages/home/hero.tsx';
import { Features } from '@pages/home/features.tsx';
import Footer from '@pages/home/footer.tsx';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className={'mx-auto mt-12 w-full max-w-7xl p-5'}>
        <Features />
      </div>
      <Footer />
    </>
  );
}
