type ActionItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
}

export function ActionItem({
  children,
  onClick
}: ActionItemProps) {
  return <div 
    className="flex items-center gap-2 h-9 px-2 hover:rounded-sm hover:bg-accent hover:cursor-pointer"
    onClick={onClick}
  >
    {children}
  </div>
}