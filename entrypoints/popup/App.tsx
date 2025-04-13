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

        const host = new URL(tab.url).host;
        const storedIcons = await changiconLocal.getValue();
        const storedIcon = storedIcons[host];
        
        // 如果有存储的自定义图标，使用它
        if (storedIcon?.customIcon) {
          setIcon(storedIcon.customIcon);
        } else {
          // 否则使用默认图标
          setIcon(tab.favIconUrl ?? '');
          // 存储默认图标信息
          await changiconLocal.setValue({
            ...storedIcons,
            [host]: {
              pageHost: host,
              defaultIcon: tab.favIconUrl ?? '',
            }
          });
        }

        setTab(tab);
        await sendMessage('requestWebsiteIcon', undefined, tab.id);
      } catch (err) {
        console.error('Failed to request website icon:', err);
      }
    }
    startRequest();

    const removeListener = onMessage('getWebsiteIcon', async message => {
      console.log('Received website icon:', message.data);
      if (!tab.url) return;

      const host = new URL(tab.url).host;
      const storedIcons = await changiconLocal.getValue();
      
      // 更新存储的图标信息
      await changiconLocal.setValue({
        ...storedIcons,
        [host]: {
          ...storedIcons[host],
          customIcon: message.data
        }
      });
      
      setIcon(message.data);
    });

    return () => removeListener();
  }, []);

  const changeIcon = async (val?: string) => {
    if (!val || !tab.url) {
      console.log('No valid icon to reset to or invalid URL');
      return;
    }

    const host = new URL(tab.url).host;
    const storedIcons = await changiconLocal.getValue();
    
    // 更新存储的图标信息
    await changiconLocal.setValue({
      ...storedIcons,
      [host]: {
        ...storedIcons[host],
        customIcon: val
      }
    });

    console.log('Sending command to change icon:', val);
    sendMessage('setWebsiteIcon', val);
    setIcon(val);
  };

  const resetIcon = async () => {
    if (!tab.url) {
      console.log('Invalid URL');
      return;
    }

    const host = new URL(tab.url).host;
    const storedIcons = await changiconLocal.getValue();
    const defaultIcon = storedIcons[host]?.defaultIcon;

    if (defaultIcon) {
      // 移除自定义图标
      await changiconLocal.setValue({
        ...storedIcons,
        [host]: {
          pageHost: host,
          defaultIcon
        }
      });

      console.log('Resetting to default icon:', defaultIcon);
      sendMessage('setWebsiteIcon', defaultIcon);
      setIcon(defaultIcon);
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
