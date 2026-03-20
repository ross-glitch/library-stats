// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Inter', 'sans-serif'],
      },
      colors: {
        cpuNavy: '#0F1E3A',
        cpuGold: '#F3B229',
        cpuGoldDark: '#C88D14',
      },
    },
  },
  plugins: [],
};

export default config;
