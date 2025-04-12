import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { TodoList } from './components/TodoList';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, Moon, Sun } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <Toaster position="top-right" />
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TaskMaster</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <Sun className="text-gray-900 dark:text-white" size={24} />
                ) : (
                  <Moon className="text-gray-900 dark:text-white" size={24} />
                )}
              </button>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {user ? (
          <TodoList />
        ) : (
          <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <AuthForm type="login" />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;