module.exports = {
  content: ["./views/**/*.{html,ejs}"],
  theme: {
    colors: {
      "slight-gray": "#e4e4e4"
    },
    extend: {
      animation: {
        "bounce-right": "bounce-right 1s ease-in-out",
      },
      fontFamily: {
        "grape-nuts": "Grape Nuts, cursive",
        "montserrat": "Montserrat, sans-serif"
      }
    },
  },
  plugins: [],
}