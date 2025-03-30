import { FileIcon } from "lucide-react";
import { ActionItem } from "./action-item";

export function IconsIcon() {
  return (
    <ActionItem>
      <FileIcon size={20}  />
      <span className="font-medium">Icons</span>
    </ActionItem>
  )
}