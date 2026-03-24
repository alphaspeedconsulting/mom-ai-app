# Design System Document: The Empathetic Architect

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Digital Sanctuary."** Unlike traditional productivity apps that feel clinical or demanding, this system treats the user interface as a breathable, supportive environment. 

We move beyond the "standard app" aesthetic by embracing **Organic Editorialism**. This means rejecting rigid, boxed-in layouts in favor of intentional asymmetry, overlapping layers, and high-contrast typography scales. The goal is to make a busy mom feel like she is stepping into a calm, high-end lifestyle magazine that just happens to manage her life. We prioritize white space (breathing room) over information density, ensuring every interaction feels like a "digital exhale."

---

### 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is a sophisticated blend of grounded teals (`primary`), warmth-driven ambers (`secondary`), and serene lavenders (`tertiary`).

- **The "No-Line" Rule:** To maintain a premium, soft feel, **1px solid borders are strictly prohibited** for sectioning. Separation of concerns must be achieved through background shifts. For example, a `surface-container-low` section should sit directly on a `background` floor without a stroke.
- **Surface Hierarchy & Nesting:** Treat the UI as physical layers of "frosted glass." Use `surface-container-lowest` for the base background and `surface-container-highest` for high-priority interactive cards. This creates a "nested" depth that guides the eye naturally.
- **The "Glass & Gradient" Rule:** Floating elements (like navigation bars or quick-action modals) should utilize Glassmorphism. Use semi-transparent `surface` colors with a `20px` to `40px` backdrop blur. 
- **Signature Textures:** For hero sections and primary CTAs, use subtle linear gradients transitioning from `primary` (#32695a) to `primary_container` (#afe9d7) at a 135-degree angle. This adds a "soul" to the interface that flat colors cannot replicate.

---

### 3. Typography: Editorial Authority
We pair **Plus Jakarta Sans** (Display/Headlines) with **Be Vietnam Pro** (Body/Labels) to balance modern efficiency with approachable warmth.

- **The Hierarchy:** 
    - **Display-LG (3.5rem):** Reserved for moments of celebration or empty states. 
    - **Headline-MD (1.75rem):** Used for daily headers to provide a sense of "The Daily Edit."
    - **Body-LG (1rem):** Our workhorse. Set with generous line-height (1.6) to ensure fatigue-free reading for tired eyes.
- **Visual Voice:** By using a high-contrast scale between `display-lg` and `body-sm`, we create an editorial rhythm. Large headers feel like a warm greeting, while the clean body text ensures task-oriented clarity.

---

### 4. Elevation & Depth: Tonal Layering
We reject the heavy drop-shadows of the early web. In this system, depth is "felt" rather than "seen."

- **The Layering Principle:** Stacking is the primary tool for hierarchy. A `surface-container-lowest` card placed atop a `surface-container-low` section creates a soft, natural lift.
- **Ambient Shadows:** For elements that truly "float" (like a FAB), use an extra-diffused shadow: `offset-y: 8px, blur: 24px, color: rgba(0, 55, 71, 0.06)` (a tint of our `on_surface` color). Never use pure black shadows.
- **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a `1px` stroke of `outline_variant` at **15% opacity**. This provides a hint of structure without breaking the sanctuary's softness.

---

### 5. Components: Soft & Intentional

- **Buttons:**
    - **Primary:** High-radius (`full` or `xl`), using the `primary` to `primary_container` gradient. 
    - **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
- **Cards & Lists:** **Strictly forbid divider lines.** Use `1.4rem` (Spacing 4) or `2rem` (Spacing 6) of vertical white space to separate list items. Use a subtle background shift (`surface-container-low`) for hovered or active states.
- **Input Fields:** Use `surface-container-highest` as the background with a `DEFAULT` (1rem) corner radius. Labels should use `label-md` in `on_surface_variant`. 
- **The "Mom-Moment" Chip:** A custom component for mood or status. Use `tertiary_container` with `tertiary` text and a `full` radius. These should feel like soft pebbles.
- **Contextual Banners:** Instead of harsh alerts, use a `surface-variant` background with an `8.5rem` (Spacing 24) left-padding "heroic" layout for empathetic feedback.

---

### 6. Do’s and Don’ts

**Do:**
- **Do** use intentional asymmetry. Place a header on the left and a supporting image slightly offset to the right to create a "custom-built" feel.
- **Do** use the `xl` (3rem) corner radius for large containers to emphasize "friendliness."
- **Do** lean on the `surface-dim` (#a7e3fb) for subtle transitions in dark-mode-adjacent contexts.

**Don't:**
- **Don't** use a standard 12-column grid for everything. Break the grid with "hanging" elements or overlapping containers.
- **Don't** use `error` (#ac3434) for everything urgent. Try `secondary` first for warnings to keep the "empathetic" tone; save red only for critical failures.
- **Don't** ever use a solid black text. Always use `on_surface` (#003747) to keep the contrast soft and readable.

---

### 7. Spacing Scale: The Rhythm of Calm
Our spacing is built on a base of `0.35rem` to create "breathable" increments.
- **Micro-spacing (1.5 / 0.5rem):** For internal component padding (e.g., inside a chip).
- **Macro-spacing (10 / 3.5rem):** For separating major sections. 
- **The "Sanctuary Gap":** Use `16` (5.5rem) or `20` (7rem) for page margins on tablet/desktop to ensure the content never feels crowded.