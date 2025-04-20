import { Smile } from "lucide-react";
import { ActionItem } from "../action-item";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useState } from "react";
import { usePopupHeight } from "@/hooks/usePopupHeight";
import styles from "./index.module.css";
import { generateEmojiDataUrl } from "@/lib/utils";

interface EmojiIconProps {
  onIconChange: (icon?: string) => void;
}

export function EmojiIcon({ onIconChange }: EmojiIconProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // 使用自定义hook来管理popup高度
  usePopupHeight(popoverOpen, '600px');
  
  const handleEmojiSelect = (emoji: any) => {
    const emojiDataUrl = generateEmojiDataUrl(emoji.native);
    onIconChange(emojiDataUrl);
    setPopoverOpen(false);
  };
  
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className="w-full">
        <ActionItem>
          <Smile size={20} />
          <span className="font-medium">Emoji</span>
        </ActionItem>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className={styles.emojiPickerWrapper}>
          <Picker
            data={data} 
            previewPosition="none" 
            onEmojiSelect={handleEmojiSelect}
            emojiButtonSize={32}
            perLine={9}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}