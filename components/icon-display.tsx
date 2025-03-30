import { Loader } from "./base/loader";
import { Button } from "./ui/button";

type IconDisplayProps = {
  icon: string,
  onReset: () => void
}

export function IconDisplay(props: IconDisplayProps) {
  const { icon, onReset } = props
  return (
    <section className="flex justify-between p-4">
      <img src={icon} className="w-9 h-9"></img>
      <Button onClick={onReset}>Reset</Button>
    </section>
  )
}