import { LoaderCircle } from 'lucide-react';
import type { IconScope } from '@/lib/icon-key';
import { useState } from 'react';
import { Button } from './ui/button';

type IconDisplayProps = {
  icon: string;
  loading: boolean;
  source: IconScope | null;
  hint: string;
  onReset: () => void;
};

export function IconDisplay({ icon, loading, source, hint, onReset }: IconDisplayProps) {
  // Keep track of the failed URL instead of resetting state in an effect, so a
  // new icon is always retried.
  const [failedIcon, setFailedIcon] = useState<string | null>(null);
  const showIcon = Boolean(icon) && failedIcon !== icon;
  const sourceLabel = source === 'page' ? 'This page' : source === 'domain' ? 'Whole site' : '';
  const resetLabel = source === 'page' ? 'Reset page' : source === 'domain' ? 'Reset site' : 'Reset';

  return (
    <section className="flex items-center justify-between gap-2 p-4">
      <div className="flex min-w-0 items-center" aria-live="polite">
        {loading ? (
          <span className="flex items-center gap-1 text-ring">
            <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
            Loading...
          </span>
        ) : showIcon ? (
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={icon}
              className="size-8 shrink-0"
              alt="Website icon"
              onError={() => setFailedIcon(icon)}
            />
            {source ? (
              <span className="truncate text-xs text-muted-foreground">{sourceLabel}</span>
            ) : null}
          </div>
        ) : (
          <span className="text-primary">{hint}</span>
        )}
      </div>
      <Button onClick={onReset} size="sm" disabled={!source || loading}>
        {resetLabel}
      </Button>
    </section>
  );
}
