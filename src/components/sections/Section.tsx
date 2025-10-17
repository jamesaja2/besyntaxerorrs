import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: 'default' | 'dark' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

export function Section({
  children,
  className,
  id,
  variant = 'default',
  size = 'md',
}: SectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variantStyles = {
    default: 'bg-white',
    dark: 'bg-school-surface',
    accent: 'bg-gradient-to-br from-white via-school-secondary to-school-surface',
  };

  const sizeStyles = {
    sm: 'py-12 lg:py-16',
    md: 'py-16 lg:py-24',
    lg: 'py-20 lg:py-32',
  };

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
      className={cn(
        'relative overflow-hidden',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </motion.section>
  );
}

export const SectionHeader = motion.div;
export const SectionTitle = motion.h2;
export const SectionDescription = motion.p;

SectionHeader.defaultProps = {
  className: "text-center mb-12 lg:mb-16",
  variants: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
};

SectionTitle.defaultProps = {
  className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-school-text mb-4",
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.1, ease: "easeOut" },
    },
  },
};

SectionDescription.defaultProps = {
  className: "text-lg text-school-text-muted max-w-3xl mx-auto",
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" },
    },
  },
};