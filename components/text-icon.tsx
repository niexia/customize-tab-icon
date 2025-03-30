import { Keyboard } from "lucide-react";
import { ActionItem } from "./action-item";

export function TextIcon() {
  return (
    <ActionItem>
      <Keyboard size={20}  />
      <span className="font-medium">text</span>
    </ActionItem>
  )
}