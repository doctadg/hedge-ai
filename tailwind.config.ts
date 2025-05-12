import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
        'app-green': { // Added Hedge green
          DEFAULT: 'hsl(var(--app-green))',
          foreground: 'hsl(var(--app-green-foreground))'
        }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
          'border-gradient-shift': {
            '0%, 100%': { 'background-position': '0% 50%' },
            '50%': { 'background-position': '100% 50%' },
          },
          'fade-in-up': {
            'from': {
              opacity: '0',
              transform: 'translateY(20px)'
            },
            'to': {
              opacity: '1',
              transform: 'translateY(0)'
            },
          },
          'border-gradient-chase': { // Renamed from border-pulse-glow
            '0%': {
              'background-position': '0% 50%',
              'background-size': '400% auto', // Start with a large background size
            },
            '50%': {
              'background-position': '100% 50%',
              'background-size': '400% auto', // Maintain size, just shift position
            },
            '100%': {
              'background-position': '0% 50%', // Loop back
              'background-size': '400% auto',
            }
          },
          'border-light-1': { // Moves clockwise - Adjusted for w-1/2
            '0%': { top: '0', left: '0', width: '50%', height: '1px', transform: 'translateX(-100%)' }, // Start off-screen left, moving right
            '25%': { top: '0', left: '0', width: '50%', height: '1px', transform: 'translateX(200%)' }, // Move across top edge (200% = 100% / 0.5 width)
            '25.1%': { top: '0', left: '100%', width: '1px', height: '50%', transform: 'translateY(-100%) translateX(-100%)' }, // Switch to right edge, start top moving down
            '50%': { top: '0', left: '100%', width: '1px', height: '50%', transform: 'translateY(200%) translateX(-100%)' }, // Move down right edge
            '50.1%': { top: '100%', left: '100%', width: '50%', height: '1px', transform: 'translateX(0) translateY(-100%)' }, // Switch to bottom edge, start right moving left (translateX(0) is correct here)
            '75%': { top: '100%', left: '0', width: '50%', height: '1px', transform: 'translateX(-200%) translateY(-100%)' }, // Move across bottom edge
            '75.1%': { top: '100%', left: '0', width: '1px', height: '50%', transform: 'translateY(0) translateY(-100%)' }, // Switch to left edge, start bottom moving up (translateY(0) is correct here)
            '100%': { top: '0', left: '0', width: '1px', height: '50%', transform: 'translateY(-200%) translateX(0)' }, // Move up left edge
          },
          'border-light-2': { // Moves clockwise, offset start - Adjusted for w-1/2
            '0%': { top: '100%', left: '100%', width: '50%', height: '1px', transform: 'translateX(0) translateY(-100%)' }, // Start bottom right, moving left
            '25%': { top: '100%', left: '0', width: '50%', height: '1px', transform: 'translateX(-200%) translateY(-100%)' }, // Move across bottom edge
            '25.1%': { top: '100%', left: '0', width: '1px', height: '50%', transform: 'translateY(0) translateY(-100%)' }, // Switch to left edge, start bottom moving up
            '50%': { top: '0', left: '0', width: '1px', height: '50%', transform: 'translateY(-200%) translateX(0)' }, // Move up left edge
            '50.1%': { top: '0', left: '0', width: '50%', height: '1px', transform: 'translateX(-100%)' }, // Switch to top edge, start left moving right
            '75%': { top: '0', left: '0', width: '50%', height: '1px', transform: 'translateX(200%)' }, // Move across top edge
            '75.1%': { top: '0', left: '100%', width: '1px', height: '50%', transform: 'translateY(-100%) translateX(-100%)' }, // Switch to right edge, start top moving down
            '100%': { top: '0', left: '100%', width: '1px', height: '50%', transform: 'translateY(200%) translateX(-100%)' }, // Move down right edge
          },
          'glow-pulse': {
            '0%, 100%': {
              boxShadow: '0 0 15px 2px rgba(34, 197, 94, 0.7)'
            },
            '50%': {
              boxShadow: '0 0 25px 5px rgba(34, 197, 94, 0.9)'
            }
          }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'border-gradient-shift': 'border-gradient-shift 3s ease-in-out infinite', 
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'border-gradient-chase': 'border-gradient-chase 4s linear infinite', // Renamed and using linear easing
        'border-light-1': 'border-light-1 10s linear infinite', // Changed duration to 10s and timing to linear
        'border-light-2': 'border-light-2 10s linear infinite', // Changed duration to 10s and timing to linear
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
