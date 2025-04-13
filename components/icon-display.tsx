import { Button } from "./ui/button";
import { TriangleAlert } from 'lucide-react'
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
          ? <div className="flex items-center gap-2 text-white">
              <TriangleAlert size={20} className="text-yellow-400" />
              <span className="font-medium">Open your link</span>
            </div>
          : <img src={icon} className="w-9 h-9" alt="Website icon" />
      }
      <Button onClick={onReset}>Reset</Button>
    </section>
  )
}