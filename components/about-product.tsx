import { GitPullRequest, History } from "lucide-react";
import { ActionItem } from "./action-item";

function RequestFeature() {
  return (
    <ActionItem>
      <GitPullRequest size={20} />
      <span className="font-medium">Request feature</span>
    </ActionItem>
  )
}

function Changelog() {
  return (
    <ActionItem>
      <History size={20} />
      <span className="font-medium">Changelog</span>
    </ActionItem>
  )
}


export function AboutProduct() {
  return (
    <section className="px-2 py-2">
      <RequestFeature></RequestFeature>
      <Changelog></Changelog>
    </section>
  )
}