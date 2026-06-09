import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary":                    "#003d9b",
        "on-primary":                 "#ffffff",
        "primary-container":          "#0052cc",
        "on-primary-container":       "#c4d2ff",
        "primary-fixed":              "#dae2ff",
        "primary-fixed-dim":          "#b2c5ff",
        "secondary":                  "#006c49",
        "on-secondary":               "#ffffff",
        "secondary-container":        "#6cf8bb",
        "on-secondary-container":     "#00714d",
        "secondary-on":               "#00714d",
        "surface":                    "#f9f9ff",
        "surface-low":                "#f0f3ff",
        "surface-base":               "#e7eefe",
        "surface-high":               "#e2e8f8",
        "surface-highest":            "#dce2f3",
        "surface-container-low":      "#f0f3ff",
        "surface-container":          "#e7eefe",
        "surface-container-high":     "#e2e8f8",
        "surface-container-highest":  "#dce2f3",
        "surface-container-lowest":   "#ffffff",
        "on-surface":                 "#151c27",
        "on-surface-variant":         "#434654",
        "background":                 "#f9f9ff",
        "on-background":              "#151c27",
        "outline":                    "#737685",
        "outline-variant":            "#c3c6d6",
        "ds-error":                   "#ba1a1a",
        "ds-error-container":         "#ffdad6",
        "error-container":            "#ffdad6",
        "on-error-container":         "#93000a",
        "inverse-surface":            "#2a313d",
        "inverse-on-surface":         "#ebf1ff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      boxShadow: {
        card:         "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.07)",
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        'card-in': {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.7s ease-out both',
        'fade-in':        'fade-in 0.5s ease-out both',
        'float':          'float 5s ease-in-out infinite',
        'float-delayed':  'float 5s ease-in-out 1.8s infinite',
        'float-slow':     'float 7s ease-in-out infinite',
        'card-in':        'card-in 0.45s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
