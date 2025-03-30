import { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { IconDisplay } from '@/components/icon-display';
import { SettingIcon } from '@/components/setting-icon';
import { AboutProduct } from '@/components/about-product';
import { Footer } from '@/components/footer';
import { onMessage, sendMessage } from '@/lib/messaging';

function App() {
  const [icon, setIcon] = useState('#');

  useEffect(() => {
    // 监听来自content script的图标数据
    const removeListener = onMessage('getWebsiteIcon', message => {
      console.log('Received website icon:', message.data);
      setIcon(message.data);
    });

    // 请求当前标签页的图标
    (async () => {
      try {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab?.id) {
          console.log('No active tab found');
          setIcon('#');
          return;
        }

        // 向content script发送请求获取图标
        await sendMessage('requestWebsiteIcon', undefined, tab.id);
      } catch (err) {
        console.error('Failed to request website icon:', err);
        setIcon('#'); // 设置默认图标
      }
    })();

    // 清理监听器
    return () => removeListener();
  }, []);

  const handleReset = () => {
    if (icon && icon !== '#') {
      console.log('Sending command to reset icon:', icon);
      sendMessage('setWebsiteIcon', icon);
    } else {
      console.log('No valid icon to reset to');
    }
  };

  return (
    <ThemeProvider defaultTheme='dark' storageKey='changicon-theme'>
      <Header />
      <IconDisplay icon={icon} onReset={handleReset}></IconDisplay>
      <SettingIcon></SettingIcon>
      <AboutProduct></AboutProduct>
      <Footer></Footer>
    </ThemeProvider>
  );
}

export default App;
