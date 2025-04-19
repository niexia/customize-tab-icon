import { getWebsiteIcon, setWebsiteIcon } from "@/lib/utils";
import { sendMessage, onMessage } from "@/lib/messaging";
import { changiconLocal } from "@/lib/store";

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('hello content')
    console.log(window)

    const initIcon = async () => {
      const {host, pathname} = window.location;
      const storedIcons = await changiconLocal.getValue();
      const pathIcon = storedIcons[host]?.[pathname];
      if (pathIcon) {
        setWebsiteIcon(pathIcon.customIcon)
      }
    }
    initIcon();

    // 不要立即发送图标，而是等待popup请求
    onMessage('requestWebsiteIcon', () => {
      console.log('Received request for website icon');
      const websiteIcon = getWebsiteIcon();
      console.log('Sending website icon:', websiteIcon);
      // 收到请求后再发送图标信息
      sendMessage('getWebsiteIcon', websiteIcon);
      return true;
    });
    
    // 监听来自弹出窗口的消息，用于设置新图标
    onMessage('setWebsiteIcon', (message) => {
      console.log('Received new icon to set:', message.data);
      
      return setWebsiteIcon(message.data);
    });
  },
});
