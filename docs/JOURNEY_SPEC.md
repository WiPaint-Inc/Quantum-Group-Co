# Journey spec

The homepage flythrough is authored in [`src/journey/path.ts`](../src/journey/path.ts). That file is the blueprint for a later Unreal render. `lib/ocean-flight.ts` only samples it. Do not copy camera or sun numbers into components.

## Units and axes

- Length is metres. Angles in the data file are degrees.
- The scene is right-handed, Y up. Azimuth `0` points along **+Z**. Azimuth `90` points along **+X**. Elevation `0` is the horizon. Positive elevation is above the horizon.
- Progress `t` runs from `0` at Arrival to `1` when the contact camera has settled. Stop `i` of `n` stops is at `t = i / (n - 1)`.
- Unreal is Z-up and left-handed. Map a point `(x, y, z)` from this file to Unreal `(X, Y, Z) = (x, z, y)`. Check the imported arrival look vector against the keyframe below before treating any axis as north.

## Camera

| | |
| --- | --- |
| FOV | 46° vertical |
| Near / far | 0.12 m / 28,000 m |
| Arrival position | `(420, 278, 980)` |
| Arrival look-at | `(40, 6, -260)` |
| Cruise altitude | 285 m, clamped to 55–310 m while travelling |
| Eye-level finale | local `(0, 1.55, -3.6)` looking at local `(0, 1.2, 26)` |

The opening does not orbit an island. Later stops use the approach rows in `journeyPath.camera.approaches`:

- `bearing` is degrees, `0` along +Z.
- Camera position is the island origin plus `(sin(bearing) * distance, height, cos(bearing) * distance)`.
- Look-at is the island origin minus `(sin(bearing) * lookAhead * distance, …)` with look height `3 + height * 0.02`.
- During the dwell, `bearing` shifts by `orbit * dwellProgress` degrees and height scales by `1.06 - 0.06 * orbit`. Design and Build and Engineering do not use that small orbit. They use `journeyPath.camera.estateFlyIn` instead.

The scroll track is `1100vh`. Each stop-to-stop span holds the stop pose for the first `dwell` (`0.17`) of the span, travels on a cubic bezier, then settles into the next pose for the last `0.17`. The bezier is lifted toward the 285 m cruise. The website eases the parameter with a smootherstep blend (`0.25` linear + `0.75` smootherstep). That ease is part of the spline.

Chapters, after Arrival: Full Design & Build, Construction, Engineering, Plans & Rendering, Developments & Hotels, Advanced Materials Distribution, Your Build, Live, Contact. The plans ridge stays in the water. It is not a chapter. The right-hand legend lists those chapters and not Arrival.

## Estate fly-in

**Hard requirement.** The scroll flies into an estate as one continuous camera move. It does not cut, and it does not crossfade to a still photograph. The camera never rests on a flat picture. Parallax continues for the whole move.

`orbit = -1` is still the authored aerial approach, so the cruise into the stop does not jump. `orbit = 0` is the chapter. `orbit = 1` is the close at the end of the dwell, and the next cruise leaves from there. A file named `*_camera_path.json` may replace the middle of that move. It is blended back to the authored poses at both ends, so the cruise still does not cut.

### Full Design and Build

Stop 01 is the volcanic island in daylight. The gold site plan and the elevation lines resolve into the Grand Beachfront estate, standing on the shore. That is the same estate as `/estates/mega-estate-aerial`. The homepage and the estate page share one loader.

CAD delivers the model at `quantum-group-co/estates/mega-estate/web/`, served from `/estates/mega-estate/web/`:

| File | Role |
| --- | --- |
| `mega-estate_web.glb` | Built form |
| `mega-estate_web_lod1.glb` | Mid distance |
| `mega-estate_web_lod2.glb` | Far |
| `mega-estate_web_wireframe.glb` | The gold lines the form resolves from |
| `mega-estate_vegetation.json` | Trees, optional |
| `mega-estate_camera_path.json` | Local camera frames, optional |

Metres, Y-up. The origin is the estate centre at ground level. Sea is **+Z**. FOV is 46°. Until those files are present, the loader builds a placeholder massing from the site plan.

### Engineering

The engineering stop is the night island. The camera flies into the Cliffside Residence: a green roof on a ledge cut into the slope, with an added rock face behind it. The rest of the island is unchanged. The ledge is `journeyPath.cliffLedge`.

The view is an engineering study, not a photograph. A ghosted glass shell shows the structure, with faint fresnel edges and thin gold slab and column lines. Inside it, the services trace in sequence and then keep moving:

| System | Colour | Motion |
| --- | --- | --- |
| Plumbing | Cool blue | Pulses flow along the pipes |
| HVAC | White / silver | Airflow particles travel the ducts |
| Electrical | Gold | Sparks travel the conduits |
| Plant | Solid gold and white | Chillers, AHU, pumps, generator, roof solar, tanks and cistern |

It has to stay readable at night, so the lines, pulses and plant are emissive. The same loader serves `/estates/rustic-modern-cliffside`.

CAD delivers it at `quantum-group-co/estates/cliffside/web/`, served from `/estates/cliffside/web/`, with the same names (`cliffside_web.glb`, `_lod1`, `_lod2`, `_wireframe.glb`, `_vegetation.json`, `_camera_path.json`). An optional MEP layer is `cliffside_mep.glb`. Until those files are present, the loader uses the placeholder shell and the animated services.

### Developments

Developments keeps the gold site linework on the peninsula. There is no masterplan model and no photograph.

### Materials

The materials stop has no island. The camera rides beside the ship. Ship heading is `48°`, speed `8 m/s`, length `248 m`. Local +Z is the bow. At the stop (`orbit = 0`) the camera is `28 m` forward of the island point, `76 m` to starboard, `32 m` up, looking `72 m` back along the bow at height `9 m`.

### Contact finale

After the build-live dwell, one spline descends to the meeting cay. There is no cut. `u = 0` is the build-live departure pose. The later keys are **local metres on the cay**, then rotated into the world:

```
yaw = 111°
worldX = cayX + localX * cos(yaw) + localZ * sin(yaw)
worldY = localY
worldZ = cayZ - localX * sin(yaw) + localZ * cos(yaw)
```

The cay origin is the contact island `(3480, 260)`. Local keys, `u` along the finale:

| u | local position | local look-at |
| --- | --- | --- |
| 0.20 | (0, 240, −90) | (0, 6, 8) |
| 0.46 | (−8, 62, −32) | (0, 1.6, 10) |
| 0.70 | (0, 16, −14) | (0, 1.35, 18) |
| 0.86 | (0, 2.6, −6.2) | (0, 1.28, 22) |
| 1.00 | (0, 1.55, −3.6) | (0, 1.2, 26) |

Sample with Catmull-Rom through those keys. The contact card stays hidden until `u = 0.78`, then fades in over the remaining `0.22`.

**Locked.** Do not change the contact scene or this card. The scene is the tiny private cay at sunrise: two chairs, a small table, two drinks, the camera low behind the chairs, palms framing the view. The card copy is exact:

| | |
| --- | --- |
| Eyebrow | Begin |
| Title | Your estate starts with a conversation. |
| Line | Speak with a Representative on WhatsApp, or arrange a private video meeting. |
| CTA | Start on WhatsApp |

Do not use “Start a conversation.”

## Sun and time of day

One key per stop. The sun is world-fixed: only these keys are interpolated, so a turn changes where the sun sits in frame. Night is `0` (day) to `1` (night). Sky colours are the hex values in `journeyPath.sky`.

| Stop | Elevation | Azimuth | Night |
| --- | ---: | ---: | ---: |
| Arrival | 38° | 164° | 0 |
| Design | 26° | 215° | 0 |
| Plans | 9° | 248° | 0 |
| Construction | 1.2° | 266° | 0.04 |
| Engineering | −10° | 285° | 0.9 |
| Developments | −18° | 330° | 1 |
| Materials | −18° | 380° | 1 |
| Your build | −4° | 440° | 0.42 |
| Contact | 2.8° | 471° | 0 |

Arrival azimuth is deliberately off the opening view axis (the camera looks toward about 197°). The long specular streak is not drawn while the sun is high. A short glitter path remains only while the sun is low, for sunset and the sunrise finale.

Direction from azimuth `az` and elevation `el`, in radians:

```
x = sin(az) * cos(el)
y = sin(el)
z = cos(az) * cos(el)
```

The moon is fixed at azimuth `100°`, elevation `0.42` rad (about 24.06°).

## Islands

Positions are metres on the XZ plane. Radius, peak, and stretch come from `journeyPath.scales` for that size and kind.

| Id | x | z | Size | Kind |
| --- | ---: | ---: | --- | --- |
| arrival | 0 | 900 | none | arrival |
| design-build | −620 | 180 | large | design |
| construction | −3680 | 420 | mid | construction |
| engineering | −2860 | −2680 | mid | engineering |
| developments | 980 | −2100 | peninsula | developments |
| materials | 2920 | −720 | none | materials |
| build-live | 1680 | −3480 | cay | signal |
| contact | 3480 | 260 | private | contact |

Scenic cays in `journeyPath.scenic` are dressing. They are not stops and have no camera keys. The plans ridge (`plans`, −2300, −1180, mid) is in that list.

| Scale key | Radius | Peak | Stretch | Form |
| --- | ---: | ---: | ---: | --- |
| large | 430 | 78 | 1.16 | volcano |
| peninsula | 560 | 44 | 2.45 | peninsula |
| mid:plans | 280 | 68 | 1.32 | ridge |
| mid:construction | 260 | 64 | 1.22 | headland |
| mid:engineering | 310 | 34 | 1.12 | lagoon |
| mid | 250 | 42 | 1.18 | ridge |
| cay | 64 | 8 | 1.06 | cay |
| bar | 120 | 1.15 | 1.85 | bar |
| private | 16 | 0.55 | 1.08 | private |

## Export

`sampleFlight(t)` in `lib/ocean-flight.ts` returns position, look-at, bank, sun direction, and sky colours at progress `t`. To bake a spline for Unreal, sample `t = i / 240` for `i` in `0…240` and convert each point with `(X, Y, Z) = (x, z, y)`.

The website draws this same path. It renders at `min(devicePixelRatio, 3)`, with antialiasing, anisotropic filtering, and a 2048 shadow map. The pixel ratio steps down only if the frame rate stays under 24 for a few seconds. That cap is the website renderer, not part of the Unreal scene.
