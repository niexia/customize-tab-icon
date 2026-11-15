import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useTheme } from '../theme-context';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

type EmojiSelectEvent = {
  native?: string;
};

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Picker
      data={data}
      previewPosition="none"
      onEmojiSelect={(emoji: EmojiSelectEvent) => {
        if (emoji.native) onSelect(emoji.native);
      }}
      emojiButtonSize={32}
      perLine={8}
      theme={resolvedTheme}
    />
  );
}
