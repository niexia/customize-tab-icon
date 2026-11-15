import { Keyboard } from 'lucide-react';
import { useState } from 'react';
import { actionItemClass } from '@/lib/styles';
import { generateTextDataUrl } from '@/lib/icon-image';
import { useIconSettings } from './icon-settings-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface TextIconProps {
  onIconChange: (icon?: string) => void;
}

export function TextIcon({ onIconChange }: TextIconProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { background } = useIconSettings();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setInputValue('');
  };

  const handleSubmit = () => {
    const textDataUrl = generateTextDataUrl(inputValue, { background });
    if (!textDataUrl) return;

    onIconChange(textDataUrl);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger className={actionItemClass}>
        <Keyboard size={20} aria-hidden="true" />
        <span>Text</span>
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            aria-label="Icon text"
            placeholder="Enter up to 2 characters"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            maxLength={2}
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={!inputValue.trim()}>
            Confirm
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
