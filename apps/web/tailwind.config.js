/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17212b',
        muted: '#607080',
        paper: '#f7f9fb',
        line: '#dde5eb',
        navy: '#153f58',
        teal: '#138a83',
        coral: '#ed8068',
        cream: '#fffaf1',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px rgba(23, 33, 43, 0.07)',
      },
    },
  },
  plugins: [],
}
