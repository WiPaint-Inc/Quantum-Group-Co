# Demo Villa concept walkthrough

`/concept/demo-villa` is a scroll-driven walkthrough. The camera follows a spline. Blueprint lines assemble, the structure rises, the finished shell replaces the frame, and the path ends inside the room.

The page is labelled **Concept walkthrough · Demo Villa**. It is not a client project and it is not a completed house.

It renders only when `DRAFT_CONTENT` is the exact string `true`. Otherwise the route is a 404. The page is `noindex`, `robots.txt` disallows `/concept/demo-villa`, and the sitemap does not list it.

Until a model is published, the route draws a procedural pavilion.

## Drop in the model

Put the files in `public/models/demo-villa/`. Files in `models/demo-villa/` are parked. The site does not serve that folder.

Export in metres. The loader fits the model so the longer of width and depth is 14 m, centres it on x and z, and sits the base on y = 0. The camera path is fixed: it starts near `(16, 10, 18)` and ends inside, near `(0, 1.55, 1.15)`, looking toward negative z. Keep the glass front on the positive-z side so the interior reveal can clip that face.

Draco, meshopt, and KTX2 are decoded on this route. The decoders are same-origin:

- `/decoders/draco/gltf/`
- `/decoders/basis/`

Portfolio scenes stay meshopt-only. They do not use these decoders.

### One file

`public/models/demo-villa/demo-villa.glb`

Name a node, or one of its parents, with one of these words. The first match wins:

| State | Words in the node name |
| --- | --- |
| Interior | `interior`, `inside`, `room` |
| Blueprint | `blueprint`, `wireframe`, `wire-frame`, `linework` |
| Finished | `finished`, `finish`, `final`, `complete`, `clad` |
| Structure | `structure`, `structural`, `whitebox`, `white-box`, `frame`, `shell` |

`wireframe` is blueprint, not structure. `Finished_Shell` is finished.

A combined file can also use `KHR_materials_variants`. Name each variant with the words above. The walkthrough switches materials as the scroll moves. If there is no interior variant, the interior moment keeps the finished materials.

A combined file with none of these names is treated as the finished shell. The blueprint and the frame stay procedural, then the model fades in. The interior moment clips the positive-z face and moves the camera inside.

### Separate files

A phase file replaces that phase, including the same phase inside the combined file:

| File | Phase |
| --- | --- |
| `demo-villa-blueprint.glb` | Blueprint |
| `demo-villa-wireframe.glb` | Blueprint, used only when the blueprint file is absent |
| `demo-villa-structure.glb` | Structure |
| `demo-villa-finished.glb` | Finished shell |
| `demo-villa-interior.glb` | Interior, optional |

The wireframe name matches the parked export. Copy it into `public/models/demo-villa/` when it should be the blueprint. Do not rename it to a client or a place.

## Fallback video

Phones, Save-Data, machines with four or fewer cores, and machines with 4 GB of memory or less play a video when this file exists:

- `public/media/demo-villa-flythrough.mp4`
- `public/media/demo-villa-flythrough.jpg` (poster, optional)

Scroll scrubs the video. `prefers-reduced-motion` shows the video with controls, held on the finished state, plus a written four-step sequence. If the video is missing, those devices get the 3D scene at a pixel ratio of 1.

The 3D scene also drops to a pixel ratio of 1 if the rolling frame rate falls below 26.

## Review stops

Append a query to land on one state: `?stop=blueprint`, `?stop=structure`, `?stop=finished`, or `?stop=interior`.
