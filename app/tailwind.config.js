import { nextui } from '@nextui-org/react';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'selector',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            secondary: {
              DEFAULT: colors.stone['500'],
              foreground: '#fff',
            },
          },
        },
      },
    }),
  ],
};
