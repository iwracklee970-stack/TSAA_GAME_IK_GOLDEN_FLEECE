# Project Documentation & Retrospective: TSAA Game - The Golden Fleece

## 1. Underlying Theme and Visual Vibe

### Theme & Narrative
The project is built around an intriguing historical-mythological narrative set in **Tbilisi, 1938**. The protagonist uncovers long-lost university archives containing journal entries about the mythical ship *Argo*. Moving beyond classical folklore, the expedition re-frames the quest for the **Golden Fleece** not merely as a ancient fable, but as a documented historical expedition taking the player across Colchis, the Aegean Sea, and ancient ruin environments.

### Visual Vibe & Aesthetic Language
* **Color Palette & Texture**: Built with a warm, evocative **sepia theme** (`sepia-900`, `sepia-800`, `sepia-100`) combined with subtle paper noise overlays and dust textures to evoke the atmosphere of vintage archival documents, decaying parchment, and old cartography.
* **Typography**: Elegant serif header fonts (`font-heading`, `font-serif`) pair with clean monospaced coordinates and UI details (`font-mono`), reinforcing the archivist's scholarly journal vibe.
* **Interactive Storytelling**: Interactive scroll-driven mechanics seamlessly transition the user from the archival desk in Georgia, across SVG-drawn nautical maps over the Aegean Sea, and into the physics/IK-based puzzle gameplay.

---

## 2. Leveraging AI Tools & Prompting Challenges

### AI Implementation Across Project Domains
1. **Code & Physics Systems**: 
   - Utilized AI pair-programming (Gemini models via Antigravity AI Studio) to develop the complex **Inverse Kinematics (IK)** canvas renderer (`worldRenderer.ts`), level data structures (`levels.ts`), custom level editor (`EditorCanvas.tsx`), and React UI components.
2. **Visual & Narrative Generation**:
   - Used AI generation for background lore, atmospheric textures, and art concept generation (e.g. infinite library portals, ruin layers, asset mockups in `scratch/`).
3. **Asset & Texture Prototyping**:
   - Generated visual assets and backdrop images tailored to the vintage 1938 research aesthetic.

### Prompting Challenges Encountered
* **Mathematical & Spatial Precision**: Prompting AI for physics-heavy IK joint chains and canvas rendering loops required explicit step-by-step mathematical constraints (e.g. segment constraints, angle limits, vector math) rather than high-level requests.
* **Maintaining Visual Consistency**: Iteratively refining prompts was necessary to ensure that AI-generated visuals matched the exact sepia tonality and historical grain of the hand-crafted UI.
* **Component Reactivity & State Synchrony**: Balancing real-time HTML5 Canvas animation loops with React state management required precise prompt structuring to avoid canvas re-render glitches or state desynchronization.

---

## 3. Aesthetic and Ethical Choices

### Aesthetic Choices
* **Immersion over Generic UI**: Opted for bespoke CSS variables, custom canvas rendering, and dark sepia tones instead of generic bright modern UI frameworks, keeping the user immersed in a historical mystery.
* **Dynamic Motion**: Micro-animations powered by Framer Motion (`motion/react`) guide the narrative flow visually without cluttering the screen.

### Ethical & Curation Choices
* **Historical & Mythological Respect**: Rooted the narrative in real-world Caucasian and Colchian history (Georgia & Greek Mythology), avoiding superficial stereotypes while exploring historical folklore.
* **Responsible Media Sourcing & AI Curation**: AI tools were used as a collaborative assistant for brainstorming, structural scaffolding, and image concepting, while core logic, custom canvas code, and level design were curated and refined intentionally.
* **Open Source & Attribution**: Respected licenses for third-party libraries (Lucide icons, Framer Motion, Vite) and textures.

---

## 4. Deliverables Checklist

Below is the template/links for class submission and presentation deliverables:

| Deliverable | Status / Link |
| :--- | :--- |
| **Public Website Link** | `https://<your-username>.github.io/<repo-name>` *(or Vercel / Netlify link)* |
| **GitHub Repository** | `https://github.com/<your-username>/<repo-name>` |
| **Slide Deck / Showcase** | Included in Section 5 below |

---

## 5. Slide Deck / Interactive Presentation Showcase Outline

### Slide 1: Title & Concept Introduction
* **Title**: *TSAA Game: The Golden Fleece (Tbilisi, 1938)*
* **Subtitle**: An Interactive Mythological Research Puzzle Experience
* **Visual**: Project Banner / Library Background (`LIBRARY_FULL_FORE.png` / Scroll Landing Page view)

### Slide 2: Narrative & Theme
* **Concept**: Uncovering forgotten archives in 1938 Georgia tracing the expedition of the Argo.
* **Visual Vibe**: Sepia parchment, old nautical maps, historical archival documents.

### Slide 3: Technical Architecture & AI Integration
* **Tech Stack**: React, TypeScript, HTML5 Canvas (Inverse Kinematics), Vite, Framer Motion.
* **AI Tooling**: Gemini models for code generation, procedural math logic, and atmospheric prompt design.
* **Key Challenge Solved**: Translating inverse kinematics math into smooth interactive canvas mechanics.

### Slide 4: Aesthetic & Ethical Design Choices
* **Aesthetics**: Curated sepia color system, ambient textures, serif typography.
* **Ethical Curation**: Responsible usage of AI media, respecting historical sources, and full code transparency.

### Slide 5: Live Demo & Future Roadmap
* **Live Demo**: Interactive level preview & level editor demonstration.
* **Deliverable Links**: GitHub Repo & Live Website Deployment.
