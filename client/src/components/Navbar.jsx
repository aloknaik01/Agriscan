import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Leaf, LogOut, LayoutDashboard, Crown } from "lucide-react";
import { isAuthenticated, auth } from "@/lib/api";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/problems", label: "Solutions" },
];

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Recheck auth on route change
  useEffect(() => {
    const loggedIn = isAuthenticated();
    setAuthed(loggedIn);
    if (loggedIn) {
      // Decode JWT to check role without extra API call
      try {
        const token = localStorage.getItem("agriscan_token");
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload?.role === "ADMIN" || payload?.authorities?.includes("ROLE_ADMIN"));
      } catch { setIsAdmin(false); }
    } else {
      setIsAdmin(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await auth.logout();
    setAuthed(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
            <Leaf className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-heading font-semibold tracking-tight text-foreground">
            AgriScan
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] font-medium tracking-wide uppercase underline-grow transition-colors ${
                location.pathname === link.to ? "text-primary" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {authed ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-foreground/70 hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-red-500 hover:text-red-600"
                >
                  <Crown className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-foreground/70 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-medium tracking-wide text-foreground/70 hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/get-started"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-[13px] font-medium tracking-wide hover:bg-primary/90 transition-all hover:shadow-card"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border mt-3 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-foreground/80 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {authed ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-foreground/80 hover:text-primary"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-sm font-medium text-foreground/80 hover:text-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-foreground/80 hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                to="/get-started"
                onClick={() => setOpen(false)}
                className="block bg-primary text-primary-foreground px-5 py-3 rounded-full text-sm font-medium text-center"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
