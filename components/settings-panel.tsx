import { Globe, Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IconBackground } from '@/lib/icon-image';
import type { IconScope } from '@/lib/icon-key';
import { useIconSettings } from './icon-settings-context';

export function SettingsPanel() {
  const { background, scope, setBackground, setScope } = useIconSettings();

  return (
    <section className="space-y-2 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Globe size={16} aria-hidden="true" />
          Apply to
        </span>
        <Select value={scope} onValueChange={(value) => setScope(value as IconScope)}>
          <SelectTrigger
            size="sm"
            className="w-32"
            aria-label="Apply icon to"
            title="Apply icon to"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" sideOffset={4}>
            <SelectItem value="page">This page</SelectItem>
            <SelectItem value="domain">Whole site</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        {scope === 'page'
          ? 'Only the current page.'
          : 'Every page on this domain, including subdomains. Replaces existing page icons.'}
      </p>

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
