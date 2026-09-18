import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

const navLinks = [
  { to: "/work", label: "WORK" },
  { to: "/blog", label: "BLOG" },
  { to: "/about", label: "ABOUT" },
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `font-mono text-sm tracking-wide transition-colors duration-150 ${
    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <Container as="nav" aria-label="Primary" className="flex h-16 items-center justify-between">
        <NavLink
          to="/"
          className="font-mono text-lg font-semibold tracking-wide text-foreground"
          onClick={() => setIsOpen(false)}
        >
          GK
        </NavLink>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClasses}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="secondary" href="#contact" className="!px-4 !py-2 !text-xs">
            CONTACT
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-foreground md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </Container>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="overflow-hidden border-b border-border bg-background/95 md:hidden"
          >
            <Container as="ul" className="flex flex-col gap-4 py-5">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={linkClasses} onClick={() => setIsOpen(false)}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li className="flex items-center justify-between">
                <span className="font-mono text-sm tracking-wide text-muted-foreground">THEME</span>
                <ThemeToggle />
              </li>
              <li>
                <Button
                  variant="secondary"
                  href="#contact"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  CONTACT
                </Button>
              </li>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
