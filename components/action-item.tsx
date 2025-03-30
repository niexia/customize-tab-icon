
type ActionItemProps = {
  children: React.ReactNode
}

export function ActionItem({
  children
}: ActionItemProps) {
  return <div className="flex items-center gap-2 h-9 px-2 hover:rounded-sm hover:bg-accent hover:cursor-pointer">
    {children}
  </div>
}