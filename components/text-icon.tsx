import { Keyboard } from "lucide-react";
import { ActionItem } from "./action-item";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { generateTextDataUrl } from "@/lib/utils";

interface TextIconProps {
  onIconChange: (icon?: string) => void;
}

export function TextIcon({ onIconChange }: TextIconProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (!inputValue?.trim()) {
      return;
    }

    const textDataUrl = generateTextDataUrl(inputValue);
    onIconChange(textDataUrl);
    setOpen(false);
  };

  useEffect(() => {
    setInputValue("");
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <ActionItem>
          <Keyboard size={20} />
          <span className="font-medium">text</span>
        </ActionItem>
      </PopoverTrigger>
      <PopoverContent className="space-y-4">
        <Input
          placeholder="Enter text..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={2}
        />
        <Button className="w-full" onClick={handleSubmit}>
          Confirm
        </Button>
      </PopoverContent>
    </Popover>
  );
}