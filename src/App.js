import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/Navbar';
import TodoApp from './components/TodoApp';
import Calendar from './components/Calendar';
import Projects from './components/Projects';
import Settings from './components/Settings';
import { TaskProvider } from './contexts/TaskContext';
import { ThemeProvider } from './contexts/ThemeContext';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <ClerkProvider publishableKey={clerkPubKey}>
          <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<TodoApp />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
              <Toaster />
            </div>
          </Router>
        </ClerkProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
