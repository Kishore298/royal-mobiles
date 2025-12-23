import React from 'react';
import { Menu } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
import { User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm h-20">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Royal Mobiles Branding at Start */}
        <h1 className="text-xl font-bold text-green-600 whitespace-nowrap">Royal Mobiles</h1>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="transform scale-125">
            <NotificationDropdown />
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 focus:outline-none">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-7 w-7 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 