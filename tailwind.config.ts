import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        soil: '#3B2F2F',
        clay: '#A0522D',
        'clay-light': '#C4845A',
        bark: '#6B4F3A',
        sand: '#F5F0E8',
        linen: '#EDE7DA',
        stone: '#D4C9B8',
        moss: '#5A7A52',
        rust: '#B85C38',
        wheat: '#C8A96E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        content: '1080px',
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
    },
  },
  plugins: [],
}
export default config
