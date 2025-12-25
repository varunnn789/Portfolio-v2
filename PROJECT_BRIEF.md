# Project Brief: Game-Style 3D Portfolio

> **Last Updated**: December 25, 2024
> This document is updated after every discussion to track decisions and learnings.

---

## 🎯 Project Goal

Build an **immersive 3D game-style portfolio website** that:
- Showcases Varun's skills, experience, and projects
- Demonstrates ability to build creative, polished web experiences
- Serves as a learning journey through modern web development

---

## 👤 About the User

**Varun Singh**
- **Current Role**: Data Science / Analytics professional
- **Experience**: IQVIA (Data Analyst), Viscadia (Associate - Forecasting)
- **Skills**: Python, SQL, JavaScript, React, Data Science, ML
- **Learning Goals**: Frontend development, 3D graphics, modern web practices
- **Existing Portfolio**: [singh-varun.com](https://www.singh-varun.com) (Jupyter Book, to be replaced)

---

## 🎨 Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Aesthetic** | Sci-Fi / Retro blend | Professional yet unique, memorable |
| **3D Technology** | Three.js | User wants to learn 3D; simpler than raw WebGL |
| **Sound Effects** | Yes, with mute toggle | Immersive experience |
| **Easter Eggs** | Yes | Fun, shows personality |
| **Color Scheme** | TBD (Starting with terminal green + neon) | Will iterate |
| **Complexity** | Start simple, iterate up | "Understand first, go deep later" |

---

## 📅 Timeline

**Available Time**: 5 intensive days (14-16 hours/day possible)
**Approach**: Build working version first, polish over months

| Day | Focus |
|-----|-------|
| 1 | Foundation + Three.js basics + animated scene |
| 2 | Navigation + 3D environment setup |
| 3 | Interactive content (skills, projects as 3D objects) |
| 4 | Experience timeline + achievements |
| 5 | Polish + sound + deploy |

---

## 📚 Concepts Learned

### Session 1: Architecture Overview
- Frontend vs Backend (portfolios: frontend only)
- Hosting options (GitHub Pages, Vercel, Netlify — free!)
- $100-150/year budget is overkill; domain is main cost

### Session 2: Game Loop & State
- The game loop pattern: `update() → render() → repeat`
- State management: single source of truth
- Event-driven programming: listen, don't poll

### Session 3: WebGL & Three.js Deep Dive
- **WebGL**: Low-level GPU access API, complex to use directly
- **GPU vs CPU**: Parallel processing for graphics
- **Rendering Pipeline**: Vertices → Rasterization → Fragments → Pixels
- **Shaders**: Programs that run on GPU (Vertex = positions, Fragment = colors)
- **Three.js**: Friendly wrapper around WebGL
- **Core 3D Elements**: Scene (world), Camera (viewpoint), Renderer (draws to canvas)

### Quiz Answers (Varun):
1. ✅ GPU processes simultaneously, CPU one-by-one
2. ✅ Vertex = positions/outline, Fragment = pixel colors (clarified)
3. ✅ Three.js is a wrapper making WebGL usable
4. ✅ Scene + Camera + Renderer are the trinity

---

## ❓ Open Questions

- [ ] Final color palette decision
- [ ] What projects to showcase prominently?
- [ ] Do we want a "low graphics mode" fallback?

---

## 🔗 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Journey Course](https://threejs-journey.com/) (paid, but excellent)
- [WebGL Fundamentals](https://webglfundamentals.org/)

---

## 📝 Session Log

### Session 1 (Dec 25, 2024)
- Discussed project vision: game-like portfolio
- Explained frontend vs backend
- Confirmed budget is more than enough
- User shared aesthetic preference: Fantasy RPG vibes, but Sci-Fi/Retro for professionalism

### Session 3 (Dec 25, 2024) - Day 1 Execution
- Set up project manually (Vite interactive prompts didn't work in terminal)
- Created all core files with extensive learning comments:
  - `package.json` - npm dependencies & scripts
  - `index.html` - Canvas + HUD structure
  - `styles/main.css` - CSS design system with custom properties
  - `src/main.js` - Three.js scene setup, animation loop
  - `src/scene/Starfield.js` - Particle system with 5000 stars
  - `src/data/portfolio.js` - Structured portfolio content
  - `vite.config.js` - Build tool configuration
- Installed dependencies and verified scene renders correctly
- Concepts covered: ES6 modules, Three.js trinity, game loop, BufferGeometry, particle systems

### Session 4 (Dec 25, 2024) - Day 2 Execution
- Created camera controller with zone-based transitions
- Implemented navigation with click, keyboard, and URL hash support
- Built HUD manager for loading, panels, and notifications
- Added 20 floating decorative particles
- Enhanced CSS with styled info panels, timelines, project cards
- Verified all features work in browser
- Concepts covered: Linear interpolation (lerp), dependency injection, URL hash routing
