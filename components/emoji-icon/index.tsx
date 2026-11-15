import { Smile } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { usePopupHeight } from '@/hooks/usePopupHeight';
import { actionItemClass } from '@/lib/styles';
import { generateEmojiDataUrl } from '@/lib/icon-image';
import { useIconSettings } from '../icon-settings-context';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Loader } from '../base/loader';
import styles from './index.module.css';

// The emoji data + picker are large; only download them when the panel opens.
const EmojiPicker = lazy(() => import('./picker'));

interface EmojiIconProps {
  onIconChange: (icon?: string) => void;
}

export function EmojiIcon({ onIconChange }: EmojiIconProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { background } = useIconSettings();

  usePopupHeight(popoverOpen);

  const handleEmojiSelect = (emoji: string) => {
    const emojiDataUrl = generateEmojiDataUrl(emoji, { background });
    if (!emojiDataUrl) return;

    onIconChange(emojiDataUrl);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className={actionItemClass}>
        <Smile size={20} aria-hidden="true" />
        <span>Emoji</span>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className={styles.emojiPickerWrapper}>
          <Suspense
            fallback={
              <div className="flex h-[354px] w-[288px] items-center justify-center">
                <Loader className="h-6 w-6" />
              </div>
            }
          >
            <EmojiPicker onSelect={handleEmojiSelect} />
          </Suspense>
        </div>
      </PopoverContent>
    </Popover>
  );
}
