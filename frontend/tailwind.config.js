/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        'dvh': '90dvh',
      },
      maxHeight: {
        'dvh': '90dvh',
      },
    },
  },
  plugins: [],
};
