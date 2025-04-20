import { LoaderIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo } from 'react';

type IconDisplayProps = {
  icon: string,
  loading: boolean,
  onReset: () => void
}

export function IconDisplay(props: IconDisplayProps) {
  const { icon, loading, onReset } = props
  const isIconEmpty = useMemo(() => !icon, [icon]);
  return (
    <section className="flex justify-between items-center p-4">
      {
        loading 
          ? <span className="flex gap-1 text-ring"><LoaderIcon className="animate-spin" />Loading...</span>
          : isIconEmpty
              ? <div className="flex items-center">
                  <span className="text-primary">🥹 Open the page first</span>
                </div>
              : <img src={icon} className="w-8 h-8" alt="Website icon" />
      }
      <Button onClick={onReset} size="sm">Reset</Button>
    </section>
  )
}