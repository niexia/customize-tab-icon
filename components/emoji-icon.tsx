import { Smile } from "lucide-react";
import { ActionItem } from "./action-item";

export function EmojiIcon() {
  return (
    <ActionItem>
      <Smile size={20} />
      <span className="font-medium">Emoji</span>
    </ActionItem>
  )
}