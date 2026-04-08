import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f1ea",
        panel: "#fcfbf8",
        ink: "#18212b",
        muted: "#667085",
        line: "#ded7cb",
        brand: {
          50: "#eef4f2",
          100: "#dceae5",
          500: "#275d52",
          600: "#1f4a42",
          700: "#173833"
        },
        accent: {
          50: "#f7f2e8",
          100: "#efe2bf",
          500: "#9c7a2b"
        },
        danger: "#b84747"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(24, 33, 43, 0.08)",
        panel: "0 10px 24px rgba(24, 33, 43, 0.06)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      fontFamily: {
        sans: ["Segoe UI", "Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "Cambria", "Times New Roman", "serif"]
      },
      backgroundImage: {
        "mesh-fade":
          "radial-gradient(circle at top left, rgba(39,93,82,0.14), transparent 36%), radial-gradient(circle at top right, rgba(156,122,43,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(252,251,248,0.92))"
      }
    }
  },
  plugins: []
};

export default config;
