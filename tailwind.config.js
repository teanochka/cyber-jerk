/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#218DA9',
                    hover: '#1a7087',
                    focus: '#145668',
                },
                background: {
                    light: '#ffffff',
                    dark: '#111827', // gray-900
                }
            },
        },
    },
    plugins: [],
}