# Web Development Concepts Reference

> A living document of concepts learned while building the 3D portfolio.
> Updated after each session.

---

## JavaScript Evolution

### What is ES6?

**ES6 (ECMAScript 2015)** is a major update to JavaScript released in 2015.

"ES" stands for **ECMAScript** — the official specification that JavaScript follows. Think of it like:
- **ECMAScript** = The rules (like a language's grammar book)
- **JavaScript** = The implementation (what browsers actually run)

**Before ES6 (ES5 - 2009):**
```javascript
// Variables with var (function-scoped, hoisted)
var name = "Varun";

// Functions
function greet(name) {
  return "Hello, " + name;
}

// No classes, used prototypes
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return "Hi, I'm " + this.name;
};

// No modules - everything was global!
// Had to use workarounds like IIFE patterns
```

**After ES6 (Modern JavaScript):**
```javascript
// let and const (block-scoped, safer)
const name = "Varun";
let count = 0;

// Arrow functions (shorter syntax)
const greet = (name) => `Hello, ${name}`;

// Template literals (backticks + ${})
console.log(`Welcome, ${name}!`);

// Classes (cleaner OOP)
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

// Modules (import/export)
import { something } from './module.js';
export const myFunction = () => {};

// Destructuring
const { x, y } = position;
const [first, second] = array;

// Spread operator
const newArray = [...oldArray, newItem];

// Promises (async handling)
fetch('/api').then(res => res.json());

// And much more...
```

**Why ES6 Matters:**
- Used in React, Vue, Angular, Node.js
- Makes code cleaner and more maintainable
- Required knowledge for modern web development

---

## How 3D Works with HTML/CSS

### The Misconception
You're right that HTML/CSS are fundamentally 2D. But here's the trick:

**The `<canvas>` element is just a container for pixels.**

```
┌─────────────────────────────────────────────────────────┐
│                     YOUR SCREEN                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              HTML/CSS (2D Layout)                  │  │
│  │                                                    │  │
│  │   ┌─────────────────────────────────────────┐     │  │
│  │   │         <canvas> element                 │     │  │
│  │   │   ┌───────────────────────────────────┐ │     │  │
│  │   │   │   JavaScript draws pixels here    │ │     │  │
│  │   │   │   using WebGL API (GPU-powered)   │ │     │  │
│  │   │   │                                   │ │     │  │
│  │   │   │   3D math → 2D pixels             │ │     │  │
│  │   │   └───────────────────────────────────┘ │     │  │
│  │   └─────────────────────────────────────────┘     │  │
│  │                                                    │  │
│  │   <div id="hud"> ← Regular HTML floats above      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key Insight:**
- HTML creates a `<canvas>` element (just a rectangle)
- JavaScript + WebGL draws pixels INTO that canvas
- 3D objects are calculated mathematically, then drawn as 2D pixels
- CSS positions the canvas and overlays (HUD) using z-index

**Our Setup:**
```css
#scene { z-index: 0; }   /* Canvas at the back */
#hud { z-index: 10; }    /* HTML overlay on top */
```

**The Browser Doesn't Know It's "3D":**
The browser just sees:
1. A canvas element
2. JavaScript drawing colored pixels to it
3. The 3D math is done by Three.js + WebGL

---

## Package Management

### dependencies vs devDependencies

```json
{
  "dependencies": {
    "three": "^0.170.0"     // NEEDED in final website
  },
  "devDependencies": {
    "vite": "^6.0.0"        // ONLY needed during development
  }
}
```

| Type | Installed With | Shipped to Users? | Examples |
|------|----------------|-------------------|----------|
| **dependencies** | `npm install three` | ✅ Yes | Three.js, React, Lodash |
| **devDependencies** | `npm install -D vite` | ❌ No | Vite, ESLint, Jest |

**Why This Matters:**
- `dependencies`: Code that runs in the user's browser
- `devDependencies`: Tools that help YOU build the code

When you run `npm run build`, only `dependencies` code goes into the final bundle.

---

## Animation: requestAnimationFrame vs setInterval

### Why requestAnimationFrame is Better

**setInterval approach (DON'T USE):**
```javascript
setInterval(() => {
  render();
}, 16);  // ~60fps (1000ms / 60 = 16.67ms)
```

Problems:
1. **Doesn't sync with monitor** — may cause tearing/stuttering
2. **Runs in background tabs** — wastes battery
3. **Can't handle slow frames** — gets backlogged
4. **Fixed timing** — doesn't adapt to device capabilities

**requestAnimationFrame approach (USE THIS):**
```javascript
function animate() {
  requestAnimationFrame(animate);  // Schedule next frame
  render();
}
animate();  // Start the loop
```

Benefits:
1. **Syncs with monitor refresh** — smooth 60fps (or 120fps on gaming monitors)
2. **Pauses in background tabs** — saves battery
3. **Handles slow frames gracefully** — skips if needed
4. **Browser optimizes** — batches with other animations

Your answer was partially correct! It's not just about "only updating what's needed" — it's about **syncing with the hardware display refresh rate**.

---

## GPU Performance: Float32Array & Draw Calls

### Why 5000 Objects is Slow

When you create separate objects:
```javascript
for (let i = 0; i < 5000; i++) {
  const star = new THREE.Mesh(geometry, material);
  scene.add(star);
}
```

Each object requires a **draw call** — a message from CPU to GPU:

```
CPU → "Hey GPU, draw object 1 at position X"
CPU → "Hey GPU, draw object 2 at position Y"
CPU → "Hey GPU, draw object 3 at position Z"
... 5000 more messages ...
```

**Each draw call has overhead:**
1. CPU prepares the command
2. Command travels to GPU
3. GPU processes command
4. GPU waits for next command

**5000 draw calls = SLOW (maybe 5-10 FPS)**

### Why BufferGeometry is Fast

With BufferGeometry, we send ONE message with ALL positions:

```javascript
const positions = new Float32Array(5000 * 3);  // All positions in one array
// ... fill positions ...
const starfield = new THREE.Points(geometry, material);
```

```
CPU → "Hey GPU, here's 5000 positions. Draw them all at once."
```

**1 draw call = FAST (60+ FPS)**

### Why Float32Array?

Regular JavaScript arrays are flexible but slow:
```javascript
const arr = [1.5, "hello", {x: 1}, true];  // Any type allowed
```

The GPU doesn't understand this mixed format. Converting takes time.

**Float32Array is GPU-native:**
```javascript
const arr = new Float32Array([1.5, 2.5, 3.5]);  // Only 32-bit floats
```

- Fixed size (can't add/remove elements)
- Fixed type (only numbers)
- Directly uploadable to GPU memory
- No conversion overhead

```
Regular Array → Convert to GPU format → Upload → Slow
Float32Array → Already GPU format → Upload → Fast
```

---

## The Three.js Trinity

Every Three.js application needs:

```
SCENE (What)
├── Contains all 3D objects
├── Like an empty movie set
└── scene.add(mesh) puts things in

CAMERA (Where)
├── Your viewpoint into the scene
├── Defines what's visible
└── Position, angle, zoom

RENDERER (How)
├── Takes scene + camera
├── Calculates what each pixel should be
└── Draws to <canvas>
```

The render call:
```javascript
renderer.render(scene, camera);
// "Draw the SCENE as seen from the CAMERA"
```

---

## Concepts Index

| Concept | File Where Used | Learned |
|---------|-----------------|---------|
| ES6 Modules | main.js | Day 1 |
| CSS Custom Properties | main.css | Day 1 |
| Three.js Trinity | main.js | Day 1 |
| Game Loop | main.js | Day 1 |
| Particle Systems | Starfield.js | Day 1 |
| BufferGeometry | Starfield.js | Day 1 |
| Float32Array | Starfield.js | Day 1 |
| State Management | main.js | Day 1 |
| Event Listeners | main.js | Day 1 |
| z-index Layering | main.css | Day 1 |
| Linear Interpolation (Lerp) | CameraController.js | Day 2 |
| Class-based Architecture | CameraController.js | Day 2 |
| Dependency Injection | main.js | Day 2 |
| URL Hash Routing | Navigation.js | Day 2 |
| Keyboard Event Handling | Navigation.js | Day 2 |
| Dynamic Content Loading | HUD.js | Day 2 |
| CSS Scrollbar Styling | main.css | Day 2 |

---

## Day 2 New Concepts

### Linear Interpolation (Lerp)

The most important concept from Day 2! Used everywhere in games, animations, and UI.

```javascript
// Formula: result = current + (target - current) * t
// Where t is a small number like 0.03

// Three.js has it built-in:
camera.position.lerp(targetPosition, 0.03);
```

**Why it works:**
- Each frame, we move 3% of the remaining distance
- First frame: 100 → 97 (moved 3)
- Second frame: 97 → 94.09 (moved 2.91)
- Movement slows as we approach target = natural "ease-out"

### URL Hash Routing

Single Page Applications (SPAs) update the URL without page reload:

```javascript
// Change hash
window.history.pushState(null, '', '#skills');

// Listen for changes
window.addEventListener('hashchange', () => {
  const section = window.location.hash.slice(1); // Remove #
  navigateTo(section);
});
```

**Benefits:**
- Shareable links (example.com/#skills)
- Browser back/forward buttons work
- No page reload = faster

### Synchronous vs Asynchronous (Blocking vs Non-Blocking)

**Synchronous (Blocking):** Code waits for something to finish before continuing.
```javascript
const data = loadFileSync('bigfile.txt');  // WAITS here until file loads
console.log('Done');  // Only runs after file is fully loaded
```

**Asynchronous (Non-Blocking):** Code continues immediately, callback runs later.
```javascript
button.addEventListener('click', () => {
  console.log('Clicked!');  // Runs LATER when click happens
});
console.log('Listening...');  // Runs IMMEDIATELY

// Output:
// "Listening..."       (immediate)
// "Clicked!"           (later, when user clicks)
```

**Restaurant Analogy:**
- **Sync:** Stand at counter waiting for burger. Can't do anything else.
- **Async:** Give phone number, go sit down, they call when ready.

**Why it matters:** If addEventListener was blocking, your entire website would FREEZE waiting for a click!

---

## Quiz Review (Day 2)

### Lerp Formula
```
result = current + (target - current) * t
```
Example: current=50, target=100, t=0.2
```
result = 50 + (100 - 50) * 0.2 = 50 + 10 = 60
```
We moved 20% closer to target (from 50 toward 100).

### Key Events Reference
| Event | Fires When |
|-------|------------|
| `click` | User clicks |
| `keydown` | Key pressed |
| `scroll` | Page scrolled |
| `resize` | Window resized |
| `mousemove` | Mouse moves |
| `hashchange` | URL hash changes |

---

## ⏳ Pending Review (Study Later)

### Day 3 Concepts

1. **Raycasting** — Cast invisible ray from camera through mouse position to detect which 3D objects are under the cursor
2. **Normalized Device Coordinates (NDC)** — Converting pixel position to -1 to +1 range for raycaster
3. **Data-Driven 3D** — Generate 3D objects programmatically from structured data (loop through skillsData → create nodes)
4. **THREE.Group** — Container that holds multiple 3D objects; move/rotate group = move/rotate all children
5. **userData** — Attach custom data to 3D objects for later access during interactions

### Key Code Pattern
```javascript
// Raycasting
raycaster.setFromCamera(mouse, camera);
const hits = raycaster.intersectObjects(objects);
if (hits.length > 0) {
  const object = hits[0].object;  // Closest hit
}
```

### Day 4 Concepts

1. **Procedural Generation** — Calculate positions from data using math instead of hardcoding
2. **Bezier Curves** — THREE.QuadraticBezierCurve3 creates smooth curved paths between points
3. **Observer Pattern** — AchievementManager tracks state and triggers callbacks on changes
4. **ExtrudeGeometry** — Create 3D shapes from 2D path outlines (star badges)

### Day 5 Concepts

1. **Web Audio API** — Browser's built-in audio system with AudioContext and oscillators
2. **Oscillator** — Generates sound waves at specific frequencies (no audio files needed!)
3. **First-Person Controls** — WASD + mouse for camera movement like in games
4. **Event State Tracking** — Tracking keydown/keyup to know which keys are held down
