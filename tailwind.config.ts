import type { Config } from "tailwindcss";
export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ak: { bg:"#050607", panel:"#0C0F10", neon:"#00FF88", neon2:"#00D1B2", text:"#E6F5EE", sub:"#7AE0B8" } },
      boxShadow: { neon: "0 0 18px rgba(0,255,136,0.35), 0 0 40px rgba(0,255,136,0.12)" },
      fontFamily: { display: ["Inter","system-ui","sans-serif"] },
      keyframes: {
        scrollX: { "0%":{ transform:"translateX(100%)" }, "100%":{ transform:"translateX(-100%)" } },
        float: { "0%,100%":{ transform:"translateY(0)" }, "50%":{ transform:"translateY(-6px)" } },
        scrollY: { "0%": { transform:"translateY(100%)" }, "100%": { transform:"translateY(-100%)" } }
      },
      animation: { scrollX: "scrollX 18s linear infinite", float: "float 6s ease-in-out infinite", scrollY: "scrollY 18s linear infinite" }
    }
  },
  plugins: []
} satisfies Config;
