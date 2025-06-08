import { Button } from '@components/ui/button.tsx';
import { ReactNode, useEffect, useState } from 'react';

export default function FallbackTester({
  component,
  children,
  fallback,
}: {
  component: string;
  children: ReactNode;
  fallback: ReactNode;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.warn(
      `FallbackTester is used in ${component} component. It should be removed in production.`,
    );
  }, []);
  return (
    <>
      {show ? fallback : children}
      <Button
        className={'fixed bottom-4 right-4'}
        onClick={() => setShow(!show)}>
        Toggle Fallback
      </Button>
    </>
  );
}
