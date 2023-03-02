/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
        fontFamily: {
            roboto: ["Roboto"],
            roboto_italic: ["Roboto italic"],
            roboto_bold: ["Roboto Bold"],
        },
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
