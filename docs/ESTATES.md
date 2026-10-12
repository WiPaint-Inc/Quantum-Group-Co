# Estate pages

`/estates` is a concept collection. Each study has a page at `/estates/<slug>`.

The pages, renders, walkthroughs, plans, finishes, planting notes, and the WhatsApp enquiry render only when `DRAFT_CONTENT` is the exact string `true`. With the flag off, a page keeps its title and the line “Specifications in preparation”.

Images are labelled **Concept render**. Video and the 3D slot are labelled **Concept walkthrough**. These are concept studies. They are not built projects. The pages do not show prices.

Records live in `content/estates.ts`. One placeholder, `WHATSAPP_ENQUIRY_NUMBER`, is the enquiry number. The page builds the WhatsApp link from that value and a message that names the estate. Replace the digits when a real number is assigned. Do not put the link in the content file.

## Specifications

`specs` is `null` until an area schedule exists. The page then says “Specifications in preparation” and does not invent areas.

`mega-estate-aerial` is filled from `area_summary.csv`:

- Enclosed gross: 4,570 m² and 49,191 ft²
- Buildings: 9 (A, B, C1, C2, D, E, F1, F2, G)

The square-foot total is the schedule total. Do not replace it with a sum of the rounded building rows. Leave `video` as `null` and `plans` as `[]` until files exist. Do not set `walkthrough3d` until a model exists.

## Walkthrough video

`video` is a path under `public/`, or `null`. A null video shows the hero render as a poster and does not load a media file. A file plays muted when it scrolls into view, uses that hero as its poster, and keeps a play control. `prefers-reduced-motion` leaves it paused on the poster.

## Drop in a GLB

The 3D slot stays off until that estate sets `walkthrough3d`. Choosing **Explore in 3D** is what loads the viewer. Nothing is fetched before that click.

1. Export metres. Put the ground at y = 0. Leave the file as a plain `.glb`. This slot does not load a Draco or meshopt decoder.
2. Save it as `public/models/estates/<slug>.glb`. Keep it under 8 MB when you can.
3. On that estate in `content/estates.ts`:

```ts
walkthrough3d: { glb: "/models/estates/<slug>.glb" },
```

Drag orbits the model. **Walk** asks for pointer lock, then WASD and the mouse move at eye height (1.6 m above the model base). Esc returns to orbit. The pixel ratio is capped at 1.25.

If WebGL is missing, or the file fails to load, the slot closes and the walkthrough video above it remains.

`models/demo-villa/` is parked. Do not copy those files into `public/`.

## Drop in a scene module

Use this when the model is not a single GLB. The module’s default export is a component rendered inside the canvas.

1. Add `components/estates/scenes/<slug>.tsx`.
2. Register it in `components/estates/scene-modules.ts`:

```ts
export const estateSceneModules = {
  "<slug>": () => import("./scenes/<slug>"),
};
```

3. On that estate:

```ts
walkthrough3d: { scene: "<slug>" },
```

An unknown key, or a module that fails to load, closes the slot and leaves the video.
