import { Github, Trash2, Twitter } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

type SocialLink = {
  url: string;
  icon: React.ReactNode;
  label: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    url: 'https://x.com/yangjinfe',
    icon: <Twitter size={20} />,
    label: 'X'
  },
  {
    url: 'https://github.com/niexia/customize-tab-icon',
    icon: <Github size={20} />,
    label: 'GitHub'
  }
];

type ContactProps = {
  onClearAll?: () => void;
};

export function Contact({ onClearAll }: ContactProps) {
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="px-2 pt-2 pb-4 flex">
      {SOCIAL_LINKS.map(({ url, icon, label }) => (
        <Button
          key={url}
          variant="ghost"
          size="icon"
          className="hover:bg-accent hover:cursor-pointer"
          onClick={() => handleOpenUrl(url)}
          aria-label={label}
        >
          {icon}
        </Button>
      ))}
      {onClearAll ? (
        confirmingClearAll ? (
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmingClearAll(false);
                onClearAll();
              }}
            >
              Clear all
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingClearAll(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hover:bg-accent hover:cursor-pointer"
            onClick={() => setConfirmingClearAll(true)}
            aria-label="Clear all custom icons"
            title="Clear all custom icons"
          >
            <Trash2 size={20} />
          </Button>
        )
      ) : null}
    </section>
  );
}