/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react"

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                akane: {
                    50: '#fdf2f2',
                    100: '#fbe8e8',
                    200: '#f6d5d5',
                    300: '#efb8b8',
                    400: '#e48888',
                    500: '#B3424A',
                    600: '#9e2b1f',
                    700: '#852318',
                    800: '#6f2118',
                    900: '#5e2019',
                },
                washi: '#fdfaf5',
                sumi: '#121212',
                gold: '#d4af37',
            },
            backgroundImage: {
                'washi-paper': "url('/washi_paper.avif')",
            },
            borderRadius: {
                'wa': '16px',
                'wa-sm': '8px',
                'wa-lg': '24px',
            },
        },
    },
    darkMode: "class",
    plugins: [heroui({
        themes: {
            light: {
                colors: {
                    primary: {
                        DEFAULT: "#B3424A",
                        foreground: "#FFFFFF",
                    },
                    secondary: {
                        DEFAULT: "#9e2b1f",
                        foreground: "#FFFFFF",
                    },
                },
            },
        },
    })],
}
