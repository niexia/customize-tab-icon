import { useState } from 'react';
import './App.css';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider defaultTheme='dark' storageKey='changicon-theme'>
      <Header />
    </ThemeProvider>
  );
}

export default App;
