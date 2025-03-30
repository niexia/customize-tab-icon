import { Image } from "lucide-react";
import { ActionItem } from "./action-item"

export function UploadIcon() {
  return (
    <ActionItem>
      <Image size={20}  />
      <span className="font-medium">Upload</span>
    </ActionItem>
  )
}