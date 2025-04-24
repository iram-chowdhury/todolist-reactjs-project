import { Link, useLocation } from 'react-router-dom';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from './ui/button';
import { Calendar, ListTodo, FolderKanban, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              AI Todo
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/">
                <Button
                  variant={isActive('/') ? 'default' : 'ghost'}
                >
                  Tasks
                </Button>
              </Link>
              <Link to="/calendar">
                <Button
                  variant={isActive('/calendar') ? 'default' : 'ghost'}
                >
                  Calendar
                </Button>
              </Link>
              <Link to="/projects">
                <Button
                  variant={isActive('/projects') ? 'default' : 'ghost'}
                >
                  Projects
                </Button>
              </Link>
              <Link to="/settings">
                <Button
                  variant={isActive('/settings') ? 'default' : 'ghost'}
                >
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoaded && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {user.publicMetadata?.isPremium && (
                      <span className="text-sm text-primary">
                        Premium
                      </span>
                    )}
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button>Sign In</Button>
                  </SignInButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 