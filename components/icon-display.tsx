import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

type IconDisplayProps = {
  icon: string;
  loading: boolean;
  canReset: boolean;
  hint: string;
  onReset: () => void;
};

export function IconDisplay({ icon, loading, canReset, hint, onReset }: IconDisplayProps) {
  // Keep track of the failed URL instead of resetting state in an effect, so a
  // new icon is always retried.
  const [failedIcon, setFailedIcon] = useState<string | null>(null);
  const showIcon = Boolean(icon) && failedIcon !== icon;

  return (
    <section className="flex items-center justify-between gap-2 p-4">
      <div className="flex min-w-0 items-center" aria-live="polite">
        {loading ? (
          <span className="flex items-center gap-1 text-ring">
            <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
            Loading...
          </span>
        ) : showIcon ? (
          <img
            src={icon}
            className="size-8 shrink-0"
            alt="Website icon"
            onError={() => setFailedIcon(icon)}
          />
        ) : (
          <span className="text-primary">{hint}</span>
        )}
      </div>
      <Button onClick={onReset} size="sm" disabled={!canReset || loading}>
        Reset
      </Button>
    </section>
  );
}
