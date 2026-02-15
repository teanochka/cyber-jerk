/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/components/**/*.{js,vue,ts}",
        "./app/layouts/**/*.vue",
        "./app/pages/**/*.vue",
        "./app/plugins/**/*.{js,ts}",
        "./app/app.vue",
        "./app/error.vue",
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