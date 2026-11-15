import { lazy, Suspense, useState } from 'react';
import { Target } from 'lucide-react';
import { usePopupHeight } from '@/hooks/usePopupHeight';
import { actionItemClass } from '@/lib/styles';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Loader } from '../base/loader';
import { useIconSettings } from '../icon-settings-context';

// The icon picker pulls in the full lucide icon set; load it on demand.
const IconPicker = lazy(() => import('./picker'));

interface IconsIconProps {
  onIconChange: (icon?: string) => void;
}

export function IconsIcon({ onIconChange }: IconsIconProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { background } = useIconSettings();

  usePopupHeight(popoverOpen);

  const handleIconSelect = (iconDataUrl: string) => {
    onIconChange(iconDataUrl);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className={actionItemClass}>
        <Target size={20} aria-hidden="true" />
        <span>Icon</span>
      </PopoverTrigger>
      <PopoverContent>
        <Suspense
          fallback={
            <div className="flex h-[320px] items-center justify-center">
              <Loader className="h-6 w-6" />
            </div>
          }
        >
          <IconPicker background={background} onSelect={handleIconSelect} />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
