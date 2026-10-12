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
    for (int i = 0; i < 5; i++) {
      s += a * noise(p);
      p = p * 2.05 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec3 dir = normalize(vDir);
    vec3 sun = normalize(uSun);
    float up = max(dir.y, 0.0);
    float h = pow(up, 0.45);
    vec3 col = mix(uHorizon, uZenith, h);
    float mu = max(dot(dir, sun), 0.0);
    float day = 1.0 - uNight;
    col += uSunColor * pow(mu, 6.0) * 0.28 * day;
    col += uSunColor * pow(mu, 180.0) * day;
    vec2 cuv = dir.xz / (dir.y * 0.8 + 0.22);
    float cl = fbm(cuv * 1.15);
    float mask = smoothstep(0.52, 0.74, cl) * smoothstep(0.04, 0.2, dir.y);
    float silver = smoothstep(0.48, 0.58, cl) * (1.0 - smoothstep(0.66, 0.84, cl));
    float sunUp = smoothstep(-0.05, 0.25, sun.y);
    vec3 cloudCol = mix(vec3(0.45, 0.5, 0.56), vec3(0.98, 0.96, 0.93), 0.35 + 0.65 * sunUp);
    cloudCol += uSunColor * silver * 0.65 * day;
    col = mix(col, cloudCol, mask * 0.9 * (0.35 + 0.65 * day));
    float moon = pow(max(dot(dir, normalize(uMoon)), 0.0), 1400.0);
    float moonGlow = pow(max(dot(dir, normalize(uMoon)), 0.0), 14.0);
    col += vec3(0.9, 0.93, 1.0) * moon * uNight;
    col += vec3(0.55, 0.62, 0.78) * moonGlow * 0.22 * uNight;
    float stars = step(0.9982, hash(floor(dir.xy * 220.0)));
    col += vec3(0.92, 0.95, 1.0) * stars * uNight * smoothstep(0.12, 0.4, dir.y) * (1.0 - mask);
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
    float sand = 0.0;
    float reef = 0.0;
    float foam = 0.0;
    for (int i = 0; i < 16; i++) {
      if (i >= uIslandCount) break;
      vec2 center = uIslands[i].xy;
      float radius = uIslands[i].z;
      float stretch = max(uIslands[i].w, 0.2);
      vec2 delta = vWorld.xz - center;
      float reach = radius * max(stretch, 1.0) * 2.4;
      if (dot(delta, delta) > reach * reach) continue;
      vec2 q = delta / vec2(radius * stretch, radius);
      float d = length(q);
      float fromShore = max(d - 1.0, 0.0);
      sand = max(sand, exp(-fromShore * 9.0));
      reef = max(reef, exp(-fromShore * 2.4));
      float n = noise(vWorld.xz * 0.08 + vec2(uTime * 0.15, -uTime * 0.08));
      float lip = exp(-pow((d - 1.015) / 0.018, 2.0));
      float wash = exp(-pow((d - 1.07) / 0.02, 2.0)) * smoothstep(0.35, 0.7, n);
      foam = max(foam, (lip * (0.65 + 0.35 * n) + wash * 0.7) * smoothstep(1.35, 1.02, d));
    }
    vec3 deep = mix(vec3(0.012, 0.045, 0.095), vec3(0.008, 0.02, 0.045), uNight);
    vec3 turquoise = mix(vec3(0.02, 0.62, 0.64), vec3(0.015, 0.28, 0.36), uNight);
    vec3 sandCol = vec3(0.86, 0.9, 0.84);
    vec3 water = mix(deep, turquoise, clamp(reef, 0.0, 1.0));
    water = mix(water, sandCol, clamp(sand, 0.0, 1.0) * 0.82);
    vec3 reflected = skyReflect(refl);
    vec3 sunDir = normalize(uSun);
    vec3 moonDir = normalize(uMoon);
    float sunGlint = glitter(normal, viewDir, sunDir, 0.045, 0.72);
    float sunSpark = pow(max(dot(refl, sunDir), 0.0), 48.0);
    float sparkMask = step(0.82, hash(floor(vWorld.xz * 0.55 + uTime * 0.4)));
    float moonPath = glitter(normal, viewDir, moonDir, 0.03, 1.35);
    vec3 col = mix(water, reflected, fres * (0.35 + 0.4 * (1.0 - reef)));
    col += uSunColor * sunGlint * 1.15 * (1.0 - uNight) * smoothstep(-0.08, 0.12, sunDir.y);
    col += uSunColor * sunSpark * sparkMask * 1.6 * (1.0 - uNight);
    col += vec3(0.75, 0.84, 1.0) * moonPath * 0.85 * uNight;
    float crest = smoothstep(1.4, 3.2, vWorld.y) * 0.18;
    col = mix(col, vec3(0.95, 0.96, 0.94), clamp(foam + crest, 0.0, 1.0) * 0.82);
    float bio = reef * uNight * step(0.93, hash(floor(vWorld.xz * 0.35)));
    col += vec3(0.2, 0.85, 0.7) * bio * 0.45;
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
  uniform float uNight;
  uniform sampler2D uCanopy;
  in vec3 vColor;
  in vec3 vNormal;
  in vec3 vWorld;
  out vec4 fragColor;
  void main() {
    if (vWorld.y < -0.35) discard;
    vec3 n = normalize(vNormal);
    float veg = smoothstep(0.02, 0.16, vColor.g - vColor.r * 0.85);
    vec3 canopy = texture(uCanopy, vWorld.xz * 0.012).rgb;
    vec3 albedo = mix(vColor, canopy, veg);
    float wrap = max(dot(n, normalize(uSun)), 0.0) * 0.78 + 0.22;
    float moon = max(dot(n, normalize(uMoon)), 0.0);
    float wet = smoothstep(1.8, 0.15, vWorld.y) * smoothstep(0.05, 0.2, vColor.r - vColor.g);
    albedo = mix(albedo, albedo * vec3(0.62, 0.6, 0.52), wet);
    vec3 col = albedo * uSunColor * wrap * (1.0 - uNight * 0.7);
    col += albedo * vec3(0.42, 0.52, 0.68) * moon * uNight * 0.9;
    col += albedo * 0.05;
    float rim = pow(1.0 - clamp(n.y, 0.0, 1.0), 1.7);
    col += vec3(0.2, 0.48, 0.55) * rim * uNight * 1.3;
    col += vec3(0.55, 0.78, 0.8) * wet * uNight * 0.25;
    fragColor = vec4(col, 1.0);
  }
`;

export const lineVertex = /* glsl */ `
  in float aT;
  in float aSide;
  in float aBright;
  in vec3 aScatter;
  uniform float uDraw;
  out float vT;
  out float vSide;
  out float vBright;
  void main() {
    vec3 p = position + aScatter * (1.0 - uDraw);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
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
    float edge = pow(1.0 - smoothstep(0.15, 1.0, abs(vSide)), 1.15);
    float shown = smoothstep(vT - 0.035, vT + 0.002, uDraw);
    float head = exp(-pow((vT - uDraw) * 26.0, 2.0));
    if (shown < 0.02 && head < 0.04) discard;
    float wash = exp(-pow((vT - uWash) * 4.5, 2.0)) * step(0.02, uWash);
    vec3 col = uColor * vBright * (0.75 + head * 1.8 + uNight * 0.65);
    col += vec3(1.0, 0.93, 0.8) * wash;
    float alpha = edge * max(shown, head * 0.85) * (0.62 + head) * uFade;
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
  in vec2 vUv;
  in vec3 vNormal;
  in vec3 vWorld;
  out vec4 fragColor;
  void main() {
    vec3 n = normalize(vNormal);
    float ndl = max(dot(n, normalize(uSun)), 0.0);
    vec3 tex = texture(uCanopy, vUv).rgb;
    vec3 col = tex * (0.22 + 0.9 * ndl) * uSunColor * (1.0 - uNight * 0.72);
    col += tex * vec3(0.12, 0.18, 0.24) * uNight;
    float rim = pow(1.0 - clamp(n.y, 0.0, 1.0), 1.5);
    col += vec3(0.18, 0.42, 0.48) * rim * uNight;
    fragColor = vec4(col, 1.0);
  }
`;
