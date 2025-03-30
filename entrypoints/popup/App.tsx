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
    const startRequest = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log(tab)

        if (!tab?.id) {
          console.log('No active tab found');
          return;
        }

        setIcon(tab.favIconUrl ?? '#');

        await sendMessage('requestWebsiteIcon', undefined, tab.id);
      } catch (err) {
        console.error('Failed to request website icon:', err);
      }
    }
    startRequest();

    const removeListener = onMessage('getWebsiteIcon', message => {
      console.log('Received website icon:', message.data);
      setIcon(message.data);
    });

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
