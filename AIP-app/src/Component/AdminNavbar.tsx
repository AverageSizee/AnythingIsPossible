import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AdminNavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function AdminNavbar({ isSidebarOpen, setIsSidebarOpen }: AdminNavbarProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="border-b border-neutral-800 sticky top-0 z-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="hover:text-neutral-400 transition text-white"
            >
              <Menu size={24} />
            </button>
            <div className="text-2xl font-bold tracking-wider text-white">AIP</div>
          </div>

          <div className="text-2xl font-bold tracking-wider text-white">ADMIN</div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-neutral-300 hidden md:block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-black border-r border-neutral-800 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="text-xl font-bold text-white">Admin Menu</h2>
            <button
              onClick={toggleSidebar}
              className="text-neutral-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/admin/dashboard"
                  className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition"
                  onClick={toggleSidebar}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/add-product"
                  className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition"
                  onClick={toggleSidebar}
                >
                  Add Product
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/hp-settings"
                  className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition"
                  onClick={toggleSidebar}
                >
                  HP Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default AdminNavbar;
