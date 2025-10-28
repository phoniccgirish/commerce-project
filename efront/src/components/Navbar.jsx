import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, ShoppingCart, Home, User, Store } from "lucide-react";

const Navbar = () => {
  const { user, logoutAction } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Modern professional color palette
  const colors = {
    primary: "bg-[#0F172A]", // dark navy background
    accent: "text-[#38BDF8]", // cyan accent
    hover: "hover:bg-[#1E293B]", // dark slate hover
    text: "text-gray-200",
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#1E293B] text-white shadow-sm"
        : `${colors.text} hover:text-white ${colors.hover}`
    }`;

  return (
    <nav className={`${colors.primary} shadow-md sticky top-0 z-50`}>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
        {/* Logo */}
        <Link
          to='/'
          className='text-2xl font-bold text-white tracking-tight flex items-center gap-1'
        >
          Exoticc
          <span className='text-[#38BDF8]'>.</span>
        </Link>

        {/* Desktop Links */}
        <div className='hidden md:flex items-center space-x-4'>
          <NavLink to='/' className={navLinkClass} end>
            <Home size={16} />
            Home
          </NavLink>

          <NavLink to='/shop' className={navLinkClass}>
            <Store size={16} />
            Shop
          </NavLink>

          <NavLink to='/cart' className={navLinkClass}>
            <ShoppingCart size={16} />
            Cart
          </NavLink>

          {user ? (
            <>
              {user.role === "Seller" ? (
                <NavLink to='/seller/dashboard' className={navLinkClass}>
                  <Store size={16} />
                  Dashboard
                </NavLink>
              ) : (
                <>
                  <NavLink to='/orders' className={navLinkClass}>
                    <ShoppingCart size={16} />
                    Orders
                  </NavLink>
                  <NavLink to='/profile' className={navLinkClass}>
                    <User size={16} />
                    Profile
                  </NavLink>
                </>
              )}

              <span className='text-gray-300 font-medium ml-2 hidden lg:inline'>
                Hi, {user.name || user.storeName}
              </span>

              <button
                onClick={logoutAction}
                className='ml-3 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-md text-sm font-semibold transition'
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to='/login'
              className='bg-[#38BDF8] text-white hover:bg-[#0EA5E9] px-4 py-1.5 rounded-md font-semibold text-sm transition'
            >
              Login
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className='md:hidden text-white focus:outline-none'
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className='md:hidden bg-[#1E293B] border-t border-gray-700'>
          <div className='flex flex-col p-3 space-y-1'>
            <NavLink
              to='/'
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
              end
            >
              <Home size={16} />
              Home
            </NavLink>
            <NavLink
              to='/shop'
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
            >
              <Store size={16} />
              Shop
            </NavLink>
            <NavLink
              to='/cart'
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
            >
              <ShoppingCart size={16} />
              Cart
            </NavLink>

            {user ? (
              <>
                {user.role === "Seller" ? (
                  <NavLink
                    to='/seller/dashboard'
                    onClick={() => setMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <Store size={16} />
                    Dashboard
                  </NavLink>
                ) : (
                  <>
                    <NavLink
                      to='/orders'
                      onClick={() => setMenuOpen(false)}
                      className={navLinkClass}
                    >
                      <ShoppingCart size={16} />
                      Orders
                    </NavLink>
                    <NavLink
                      to='/profile'
                      onClick={() => setMenuOpen(false)}
                      className={navLinkClass}
                    >
                      <User size={16} />
                      Profile
                    </NavLink>
                  </>
                )}

                <button
                  onClick={() => {
                    logoutAction();
                    setMenuOpen(false);
                  }}
                  className='w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-1.5 rounded-md font-semibold mt-2'
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to='/login'
                onClick={() => setMenuOpen(false)}
                className='bg-[#38BDF8] text-white hover:bg-[#0EA5E9] px-4 py-1.5 rounded-md font-semibold text-sm transition text-center'
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
