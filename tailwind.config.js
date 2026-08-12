/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // TokTown 파스텔 팔레트 (동물의숲 감성)
        town: {
          cream: '#FDF6E9',
          paper: '#FFFDF7',
          leaf: '#7BC47F',
          leafDark: '#4E9B58',
          grass: '#A8D98A',
          sky: '#8ED1E1',
          skyDeep: '#5EB3CC',
          coral: '#FF8B7B',
          coralDeep: '#F2705E',
          sun: '#FFD66B',
          sunDeep: '#F5B942',
          bark: '#8A6B52',
          ink: '#4A3B32',
          inkSoft: '#8C7B6E',
          line: '#EFE3CE',
          pink: '#FFB7C5',
          lilac: '#C7B9F2',
        },
      },
      fontFamily: {
        town: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Pretendard"',
          '"Noto Sans KR"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        pop: '0 4px 0 rgba(74, 59, 50, 0.14)',
        card: '0 6px 18px rgba(74, 59, 50, 0.12)',
        sheet: '0 -8px 30px rgba(74, 59, 50, 0.18)',
      },
      borderRadius: {
        blob: '1.4rem',
      },
    },
  },
  plugins: [],
};
