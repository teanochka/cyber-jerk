/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/components/**/*.{js,vue,ts}",
        "./app/layouts/**/*.vue",
        "./app/pages/**/*.vue",
        "./app/plugins/**/*.{js,ts}",
        "./app/app.vue",
        "./app/error.vue",
        "./app/assets/components/**/*.{js,vue,ts}",
    ],
    theme: {
        extend: {
            colors: {
                "smoky-black": "#11120D",
                "olive-drab": "#565449",
                "bone": "#D8CFBC",
                "floral-white": "#FFFBF4",
            },
            animation: {
                "pulsate-1": "pulsate1 2s forwards",
                "fadeIn": 'fadeIn 0.3s ease-out',
                "fadeOut": 'fadeOut 0.3s ease-in',
            },
            keyframes: {
                pulsate1: {
                    "0%": {
                        transform: "scale(0.6)",
                        opacity: 1,
                        boxShadow:
                            "inset 0 0 200px 3px rgba(255, 255, 255, 0.75), 0 0 200px 10px rgba(255, 255, 255, 0.75)",
                    },
                    "100%": {
                        transform: "scale(1)",
                        opacity: 0,
                        boxShadow: "none",
                    },
                },
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeOut: {
                    "0%": { opacity: "1", transform: "translateY(0)" },
                    "100%": { opacity: "0", transform: "translateY(10px)" },
                },
            },
            fontFamily: {
                lora: ["Lora", "sans-serif"],
            },
            screens: {
                xs: "376px",
                sm: "576px",
                lg: "960px",
                xl: "1200px",
                "1.5xl": "1600px",
                "2xl": "1920px",
            },
        },
    },
    plugins: [],
};