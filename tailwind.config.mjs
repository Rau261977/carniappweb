/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
      colors: {
        primary: '#ffca00',
        'primary-dark': '#e6b800',
        secondary: '#ff6b6b',
        dark: '#333333',
      },
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '10xl': '10rem',
        '11xl': '11rem',
        '12xl': '12rem',
      }
    },
	},
	plugins: [],
}
