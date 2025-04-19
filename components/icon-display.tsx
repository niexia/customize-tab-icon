import { Button } from "./ui/button";
import { useMemo } from 'react';

type IconDisplayProps = {
  icon: string,
  onReset: () => void
}

export function IconDisplay(props: IconDisplayProps) {
  const { icon, onReset } = props
  const isIconEmpty = useMemo(() => !icon, [icon]);
  return (
    <section className="flex justify-between items-center p-4">
      {
        isIconEmpty
          ? <div className="flex items-center gap-2">
            <span className="font-medium">💁 Open the page first</span>
            </div>
          : <img src={icon} className="w-9 h-9" alt="Website icon" />
      }
      <Button onClick={onReset} size="sm">Reset</Button>
    </section>
  )
}