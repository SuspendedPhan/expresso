const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      padding: ({theme}) => {
        return {
          "window": theme("spacing.8"),
        };
      }
    },
  },

  plugins: [
    require("daisyui"),
    // plugin(({ addUtilities, theme }) => {
    //   addUtilities({
    //     ".p-window": {
    //       padding: theme("spacing.8"),
    //     },
    //   });
    // }),
  ],
};
