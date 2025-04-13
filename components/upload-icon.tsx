import { Image } from "lucide-react";
import { ActionItem } from "./action-item";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { resizeImageToDataUrl } from "@/lib/utils";

interface UploadIconProps {
  onIconChange: (icon?: string) => void;
}

export function UploadIcon({ onIconChange }: UploadIconProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const resizedDataUrl = await resizeImageToDataUrl(file);
      onIconChange(resizedDataUrl);
      setOpen(false);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  useEffect(() => {
    if (!open && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <ActionItem>
          <Image size={20} />
          <span className="font-medium">Upload</span>
        </ActionItem>
      </PopoverTrigger>
      <PopoverContent className="space-y-4">
        <div className="grid w-full lg:max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Picture</Label>
          <Input id="picture" type="file" ref={fileInputRef} accept="image/*" />
        </div>
        <Button className="w-full" onClick={handleSubmit}>
          Confirm
        </Button>
      </PopoverContent>
    </Popover>
  );
}