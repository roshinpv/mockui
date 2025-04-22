import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Server, 
  Home, 
  GitBranch, 
  Clock, 
  Upload, 
  Settings as SettingsIcon,
  Menu,
  X,
  Code,
  FileJson,
  Disc
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'REST Stubs', path: '/stubs', icon: <Server size={20} /> },
    { name: 'GraphQL Stubs', path: '/graphql-stubs', icon: <Code size={20} /> },
    { name: 'SOAP Stubs', path: '/soap-stubs', icon: <FileJson size={20} /> },
    { name: 'Scenarios', path: '/scenarios', icon: <GitBranch size={20} /> },
    { name: 'Request Journal', path: '/requests', icon: <Clock size={20} /> },
    { name: 'Record & Playback', path: '/recording', icon: <Disc size={20} /> },
    { name: 'Import/Export', path: '/import-export', icon: <Upload size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none" 
                onClick={toggleSidebar}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="ml-2 md:ml-0 flex items-center">
                <Server className="h-8 w-8 text-brand-500" />
                <span className="ml-2 text-xl font-semibold text-brand-500">WireMock UI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile */}
        <div className={`md:hidden fixed inset-0 z-40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={toggleSidebar}></div>
          <nav className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="px-2 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-brand-50 text-brand-500'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <nav className="bg-white shadow-sm h-full px-2 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-brand-50 text-brand-500'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;