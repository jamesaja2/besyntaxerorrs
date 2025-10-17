import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, Youtube, Facebook, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { schoolInfo } from '@/data/school';

const footerLinks = {
  "Navigasi": [
    { name: "Beranda", href: "/" },
    { name: "Wawasan", href: "/wawasan" },
    { name: "Ekstrakurikuler", href: "/ekstrakulikuler" },
    { name: "Galeri", href: "/galeri" }
  ],
  "Layanan": [
    { name: "PCPDB", href: "/pcpdb" },
    { name: "Pengumuman", href: "/pengumuman" },
    { name: "FAQ", href: "/faq" },
    { name: "Login", href: "/login" }
  ]
};

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: schoolInfo.socials.instagram,
    color: "hover:text-pink-400"
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: schoolInfo.socials.youtube,
    color: "hover:text-red-400"
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: schoolInfo.socials.facebook,
    color: "hover:text-blue-400"
  }
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-school-surface border-t border-school-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* School Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-school-accent/10 rounded-xl">
                <GraduationCap className="w-8 h-8 text-school-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-school-text">{schoolInfo.name}</h3>
                <p className="text-school-text-muted text-sm">{schoolInfo.tagline}</p>
              </div>
            </div>
            
            <p className="text-school-text-muted mb-6 leading-relaxed">
              {schoolInfo.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-school-accent mt-1 flex-shrink-0" />
                <p className="text-school-text-muted text-sm">
                  {schoolInfo.address}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-school-accent flex-shrink-0" />
                <p className="text-school-text-muted text-sm">
                  {schoolInfo.phone}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-school-accent flex-shrink-0" />
                <a 
                  href={`mailto:${schoolInfo.email}`}
                  className="text-school-text-muted text-sm hover:text-school-accent transition-colors"
                >
                  {schoolInfo.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (categoryIndex + 1) * 0.1 }}
            >
              <h4 className="text-lg font-semibold text-school-text mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-school-text-muted hover:text-school-accent transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 border-t border-school-accent/10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
        >
          {/* Copyright */}
          <div className="text-school-text-muted text-sm text-center sm:text-left">
            <p>© {currentYear} {schoolInfo.name}. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg bg-school-accent/10 text-school-text-muted hover:bg-school-accent/20 ${social.color} transition-all duration-300 hover:scale-110`}
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}