import { FileIcon, Search } from "lucide-react";
import { ActionItem } from "./action-item";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { usePopupHeight } from "@/hooks/usePopupHeight";
import { Input } from "./ui/input";
import * as Icons from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import iconMetaData from "@/public/data/iconMetaData";
import iconCategory from "@/public/data/iconCategory";

const capitalizeIconName = (iconName: string) => {
  return iconName.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
};

// const ICON_META_LIST = Object.entries(iconMetaData);
// const ICON_CATEGORIES = iconCategory.map((category) => ({
//   icons: ICON_META_LIST
//     .filter(([_, categories]) => (categories as string[]).includes(category.name))
//     .map(([iconName]) => capitalizeIconName(iconName)),
//   ...category
// }));

const ICON_LIST = Object.keys(iconMetaData).map(capitalizeIconName)

export function IconsIcon() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  usePopupHeight(popoverOpen, '600px');
  
  const handleIconSelect = (iconName: string) => {
    setPopoverOpen(false);
  };

  const categories = useMemo(() => {
    if (!searchTerm) return ICON_LIST;
    return ICON_LIST.filter(iconName => (iconName.toLowerCase().includes(searchTerm.toLowerCase())))
  }, [searchTerm]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className="w-full">
        <ActionItem>
          <FileIcon size={20} />
          <span className="font-medium">Icons</span>
        </ActionItem>
      </PopoverTrigger>
      <PopoverContent className="min-w-80" sideOffset={0} align="start" alignOffset={0}>
        <div className="relative mb-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-8 gap-2">
            {categories.map((iconName) => {
              const IconComponent = (Icons as any)[iconName];
              return IconComponent && (
                <span 
                  key={iconName}
                  className="p-1 hover:rounded-full hover:bg-accent hover:cursor-pointer"
                  onClick={() => handleIconSelect(iconName)}
                >
                  <IconComponent size={20} />
                </span>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}