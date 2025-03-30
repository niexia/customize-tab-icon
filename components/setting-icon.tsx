import { EmojiIcon } from "./emoji-icon";
import { IconsIcon } from "./icons-icon";
import { TextIcon } from "./text-icon";
import { UploadIcon } from "./upload-icon";

export function SettingIcon() {
  return (
    <section className="px-2 py-2">
      <EmojiIcon></EmojiIcon>
      <IconsIcon></IconsIcon>
      <TextIcon></TextIcon>
      <UploadIcon></UploadIcon>
    </section>
  )
}