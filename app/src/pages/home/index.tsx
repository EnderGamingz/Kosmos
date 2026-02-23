import { Hero } from '@pages/home/hero.tsx';
import { Features } from '@pages/home/features.tsx';
import Footer from '@pages/home/footer.tsx';
import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const user = useUserState(s => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/home');
  }, [navigate, user]);

  return (
    <>
      <div className={'grow'}>
        <Hero />
        <section className={'mx-auto mt-12 w-full max-w-7xl p-5'}>
          <Features />
        </section>
      </div>
      <Footer />
    </>
  );
}
