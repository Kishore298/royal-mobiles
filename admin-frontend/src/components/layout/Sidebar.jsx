import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  ChevronLeft,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Categories', path: '/categories' },
    { icon: Boxes, label: 'Subcategories', path: '/subcategories' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' }
  ];

  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Mobile Sidebar (Fixed 20%) */}
      <aside className="fixed top-0 left-0 h-full w-[20%] bg-white border-r border-gray-200 z-50 md:hidden flex flex-col items-center py-4">
        {/* Mobile Logo */}
        <div className="mb-6 flex justify-center w-full px-1 py-1 border-b border-gray-200">
           <img
             src="/royal-logo.png"
             alt="Admin"
             className="h-14 w-auto object-contain"
           />
        </div>

        {/* Mobile Menu */}
        <nav className="flex-1 w-full space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex flex-col items-center justify-center py-3 space-y-1 ${location.pathname === item.path ? 'text-green-600' : 'text-gray-500'
                }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] text-center leading-none px-1 truncate w-full">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Mobile Logout */}
        <div className="w-full border-t border-gray-200 pt-2 mt-auto">
             <button
              onClick={handleLogout}
              className="w-full flex flex-col items-center justify-center py-3 space-y-1 text-red-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] text-center leading-none">Logout</span>
            </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40
        ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${isCollapsed ? 'h-16' : 'h-28'}`}>
          {!isCollapsed && (
            <div className="flex items-center">
              <img
                src="/royal-logo.png"
                alt="Admin"
                className="h-24 w-auto object-contain"
              />
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className={`p-1.5 rounded-lg hover:bg-gray-100 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''
              }`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${isActive
                        ? 'bg-green-50 text-green-600'
                        : 'text-gray-600 hover:bg-gray-50'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''
              }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 text-red-500" />
            {!isCollapsed && (
              <span className="ml-3 text-sm font-medium text-red-500">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;