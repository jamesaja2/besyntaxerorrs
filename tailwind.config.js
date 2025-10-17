/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        school: {
          primary: "#FFFFFF", // pristine base
          secondary: "#E8F0FF", // soft powder blue
          accent: "#0056A4", // blue-primary
          "accent-light": "#6AB7FF", // blue-light
          "accent-dark": "#002E63", // navy
          success: "#8CC63F", // green-accent
          warning: "#FCD535", // yellow
          danger: "#E7602B", // orange-deep
          info: "#6AB7FF", // blue-light

          // Tonal gradients
          "gradient-blue": "#E3EEFF",
          "gradient-green": "#E9F7E3",
          "gradient-purple": "#EEF0FF",
          "gradient-orange": "#FFF3E7",

          // Text colors
          text: "#174B96", // floral-blue
          "text-muted": "#5B7BB7",
          "text-light": "#9DB4E6",

          // Border and surface
          border: "#AFC8FF",
          surface: "#F4F8FF",

          // Dashboard specific colors
          sidebar: "#F1F4FF",
          "sidebar-hover": "#DFE8FF",

          // Status colors
          "status-online": "#8CC63F",
          "status-away": "#FCD535",
          "status-busy": "#E7602B",
          "status-offline": "#C7D2FE",

          // Role-based colors
          admin: "#6AB7FF",
          teacher: "#8CC63F",
          student: "#FCD535",
          parent: "#F8C7A0",
          guest: "#C7D2FE",
        },
        brand: {
          bluePrimary: "#0056A4",
          blueLight: "#6AB7FF",
          navy: "#002E63",
          orangeSoft: "#F8C7A0",
          orangeDeep: "#E7602B",
          greenAccent: "#8CC63F",
          yellow: "#FCD535",
          floralBlue: "#174B96",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-up": {
          from: {
            opacity: 0,
            transform: "translateY(24px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          from: {
            opacity: 0,
            transform: "scale(0.9)",
          },
          to: {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'batik-pattern': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.08'%3E%3Cpath d='M50 30c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm0 5c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15z' fill='%230056A4'/%3E%3Cpath d='M25 25h2v2h-2zm0 48h2v2h-2zm48-48h2v2h-2zm0 48h2v2h-2z' fill='%236AB7FF'/%3E%3C/g%3E%3C/svg%3E")`,
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};