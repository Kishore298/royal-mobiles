import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search accessories, cases, chargers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-colors"
        />
        <button
          type="submit"
          className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-primary-600 dark:hover:text-emerald-400 transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;