export const skyVertex = /* glsl */ `
  out vec3 vDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDir = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const skyFragment = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  uniform vec3 uSun;
  uniform vec3 uSunColor;
  uniform vec3 uMoon;
  uniform vec3 uCamera;
  uniform float uTime;
  uniform float uNight;
  in vec3 vDir;
  out vec4 fragColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      s += a * noise(p);
      p = p * 2.05 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec3 dir = normalize(vDir - uCamera);
    vec3 sun = normalize(uSun);
    float up = max(dir.y, 0.0);
    float h = pow(up, 0.45);
    vec3 col = mix(uHorizon, uZenith, h);
    float mu = max(dot(dir, sun), 0.0);
    float day = 1.0 - uNight;
    col += uSunColor * pow(mu, 6.0) * 0.28 * day;
    col += uSunColor * pow(mu, 180.0) * day;
    float cover = 0.0;
    float light = 0.0;
    if (dir.y >= 0.04) {
      float t0 = max((820.0 - uCamera.y) / dir.y, 0.0);
      float t1 = (2300.0 - uCamera.y) / dir.y;
      float stepLen = max(t1 - t0, 0.0) / 4.0;
      for (int i = 0; i < 4; i++) {
        vec3 p = uCamera + dir * (t0 + stepLen * (float(i) + 0.5));
        float layer = smoothstep(820.0, 1180.0, p.y) * (1.0 - smoothstep(1680.0, 2300.0, p.y));
        float d = smoothstep(0.46, 0.72, fbm(p.xz * 0.00032 + vec2(uTime * 0.004, p.y * 0.00008))) * layer;
        cover += d;
        light += d * smoothstep(0.42, 0.75, fbm((p.xz + sun.xz * 240.0) * 0.00032));
      }
      cover = clamp(cover * 0.62, 0.0, 1.0);
    }
    float sunUp = smoothstep(-0.05, 0.25, sun.y);
    vec3 cloudCol = mix(vec3(0.55, 0.58, 0.66), vec3(0.98, 0.96, 0.93), 0.35 + 0.65 * sunUp);
    cloudCol = mix(cloudCol, uSunColor, light * 0.35 * day);
    cloudCol = mix(cloudCol, vec3(0.62, 0.68, 0.78), uNight * 0.55);
    col = mix(col, cloudCol, cover * (0.55 + 0.4 * day) * smoothstep(0.02, 0.16, dir.y));
    float moon = pow(max(dot(dir, normalize(uMoon)), 0.0), 1400.0);
    float moonGlow = pow(max(dot(dir, normalize(uMoon)), 0.0), 14.0);
    col += vec3(0.9, 0.93, 1.0) * moon * uNight;
    col += vec3(0.55, 0.62, 0.78) * moonGlow * 0.22 * uNight;
    float stars = step(0.9982, hash(floor(dir.xy * 220.0)));
    col += vec3(0.92, 0.95, 1.0) * stars * uNight * smoothstep(0.12, 0.4, dir.y) * (1.0 - cover);
    fragColor = vec4(col, 1.0);
  }
`;

export const waterVertex = /* glsl */ `
  uniform float uTime;
  out vec2 vUv;
  out vec3 vWorld;
  out vec3 vNormal;

  vec3 gerstner(vec3 p, float steep, float length, vec2 dir, float speed) {
    float k = 6.2831853 / length;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(dir);
    float f = k * (dot(d, p.xz) - c * speed * uTime);
    float a = steep / k;
    return vec3(d.x * a * cos(f), a * sin(f), d.y * a * cos(f));
  }

  void main() {
    vec3 p = position;
    p += gerstner(p, 0.14, 320.0, vec2(0.55, 0.84), 0.32);
    p += gerstner(p, 0.09, 110.0, vec2(-0.25, 1.0), 0.62);
    p += gerstner(p, 0.07, 38.0, vec2(0.9, -0.35), 1.05);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vUv = uv;
    vNormal = vec3(0.0, 1.0, 0.0);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamera;
  uniform sampler2D uNormal;
  uniform vec3 uSun;
  uniform vec3 uSunColor;
  uniform vec3 uMoon;
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  uniform float uNight;
  uniform vec4 uIslands[16];
  uniform int uIslandCount;
  uniform vec2 uShip;
  uniform float uShipHeading;
  uniform float uShipLive;
  in vec2 vUv;
  in vec3 vWorld;
  out vec4 fragColor;

  vec3 skyReflect(vec3 dir) {
    float h = pow(max(dir.y, 0.0), 0.45);
    return mix(uHorizon, uZenith, h);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float glitter(vec3 normal, vec3 viewDir, vec3 lightDir, float across, float along) {
    vec3 H = normalize(lightDir + viewDir);
    vec3 axis = normalize(vec3(lightDir.x, 0.0, lightDir.z) + vec3(0.0001, 0.0, 0.0001));
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), axis));
    float hx = dot(H, T);
    float hy = dot(H, axis);
    float nh = max(dot(normal, H), 0.02);
    return exp(-(hx * hx / (across * across) + hy * hy / (along * along)) / (nh * nh));
  }

  void main() {
    vec2 uv1 = vWorld.xz * 0.012 + vec2(uTime * 0.008, uTime * 0.005);
    vec2 uv2 = vWorld.xz * 0.045 + vec2(-uTime * 0.016, uTime * 0.012);
    vec3 n1 = texture(uNormal, uv1).xyz * 2.0 - 1.0;
    vec3 n2 = texture(uNormal, uv2).xyz * 2.0 - 1.0;
    vec3 normal = normalize(vec3(n1.x + n2.x, 1.35, n1.y + n2.y));
    vec3 viewDir = normalize(uCamera - vWorld);
    vec3 refl = reflect(-viewDir, normal);
    float fres = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
    float foam = 0.0;
    float best = 4.0;
    vec3 bottom = vec3(0.02, 0.07, 0.13);
    for (int i = 0; i < 16; i++) {
      if (i >= uIslandCount) break;
      vec2 center = uIslands[i].xy;
      float radius = uIslands[i].z;
      float stretch = max(uIslands[i].w, 0.2);
      vec2 delta = vWorld.xz - center;
      float reach = radius * max(stretch, 1.0) * 2.6;
      if (dot(delta, delta) > reach * reach) continue;
      vec2 q = delta / vec2(radius * stretch, radius);
      float ang = atan(q.y, q.x);
      float irregular = 1.0 + (noise(vec2(cos(ang) * 1.7, sin(ang) * 1.7) + center * 0.01) - 0.5) * 0.34;
      float d = length(q) / irregular;
      float warp = noise(vWorld.xz * 0.012 + center * 0.004) * 0.22 - 0.1;
      float shelf = noise(center * 0.003 + 4.0);
      float s = clamp((d - 1.0 + warp) / (0.48 + shelf * 0.45), 0.0, 1.0);
      float reefN = noise(vWorld.xz * 0.021 + center * 0.008);
      float gaps = smoothstep(0.34, 0.58, reefN);
      float reefBand = smoothstep(0.4, 0.52, s) * (1.0 - smoothstep(0.6, 0.78, s)) * gaps;
      float patches = smoothstep(0.5, 0.74, noise(vWorld.xz * 0.05 + 2.0)) * smoothstep(0.08, 0.36, s) * (1.0 - smoothstep(0.7, 0.88, s));
      vec3 sandCol = vec3(0.97, 0.94, 0.88);
      vec3 shade = mix(sandCol * vec3(0.9, 0.98, 0.96), vec3(0.28, 0.84, 0.82), smoothstep(0.0, 0.16, s));
      shade = mix(shade, vec3(0.04, 0.58, 0.68), smoothstep(0.14, 0.42, s));
      shade = mix(shade, vec3(0.04, 0.2, 0.26), patches * 0.7);
      shade = mix(shade, vec3(0.06, 0.24, 0.28), reefBand * 0.85);
      shade = mix(shade, vec3(0.02, 0.1, 0.16), smoothstep(0.7, 0.95, s));
      float n = noise(vWorld.xz * 0.08 + vec2(uTime * 0.15, -uTime * 0.08));
      float lip = exp(-pow((d - 1.012) / 0.016, 2.0));
      float wash = exp(-pow((d - 1.06) / 0.02, 2.0)) * smoothstep(0.35, 0.7, n);
      float breaker = exp(-pow((s - 0.64) / 0.04, 2.0)) * smoothstep(0.55, 0.8, noise(vWorld.xz * 0.03 + vec2(uTime * 0.04, 0.0)));
      foam = max(foam, (lip * (0.65 + 0.35 * n) + wash * 0.55 + breaker * 0.45) * smoothstep(1.4, 1.02, d));
      if (s < best) {
        best = s;
        bottom = shade;
      }
    }
    float wakeFoam = 0.0;
    if (uShipLive > 0.5) {
      vec2 fwd = vec2(sin(uShipHeading), cos(uShipHeading));
      vec2 right = vec2(fwd.y, -fwd.x);
      vec2 rel = vWorld.xz - uShip;
      float along = dot(rel, fwd);
      float side = dot(rel, right);
      float bowWave = exp(-pow((along - 118.0) / 16.0, 2.0)) * exp(-pow(abs(side) / 22.0, 2.0));
      float flank = exp(-pow((abs(side) - 16.5) / 5.0, 2.0)) * smoothstep(124.0, 30.0, along) * smoothstep(-130.0, -60.0, along);
      float behind = -112.0 - along;
      float wakeWidth = 8.0 + behind * 0.16;
      float wake = exp(-behind / 340.0) * exp(-pow(side / wakeWidth, 2.0)) * step(1.0, behind);
      float kelvin = exp(-pow((abs(side) - behind * 0.19) / 6.0, 2.0)) * step(4.0, behind) * exp(-behind / 420.0);
      wakeFoam = bowWave * 1.15 + flank * 0.72 + wake * 0.62 + kelvin * 1.05;
    }
    vec3 deep = mix(vec3(0.015, 0.05, 0.1), vec3(0.02, 0.055, 0.1), uNight);
    float shallows = 1.0 - smoothstep(0.72, 1.0, best);
    vec3 water = mix(deep, bottom, shallows);
    vec3 reflected = skyReflect(refl);
    vec3 sunDir = normalize(uSun);
    vec3 moonDir = normalize(uMoon);
    float lowSun = (1.0 - uNight) * (1.0 - smoothstep(0.04, 0.32, sunDir.y)) * smoothstep(-0.05, 0.1, sunDir.y);
    float sunGlint = glitter(normal, viewDir, sunDir, mix(0.04, 0.1, lowSun), mix(0.05, 0.9, lowSun));
    float sunSpark = pow(max(dot(refl, sunDir), 0.0), mix(64.0, 28.0, lowSun));
    float sparkMask = step(mix(0.9, 0.7, lowSun), hash(floor(vWorld.xz * 0.55 + uTime * 0.4)));
    float moonPath = glitter(normal, viewDir, moonDir, 0.2, 1.1);
    float moonSpark = step(0.68, hash(floor(vWorld.xz * 0.22 + vec2(uTime * 0.12, 1.7)))) * pow(max(dot(normal, normalize(moonDir * 0.35 + viewDir)), 0.0), 8.0);
    vec3 col = mix(water, reflected, fres * (0.32 + 0.35 * (1.0 - shallows)));
    col += uSunColor * sunGlint * lowSun * 1.15 * (1.0 - uNight) * smoothstep(-0.08, 0.12, sunDir.y);
    col += uSunColor * sunSpark * sparkMask * lowSun * 1.35 * (1.0 - uNight);
    col += vec3(0.78, 0.86, 1.0) * (moonPath * 0.7 + moonSpark * 0.85) * uNight;
    col += vec3(0.04, 0.07, 0.12) * uNight;
    float crest = smoothstep(1.4, 3.2, vWorld.y) * 0.18;
    col = mix(col, vec3(0.95, 0.96, 0.94), clamp(foam + crest + wakeFoam, 0.0, 1.0) * 0.82);
    float bio = smoothstep(0.68, 0.9, noise(vWorld.xz * 0.07)) * smoothstep(0.12, 0.4, best) * (1.0 - smoothstep(0.62, 0.86, best));
    col += vec3(0.12, 0.72, 0.6) * bio * 0.28 * uNight;
    float haze = smoothstep(2200.0, 11000.0, distance(uCamera.xz, vWorld.xz));
    col = mix(col, uHorizon * 0.72 + uZenith * 0.28, haze * 0.22);
    fragColor = vec4(col, 1.0);
  }
`;

export const islandVertex = /* glsl */ `
  in vec3 color;
  out vec3 vColor;
  out vec3 vNormal;
  out vec3 vWorld;
  void main() {
    vColor = color;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const islandFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uSunColor;
  uniform vec3 uMoon;
  uniform vec3 uCamera;
  uniform float uNight;
  uniform sampler2D uCanopy;
  uniform sampler2D uTerrain;
  uniform sampler2DShadow uShadowMap;
  uniform mat4 uShadowMatrix;
  uniform float uShadowOn;
  in vec3 vColor;
  in vec3 vNormal;
  in vec3 vWorld;
  out vec4 fragColor;
  void main() {
    if (vWorld.y < -0.35) discard;
    vec3 n = normalize(vNormal);
    vec3 sunDir = normalize(uSun);
    float veg = smoothstep(0.02, 0.16, vColor.g - vColor.r * 0.85);
    vec3 canopy = texture(uCanopy, vWorld.xz * 0.018).rgb;
    canopy = mix(canopy, texture(uCanopy, vWorld.xz * 0.07).rgb, 0.42);
    vec3 grain = texture(uTerrain, vWorld.xz * 0.05).rgb;
    vec3 albedo = mix(vColor, canopy, veg);
    albedo *= mix(vec3(0.86), grain, 0.5);
    float wrap = max(dot(n, sunDir), 0.0) * 0.78 + 0.22;
    float moon = max(dot(n, normalize(uMoon)), 0.0);
    float wet = smoothstep(1.8, 0.15, vWorld.y) * smoothstep(0.05, 0.2, vColor.r - vColor.g);
    albedo = mix(albedo, albedo * vec3(0.92, 0.88, 0.8), wet * 0.22);
    float shadow = 1.0;
    if (uShadowOn > 0.5) {
      vec4 shadowClip = uShadowMatrix * vec4(vWorld, 1.0);
      vec3 shadowUv = shadowClip.xyz / shadowClip.w;
      float bias = max(0.0028 * (1.0 - clamp(dot(n, sunDir), 0.0, 1.0)), 0.0008);
      bool inside = shadowUv.x > 0.0 && shadowUv.x < 1.0 && shadowUv.y > 0.0 && shadowUv.y < 1.0 && shadowUv.z < 1.0;
      if (inside) {
        vec2 texel = vec2(1.0 / 2048.0);
        shadow = 0.0;
        for (int sx = -1; sx <= 1; sx++) {
          for (int sy = -1; sy <= 1; sy++) {
            shadow += texture(uShadowMap, vec3(shadowUv.xy + vec2(float(sx), float(sy)) * texel, shadowUv.z - bias));
          }
        }
        shadow /= 9.0;
      }
    }
    vec3 col = albedo * uSunColor * wrap * mix(1.0, shadow, 1.0 - uNight) * (1.0 - uNight * 0.42);
    col += albedo * vec3(0.62, 0.7, 0.84) * (moon * 0.9 + 0.28) * uNight;
    col += albedo * 0.08;
    float lowSun = (1.0 - uNight) * smoothstep(0.28, 0.0, sunDir.y) * smoothstep(-0.04, 0.1, sunDir.y);
    float ridge = smoothstep(8.0, 36.0, vWorld.y) * max(dot(n, sunDir), 0.0);
    col += uSunColor * ridge * lowSun * 0.62;
    float cap = smoothstep(48.0, 70.0, vWorld.y);
    col = mix(col, mix(vec3(0.96, 0.97, 0.98), uSunColor, 0.18), cap * (0.72 - uNight * 0.45));
    float beach = smoothstep(2.4, 0.25, vWorld.y) * smoothstep(0.15, 0.7, vColor.r);
    col += vec3(0.82, 0.86, 0.95) * beach * (moon * 0.55 + 0.2) * uNight * 0.45;
    float dist = distance(uCamera, vWorld);
    float haze = smoothstep(500.0, 7000.0, dist) * smoothstep(12.0, 64.0, vWorld.y);
    col = mix(col, uSunColor * 0.25 + vec3(0.78, 0.84, 0.9), haze * (0.42 + uNight * 0.1));
    float rim = pow(1.0 - clamp(n.y, 0.0, 1.0), 1.7);
    col += vec3(0.2, 0.48, 0.55) * rim * uNight * 1.1;
    col += vec3(0.55, 0.78, 0.8) * wet * uNight * 0.2;
    fragColor = vec4(col, 1.0);
  }
`;

export const lineVertex = /* glsl */ `
  in float aT;
  in float aSide;
  in float aBright;
  in vec3 aScatter;
  in vec3 aN;
  uniform float uDraw;
  uniform vec2 uResolution;
  uniform float uHalfPx;
  out float vT;
  out float vSide;
  out float vBright;
  void main() {
    vec3 p = position + aScatter * (1.0 - uDraw);
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec4 nudged = projectionMatrix * modelViewMatrix * vec4(p + aN, 1.0);
    vec2 px = (nudged.xy / max(nudged.w, 0.0001) - clip.xy / max(clip.w, 0.0001)) * uResolution * 0.5;
    float span = max(length(px), 0.0001);
    gl_Position = clip;
    gl_Position.xy += (px / span) * aSide * uHalfPx * clip.w / uResolution;
    vT = aT;
    vSide = aSide;
    vBright = aBright;
  }
`;

export const lineFragment = /* glsl */ `
  uniform float uDraw;
  uniform float uWash;
  uniform float uNight;
  uniform float uFade;
  uniform vec3 uColor;
  in float vT;
  in float vSide;
  in float vBright;
  out vec4 fragColor;
  void main() {
    float core = smoothstep(0.28, 0.04, abs(vSide));
    float glow = (1.0 - smoothstep(0.2, 1.0, abs(vSide))) * 0.42;
    float shown = smoothstep(vT - 0.035, vT + 0.002, uDraw);
    float head = exp(-pow((vT - uDraw) * 26.0, 2.0));
    if (shown < 0.02 && head < 0.04) discard;
    float wash = exp(-pow((vT - uWash) * 4.5, 2.0)) * step(0.02, uWash);
    vec3 col = uColor * vBright * (0.85 + head * 2.2 + uNight * 0.85);
    col += vec3(1.0, 0.93, 0.8) * (wash + glow * 0.35);
    float alpha = (core * 0.95 + glow) * max(shown, head * 0.85) * (0.7 + head) * uFade;
    fragColor = vec4(col, alpha);
  }
`;

export const canopyVertex = /* glsl */ `
  uniform float uTime;
  out vec2 vUv;
  out vec3 vNormal;
  out vec3 vWorld;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.x += sin(uTime * 0.85 + position.y * 2.4 + position.z) * 0.06 * position.y;
    vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vUv = uv * 2.0 + vWorld.xz * 0.01;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const canopyFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uSunColor;
  uniform float uNight;
  uniform sampler2D uCanopy;
  uniform sampler2DShadow uShadowMap;
  uniform mat4 uShadowMatrix;
  uniform float uShadowOn;
  in vec2 vUv;
  in vec3 vNormal;
  in vec3 vWorld;
  out vec4 fragColor;
  void main() {
    vec3 n = normalize(vNormal);
    float ndl = max(dot(n, normalize(uSun)), 0.0);
    vec3 tex = texture(uCanopy, vUv).rgb;
    float shadow = 1.0;
    if (uShadowOn > 0.5) {
      vec4 shadowClip = uShadowMatrix * vec4(vWorld, 1.0);
      vec3 shadowUv = shadowClip.xyz / shadowClip.w;
      if (shadowUv.x > 0.0 && shadowUv.x < 1.0 && shadowUv.y > 0.0 && shadowUv.y < 1.0 && shadowUv.z < 1.0) {
        shadow = texture(uShadowMap, vec3(shadowUv.xy, shadowUv.z - 0.0015));
      }
    }
    vec3 col = tex * (0.22 + 0.9 * ndl * mix(1.0, shadow, 1.0 - uNight)) * uSunColor * (1.0 - uNight * 0.72);
    col += tex * vec3(0.12, 0.18, 0.24) * uNight;
    float rim = pow(1.0 - clamp(n.y, 0.0, 1.0), 1.5);
    col += vec3(0.18, 0.42, 0.48) * rim * uNight;
    fragColor = vec4(col, 1.0);
  }
`;
