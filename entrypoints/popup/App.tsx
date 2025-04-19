import { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { IconDisplay } from '@/components/icon-display';
import { SettingIcon } from '@/components/setting-icon';
import { AboutProduct } from '@/components/about-product';
import { Footer } from '@/components/footer';
import { onMessage, sendMessage } from '@/lib/messaging';
import { changiconLocal } from '@/lib/store';

function App() {
  const [icon, setIcon] = useState('');
  const [tab, setTab] = useState({} as chrome.tabs.Tab);

  useEffect(() => {
    const startRequest = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        if (!tab?.id || !tab.url) {
          console.log('No active tab found or invalid URL');
          return;
        }

        const {host, pathname} = new URL(tab.url);
        const storedIcons = await changiconLocal.getValue();
        const storeIcon = storedIcons[host]?.[pathname];
        if (storeIcon) {
          setIcon(storeIcon.customIcon);
        } else {
          await sendMessage('requestWebsiteIcon', undefined, tab.id);
        }
        setTab(tab);
      } catch (err) {
        console.error('Failed to request website icon:', err);
      }
    }
    startRequest();

    const removeListener = onMessage('getWebsiteIcon', async message => {
      console.log('Received website icon:', message.data);
      setIcon(message.data);
    });

    return () => removeListener();
  }, []);

  const changeIcon = async (val?: string) => {
    if (!val || !tab?.id || !tab.url) {
      console.log('No valid icon to set or invalid tab');
      return;
    }

    const host = new URL(tab.url).host;
    const pathname = new URL(tab.url).pathname;
    const storedIcons = await changiconLocal.getValue();
    
    // 更新存储的图标信息
    await changiconLocal.setValue({
      ...storedIcons,
      [host]: {
        ...storedIcons[host] || {},
        [pathname]: {
          customIcon: val
        }
      }
    });

    try {
      await sendMessage('setWebsiteIcon', val, tab.id);
      setIcon(val);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const resetIcon = async () => {
    if (!tab?.id || !tab.url) {
      console.log('No valid tab to reset icon');
      return;
    }

    const host = new URL(tab.url).host;
    const pathname = new URL(tab.url).pathname;
    const storedIcons = await changiconLocal.getValue();
    
    // 移除自定义图标
    await changiconLocal.setValue({
      ...storedIcons,
      [host]: {
        ...storedIcons[host] || {},
        [pathname]: {
          customIcon: ''
        }
      }
    });

    try {
      await sendMessage('setWebsiteIcon', tab.favIconUrl ?? '', tab.id);
      setIcon(tab.favIconUrl ?? '');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <ThemeProvider defaultTheme='dark'>
      <Header />
      <IconDisplay icon={icon} onReset={resetIcon}></IconDisplay>
      <SettingIcon onIconChange={changeIcon}></SettingIcon>
      <AboutProduct></AboutProduct>
      <Footer></Footer>
    </ThemeProvider>
  );
}

export default App;
