import { ModeToggle } from "./mode-toogle";
export function Header() {
  return (
    <div className="flex justify-between p-4 items-center">
      <h1 className="text-xl font-bold">Changicon</h1>
      <ModeToggle></ModeToggle>
    </div>
  );
}

