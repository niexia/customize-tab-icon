import { ModeToggle } from "./mode-toogle";
export function Header() {
  return (
    <div className="flex justify-between">
      <h1 className="text-xl font-bold">Changicon</h1>
      <ModeToggle></ModeToggle>
    </div>
  );
}

