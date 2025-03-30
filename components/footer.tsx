import { Twitter } from "lucide-react";
import { ActionItem } from "./action-item";

export function Footer() {
  return (
    <section className="px-2 pt-2 pb-4">
      <ActionItem>
        <Twitter size={20} />
        <span className="font-medium">Changelog</span>
      </ActionItem>
    </section>
  )
}