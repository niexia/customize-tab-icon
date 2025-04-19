import { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { IconDisplay } from '@/components/icon-display';
import { SettingIcon } from '@/components/setting-icon';
import { AboutProduct } from '@/components/about-product';
import { Footer } from '@/components/footer';
import { sendMessage } from '@/lib/messaging';
import { changiconLocal } from '@/lib/store';
import { log } from '@/lib/utils';

function App() {
  const [icon, setIcon] = useState('');
  const [tab, setTab] = useState({} as chrome.tabs.Tab);
  const [parsedUrl, setParsedUrl] = useState({} as URL)

  useEffect(() => {
    const getTabIcon = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url) {
        log('log', 'No active tab found or invalid URL');
        return;
      }
      setTab(tab);
      setParsedUrl(new URL(tab.url))
      const { host, pathname } = parsedUrl;
      const storedIcons = await changiconLocal.getValue();
      const storeIcon = storedIcons[host]?.[pathname];
      if (storeIcon) {
        setIcon(storeIcon.customIcon);
      }
    }
    getTabIcon();
  }, []);

  const changeIcon = async (val?: string) => {
    if (!val || !tab?.id || !tab.url) {
      log('log', 'No valid icon to set or invalid tab');
      return;
    }

    try {
      const { host, pathname } = parsedUrl;
      const storedIcons = await changiconLocal.getValue();

      await changiconLocal.setValue({
        ...storedIcons,
        [host]: {
          ...storedIcons[host],
          [pathname]: {
            customIcon: val
          }
        }
      });

      await sendMessage('setWebsiteIcon', val, tab.id);
      setIcon(val);
    } catch (error) {
      log('error', 'Failed to update icon:', error);
    }
  };

  const resetIcon = async () => {
    if (!tab?.id || !tab.url) {
      log('log', 'No valid tab to reset icon');
      return;
    }

    try {
      const { host, pathname } = parsedUrl;
      const storedIcons = await changiconLocal.getValue();
      
      await changiconLocal.setValue({
        ...storedIcons,
        [host]: {
          ...storedIcons[host],
          [pathname]: {
            customIcon: ''
          }
        }
      });
      
      await chrome.tabs.reload(tab.id);
      setIcon(tab.favIconUrl ?? '');
    } catch (error) {
      log('error', 'Failed to reset icon:', error);
    }
  };

  return (
    <ThemeProvider defaultTheme='dark'>
      <Header />
      <IconDisplay icon={icon} onReset={resetIcon}></IconDisplay>
      <SettingIcon onIconChange={changeIcon}></SettingIcon>
      {/* <AboutProduct></AboutProduct> */}
      <Footer></Footer>
    </ThemeProvider>
  );
}

export default App;
