import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { Smile } from 'lucide-react';
import { EmojiPicker } from '@ferrucc-io/emoji-picker';

export function EmojiSelect({
  handleSelect,
}: {
  handleSelect: (e: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'ghost'} className={'aspect-square'}>
          <Smile />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={'p-0'}>
        <EmojiPicker
          onEmojiSelect={handleSelect}
          className={'border-none'}
          emojisPerRow={9}
          emojiSize={34}>
          <EmojiPicker.Header>
            <EmojiPicker.Input placeholder={'Search emoji'} hideIcon />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List containerHeight={320} />
          </EmojiPicker.Group>
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}
