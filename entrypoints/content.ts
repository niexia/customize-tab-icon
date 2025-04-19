import { setWebsiteIcon } from "@/lib/utils";
import { onMessage } from "@/lib/messaging";
import { changiconLocal } from "@/lib/store";

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    const setIcon = async () => {
      const {host, pathname} = window.location;
      const storedIcons = await changiconLocal.getValue();
      const pathIcon = storedIcons[host]?.[pathname];
      if (pathIcon) {
        setWebsiteIcon(pathIcon.customIcon)
      }
    }
    setIcon();

    onMessage('setWebsiteIcon', (message) => {
      return setWebsiteIcon(message.data);
    });
  },
});
