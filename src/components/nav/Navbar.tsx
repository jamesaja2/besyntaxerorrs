import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { schoolInfo } from '@/data/school';

const navItems = [
  { name: 'Beranda', href: '/' },
  { name: 'Ekstrakulikuler', href: '/ekstrakulikuler' },
  { name: 'Galeri', href: '/galeri' },
  { name: 'Wawasan', href: '/wawasan' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Verifikasi', href: '/verify-document' }
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border border-school-border navbar-floating' 
          : 'bg-white border-b border-school-border'
      }`}
    >
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${isScrolled ? 'py-3' : ''}`}>
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-school-accent/10 rounded-xl group-hover:bg-school-accent/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="https://smakstlouis1sby.sch.id/storage/2019/08/Logo-512-01.png"
                  alt="SMA St. Louis 1 Logo"
                  loading="eager"
                  decoding="async"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold text-school-text leading-tight">
                {schoolInfo.shortName}
              </p>
              <p className="text-xs text-school-text-muted">
                {schoolInfo.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Main Navigation Items */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-sm font-medium transition-colors duration-200 hover:text-school-accent ${
                  isActive(item.href) 
                    ? 'text-school-accent' 
                    : 'text-school-text'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-school-accent rounded-full"
                  />
                )}
              </Link>
            ))}

            {/* PCPDB Button */}
            <Link to="/pcpdb">
              <Button 
                variant="outline" 
                size="sm"
                className={`border-school-accent text-school-accent hover:bg-school-accent hover:text-white transition-colors ${
                  isActive('/pcpdb') ? 'bg-school-accent text-white' : ''
                }`}
              >
                PCPDB
              </Button>
            </Link>

            {/* Notification Icon */}
            <Link to="/pengumuman">
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-school-accent hover:bg-school-accent/10 ${
                  isActive('/pengumuman') ? 'bg-school-accent/10' : ''
                }`}
              >
                <Bell className="w-5 h-5" />
              </Button>
            </Link>

            {/* Login Button */}
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm"
                className={`border-school-accent text-school-accent hover:bg-school-accent hover:text-white transition-colors ${
                  isActive('/login') ? 'bg-school-accent text-white' : ''
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-school-text">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-school-border">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="text-center pb-4 border-b border-school-border">
                  <p className="text-lg font-bold text-school-text">{schoolInfo.shortName}</p>
                  <p className="text-sm text-school-text-muted">{schoolInfo.tagline}</p>
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                        isActive(item.href) 
                          ? 'text-school-accent bg-school-accent/10' 
                          : 'text-school-text hover:text-school-accent hover:bg-school-accent/5'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile Action Buttons */}
                <div className="border-t border-school-border pt-4 space-y-3">
                  <Link
                    to="/pcpdb"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-school-accent text-school-accent hover:bg-school-accent hover:text-white"
                    >
                      PCPDB
                    </Button>
                  </Link>
                  
                  <Link
                    to="/pengumuman"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-school-accent text-school-accent hover:bg-school-accent hover:text-white"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notifikasi
                    </Button>
                  </Link>
                  
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-school-accent text-school-accent hover:bg-school-accent hover:text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
