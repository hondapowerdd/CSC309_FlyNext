module.exports = {
    content: [// Limit Tailwind to relevant files
        "./components/**/*.{js,ts,jsx,tsx}",
        './node_modules/react-date-range/dist/**/*.js'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: false, // Disable global resets for date picker
    },
};
