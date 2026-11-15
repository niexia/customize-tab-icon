import { Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IconBackground } from '@/lib/icon-image';
import { useIconSettings } from './icon-settings-context';

export function SettingsPanel() {
  const { background, setBackground } = useIconSettings();

  return (
    <section className="space-y-2 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Palette size={16} aria-hidden="true" />
          Background
        </span>
        <Select
          value={background}
          onValueChange={(value) => setBackground(value as IconBackground)}
        >
          <SelectTrigger
            size="sm"
            className="w-32"
            aria-label="Icon background"
            title="Icon background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" sideOffset={4}>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="transparent">Transparent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Applies to new icons. White works best for text and line icons.
      </p>
    </section>
  );
}
