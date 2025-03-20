import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import { Button } from '@components/ui/button.tsx';
import { LogOut } from 'lucide-react';
import { useChatContext } from '../context';

export function LeaveGroupButton() {
  const { chatId } = useChatContext();
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: () => ChatQuery.leaveGroupChatRequest({ chatId }),
    onSuccess: () => navigate('/social/chats'),
  });

  return (
    <Button
      variant={'destructive'}
      disabled={isPending}
      onClick={() => mutate()}>
      <LogOut />
      Leave
    </Button>
  );
}
