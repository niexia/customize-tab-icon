import { ModeToggle } from './mode-toggle';

export function Header() {
  return (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-xl font-bold">Changicon</h1>
      <ModeToggle />
    </div>
  );
}
