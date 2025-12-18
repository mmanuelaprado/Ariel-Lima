
import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';

const App: React.FC = () => {
  // Estado para controlar a rota atual baseada no hash (#home ou #admin)
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash;
    return (hash === '#admin') ? '#admin' : '#home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash;
      setRoute(newHash === '#admin' ? '#admin' : '#home');
      window.scrollTo(0, 0);
    };
    
    // Escuta mudanças na URL (ex: quando o usuário clica em botões que mudam o hash)
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen bg-pink-50/20 font-sans">
        {route === '#admin' ? (
          <AdminDashboard />
        ) : (
          <Home />
        )}
      </div>
    </AppProvider>
  );
};

export default App;
