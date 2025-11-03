import React from 'react';
import { Menu } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
import { User } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-4">
          <NotificationDropdown />
          
          {/* Profile dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 