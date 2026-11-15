import { Image } from 'lucide-react';
import { useRef, useState } from 'react';
import { actionItemClass } from '@/lib/styles';
import { resizeImageToDataUrl, type ImageFit } from '@/lib/icon-image';
import { useIconSettings } from './icon-settings-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface UploadIconProps {
  onIconChange: (icon?: string) => void;
}

export function UploadIcon({ onIconChange }: UploadIconProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fit, setFit] = useState<ImageFit>('cover');
  const { background } = useIconSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setFileName('');
      setError(null);
      setBusy(false);
      setFit('cover');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Choose an image first.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const resizedDataUrl = await resizeImageToDataUrl(file, { background }, fit);
      onIconChange(resizedDataUrl);
      setOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not process this image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger className={actionItemClass}>
        <Image size={20} aria-hidden="true" />
        <span>Upload</span>
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Picture</Label>
            <Input
              id="picture"
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={(event) => {
                setFileName(event.target.files?.[0]?.name ?? '');
                setError(null);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {fileName || 'PNG, JPG, WebP or SVG, up to 5 MB.'}
          </p>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={fit === 'contain'}
              onChange={(event) => setFit(event.target.checked ? 'contain' : 'cover')}
            />
            Fit whole image (adds background instead of cropping)
          </label>
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={!fileName || busy}>
            {busy ? 'Processing...' : 'Confirm'}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
