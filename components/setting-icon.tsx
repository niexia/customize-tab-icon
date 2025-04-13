import { TextIcon } from "./text-icon";
import { EmojiIcon } from "./emoji-icon";
import { IconsIcon } from "./icons-icon";
import { UploadIcon } from "./upload-icon";

interface SettingIconProps {
  onIconChange: (icon?: string) => void;
}

export function SettingIcon({ onIconChange }: SettingIconProps) {
  return (
    <section className="flex flex-col">
      <EmojiIcon onIconChange={onIconChange}></EmojiIcon>
      <IconsIcon onIconChange={onIconChange}></IconsIcon>
      <TextIcon onIconChange={onIconChange}></TextIcon>
      <UploadIcon onIconChange={onIconChange}></UploadIcon>
    </section>
  )
}