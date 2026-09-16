# Project Guidelines & Rules for InterviewForge

## 🎨 UI/UX Design System & Standards (MANDATORY)

Jab bhi koi UI design, frontend component, landing page, dashboard ya screen design/update karni ho, **ye guidelines automatically follow honi chahiye bina user ke baar baar bole**:

1. **UI/UX Pro Max Toolkit**:
   - Har design decision me `ui-ux-pro-max` skill ke curated styles, color palettes, typography pairings aur UX guidelines ka use karein:
     ```bash
     python "C:\Users\AYUSH PANDEY\.gemini\config\skills\ui-ux-pro-max\src\ui-ux-pro-max\scripts\search.py" "<query>" --domain <domain> --stack nextjs
     ```
2. **21st.dev Components & Inspiration**:
   - 21st.dev MCP Server configured hai (`~/.gemini/config/mcp_config.json`).
   - Catalog search aur components ke inspiration ke liye MCP tools ya helper client ka use karein:
     ```bash
     python scripts/21st_client.py search "<component-type>" -n 5
     python scripts/21st_client.py get <component_id>
     ```
3. **Visual Excellence & Aesthetics**:
   - Sleek modern dark mode (deep zinc/slate backgrounds, glowing border gradients, glassmorphism `backdrop-blur`).
   - Clean font pairing with modern typography (Inter, Outfit, Plus Jakarta Sans).
   - Micro-interactions, hover glow effects, subtle motion (Framer Motion / Tailwind animations).
   - Never create basic/MVP-looking layouts; deliver state-of-the-art, polished SaaS UI.
