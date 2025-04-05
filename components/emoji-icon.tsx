import { Smile } from "lucide-react";
import { ActionItem } from "./action-item";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { sendMessage } from "@/lib/messaging";
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useState } from "react";
import { usePopupHeight } from "@/hooks/usePopupHeight";

export function EmojiIcon() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // 使用自定义hook来管理popup高度
  usePopupHeight(popoverOpen, '600px');
  
  const handleEmojiSelect = (emoji: any) => {
    console.log('Selected emoji:', emoji.native);
    // 创建emoji的data URL
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 32, 32);
      const emojiDataUrl = canvas.toDataURL();
      
      // 发送消息更新图标
      sendMessage('setWebsiteIcon', emojiDataUrl);
      
      // 选择后自动关闭popover
      setPopoverOpen(false);
    }
  };
  
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className="w-full">
        <ActionItem>
          <Smile size={20} />
          <span className="font-medium">Emoji</span>
        </ActionItem>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0" 
        sideOffset={0}
        align="start"
        alignOffset={0}
      >
        <Picker 
          data={data} 
          previewPosition="none" 
          onEmojiSelect={handleEmojiSelect}
          emojiButtonSize={32}
          perLine={9}
        />
      </PopoverContent>
    </Popover>
  )
}