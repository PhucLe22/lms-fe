import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";

export default function Navbar() {
  const { user, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive(path)
        ? "text-gray-900"
        : "text-gray-500 hover:text-gray-900"
    }`;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav className="bg-white border-b border-gray-200" role="navigation" aria-label="Main navigation">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-base font-semibold text-gray-900 tracking-tight"
            aria-label="LMS Home"
          >
            LMS
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/courses" className={navLinkClass("/courses")}>
                Courses
              </Link>
              {isStudent && (
                <>
                  <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                    Dashboard
                  </Link>
                  <Link to="/my-courses" className={navLinkClass("/my-courses")}>
                    My Courses
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/courses/new" className={navLinkClass("/courses/new")}>
                    Create Course
                  </Link>
                  <Link to="/admin/students" className={navLinkClass("/admin/students")}>
                    Students
                  </Link>
                  <Link to="/admin/system" className={navLinkClass("/admin/system")}>
                    System
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium" aria-hidden="true">
                  {initials}
                </div>
                <span className="text-sm text-gray-600">{user.fullName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
                Log out
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-100 px-6 py-3 space-y-1 bg-white">
          <div className="flex items-center gap-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
              {initials}
            </div>
            <span className="text-sm text-gray-600">{user.fullName}</span>
          </div>
          <Link to="/courses" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">
            Courses
          </Link>
          {isStudent && (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/my-courses" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                My Courses
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/courses/new" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                Create Course
              </Link>
              <Link to="/admin/students" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                Students
              </Link>
              <Link to="/admin/system" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                System
              </Link>
            </>
          )}
          <button
            onClick={() => { setMobileOpen(false); handleLogout(); }}
            className="block w-full text-left py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
