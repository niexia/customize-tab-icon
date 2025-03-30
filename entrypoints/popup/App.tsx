import { useState } from 'react';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { IconDisplay } from '@/components/icon-display';
import { SettingIcon } from '@/components/setting-icon';
import { AboutProduct } from '@/components/about-product';
import { Footer } from '@/components/footer';

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider defaultTheme='dark' storageKey='changicon-theme'>
      <Header />
      <IconDisplay></IconDisplay>
      <SettingIcon></SettingIcon>
      <AboutProduct></AboutProduct>
      <Footer></Footer>
    </ThemeProvider>
  );
}

export default App;
