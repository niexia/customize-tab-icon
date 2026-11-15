import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import iconMetaData from '@/lib/data/iconMetaData';
import { capitalizeIconName } from '@/lib/icon-names';
import { generateSvgDataUrl } from '@/lib/icon-image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

type LucideIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;

// A namespace import cannot be tree-shaken, so this module is lazy-loaded by
// `components/icons-icon/index.tsx`.
const ICON_COMPONENTS = Icons as unknown as Record<string, LucideIconComponent | undefined>;
const ICON_NAMES = Object.keys(iconMetaData).map(capitalizeIconName);
const PAGE_SIZE = 160;

interface IconPickerProps {
  onSelect: (iconDataUrl: string) => void;
}

export default function IconPicker({ onSelect }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ query: '', limit: PAGE_SIZE });

  // Reset the "show more" limit whenever the query changes, without an effect.
  const limit = pagination.query === searchTerm ? pagination.limit : PAGE_SIZE;

  const filteredIcons = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return ICON_NAMES;
    return ICON_NAMES.filter((iconName) => iconName.toLowerCase().includes(query));
  }, [searchTerm]);

  const visibleIcons = filteredIcons.slice(0, limit);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination({ query: value, limit: PAGE_SIZE });
  };

  const handleSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
    const svgElement = event.currentTarget.querySelector('svg');
    if (!svgElement) return;

    const svgDataUrl = generateSvgDataUrl(svgElement as SVGElement);
    if (svgDataUrl) onSelect(svgDataUrl);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="Search icons"
          placeholder="Search icon..."
          className="pl-8"
          value={searchTerm}
          onChange={(event) => handleSearchChange(event.target.value)}
          autoFocus
        />
      </div>

      {filteredIcons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No icons found</p>
      ) : (
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-8 gap-2">
            {visibleIcons.map((iconName) => {
              const IconComponent = ICON_COMPONENTS[iconName];
              if (!IconComponent) return null;

              return (
                <button
                  key={iconName}
                  type="button"
                  aria-label={iconName}
                  title={iconName}
                  className="flex items-center justify-center rounded-full p-1 hover:cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleSelect}
                >
                  <IconComponent size={20} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {visibleIcons.length < filteredIcons.length ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() =>
                setPagination({ query: searchTerm, limit: visibleIcons.length + PAGE_SIZE })
              }
            >
              Show more ({filteredIcons.length - visibleIcons.length})
            </Button>
          ) : null}
        </ScrollArea>
      )}
    </div>
  );
}
