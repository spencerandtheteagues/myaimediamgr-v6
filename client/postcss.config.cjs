const path = require("path");

module.exports = {
  plugins: {
    // use an ABSOLUTE path so it works no matter the CWD during the build
    tailwindcss: { config: path.resolve(__dirname, "tailwind.config.cjs") },
    autoprefixer: {},
  },
};
