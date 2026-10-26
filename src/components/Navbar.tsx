import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onLoginClick: () => void;
  onAdminClick?: () => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Team", href: "#team" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onLoginClick, onAdminClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.querySelector(item.href)).filter(
      (el): el is Element => !!el
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <motion.nav
          animate={{
            backgroundColor: scrolled ? "rgba(11,19,32,0.92)" : "rgba(11,19,32,0.72)",
            borderColor: scrolled ? "rgba(245,199,107,0.28)" : "rgba(255,255,255,0.12)",
            paddingTop: scrolled ? 10 : 14,
            paddingBottom: scrolled ? 10 : 14,
            backdropFilter: scrolled ? "blur(14px)" : "blur(10px)",
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full max-w-[1180px] items-center justify-between rounded-[30px] border px-5 text-cream shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
          style={{ backdropFilter: scrolled ? "blur(14px)" : "blur(10px)" }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo height={scrolled ? 42 : 52} className="transition-all duration-500" />
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-[#f1d29a] sm:inline">
              CSE (AI &amp; DS)
            </span>
          </div>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="relative">
                <a
                  href={item.href}
                  className="text-sm font-medium tracking-wide text-cream/90 transition-colors hover:text-gold"
                >
                  {item.label}
                </a>
                {active === item.href && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-terracotta"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {role === "admin" && (
                  <button
                    type="button"
                    onClick={onAdminClick}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold transition-colors hover:bg-gold hover:text-espresso"
                  >
                    <ShieldCheck size={14} />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </button>
                )}

                <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-brown/50 px-3 py-1.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-terracotta/20 text-xs font-semibold text-terracotta">
                      {role === "admin" ? <ShieldCheck size={14} /> : <User size={14} />}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate text-xs font-medium text-cream sm:max-w-[130px]">
                    {profile?.displayName || user.displayName || user.email?.split("@")[0]}
                  </span>
                  {role === "admin" && (
                    <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign out"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-beige/20 text-beige/70 transition-colors hover:border-terracotta hover:bg-terracotta/10 hover:text-terracotta"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-espresso sm:px-5 sm:text-sm"
              >
                <LogIn size={16} />
                Login
              </button>
            )}
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="text-cream md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </motion.nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-espresso px-6"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-3xl text-cream"
              >
                {item.label}
              </motion.a>
            ))}

            {user && role === "admin" && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onAdminClick?.();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/20 px-6 py-2.5 text-base font-semibold text-gold"
              >
                <ShieldCheck size={18} /> Admin Control Panel
              </button>
            )}

            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="rounded-full border border-terracotta/60 px-6 py-2.5 text-base font-semibold text-terracotta"
              >
                Sign out ({user.displayName || user.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLoginClick();
                }}
                className="rounded-full border border-gold/60 px-6 py-2.5 text-base font-semibold text-gold"
              >
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
