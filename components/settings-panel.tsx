import { Globe, Palette } from 'lucide-react';
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IconBackground } from '@/lib/icon-image';
import { getScopeOptions, resolveScope, type IconScope } from '@/lib/icon-key';
import { useIconSettings } from './icon-settings-context';
import { getScopeDescription, getScopeHint, getScopeLabel } from './scope-labels';

type SettingsPanelProps = {
  /** Active tab URL; undefined on pages the extension cannot customize. */
  url?: string;
};

const ALL_SCOPES: IconScope[] = ['page', 'host', 'domain'];

export function SettingsPanel({ url }: SettingsPanelProps) {
  const { background, scope, setBackground, setScope } = useIconSettings();

  // Localhost and IP addresses have no subdomains, so host and site scope are
  // the same choice there; show it once, as the host scope.
  const options = useMemo(() => (url ? getScopeOptions(url) : ALL_SCOPES), [url]);
  const activeScope = url ? resolveScope(url, scope) : scope;
  const hint = getScopeHint(url, activeScope);

  return (
    <section className="space-y-2 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Globe size={16} aria-hidden="true" />
          Apply to
        </span>
        <Select value={activeScope} onValueChange={(value) => setScope(value as IconScope)}>
          <SelectTrigger
            size="sm"
            className="w-40"
            aria-label="Apply icon to"
            title="Apply icon to"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" sideOffset={4} className="min-w-56">
            <SelectItem value="page">{getScopeLabel(url, 'page')}</SelectItem>
            <SelectItem value="host" description={getScopeDescription(url, 'host')}>
              {getScopeLabel(url, 'host')}
            </SelectItem>
            {options.includes('domain') ? (
              <SelectItem value="domain" description={getScopeDescription(url, 'domain')}>
                {getScopeLabel(url, 'domain')}
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>

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
            className="w-40"
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
