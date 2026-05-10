/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: "#F8F6F0",
                parchment: "#F0EDE4",
                card: "#FFFFFF",
                navy: "#1E2A4A",
                "navy-light": "#2D3F6B",
                gold: "#C8963E",
                "gold-light": "#E8B86D",
                "gold-pale": "#FDF3E0",
                ink: "#1A1A2E",
                muted: "#6B7280",
                "muted-light": "#9CA3AF",
                border: "#E5E0D4",
                "border-light": "#F0EDE8",
                accent: "#7C3AED",
                success: "#059669",
                warning: "#D97706",
                danger: "#DC2626",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
                'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)',
                'sidebar': '4px 0 24px rgba(30,42,74,0.12)',
                'gold': '0 4px 14px rgba(200,150,62,0.3)',
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '20px',
            }
        },
    },
    plugins: [],
}
