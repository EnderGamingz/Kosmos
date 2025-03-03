import { useCallback, useState } from 'react';

export default function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    onOpenChange,
    onClose,
    onOpen,
  };
}
