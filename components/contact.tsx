import { Github, Twitter } from "lucide-react";
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

export function Contact() {
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
    </section>
  );
}