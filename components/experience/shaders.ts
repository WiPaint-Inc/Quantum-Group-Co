export const waterVertex = /* glsl */ `
  uniform float uTime;
  out vec2 vUv;
  out vec3 vWorld;
  void main() {
    vUv = uv;
    vec3 p = position;
    float wave = sin(p.x * 0.42 + uTime * 0.55) * 0.14;
    wave += sin(p.y * 0.31 - uTime * 0.42) * 0.11;
    wave += sin((p.x + p.y) * 0.18 + uTime * 0.28) * 0.08;
    p.z += wave;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamera;
  in vec2 vUv;
  in vec3 vWorld;
  out vec4 fragColor;
  void main() {
    vec3 viewDir = normalize(uCamera - vWorld);
    float fres = pow(1.0 - max(dot(vec3(0.0, 1.0, 0.0), viewDir), 0.0), 2.4);
    vec3 deep = vec3(0.01, 0.03, 0.05);
    vec3 shallow = vec3(0.05, 0.16, 0.18);
    vec3 sand = vec3(0.55, 0.42, 0.24);
    float c1 = sin(vWorld.x * 1.6 + uTime * 0.75) * sin(vWorld.z * 1.35 - uTime * 0.55);
    float c2 = sin((vWorld.x + vWorld.z) * 2.2 + uTime * 0.9);
    float caustic = smoothstep(0.05, 0.85, c1 * 0.5 + c2 * 0.5 + 0.45);
    vec3 col = mix(deep, shallow, clamp(fres * 0.75 + 0.12, 0.0, 1.0));
    col += sand * caustic * 0.16;
    float streak = pow(max(sin(vWorld.z * 0.18 + vWorld.x * 0.04) * 0.5 + 0.5, 0.0), 6.0);
    col = mix(col, vec3(0.96, 0.72, 0.42), streak * fres * 0.38);
    float spec = pow(max(dot(viewDir, normalize(vec3(-0.4, 0.85, 0.25))), 0.0), 48.0);
    col += vec3(1.0, 0.93, 0.8) * spec * 0.22;
    fragColor = vec4(col, 0.96);
  }
`;

export const skyVertex = /* glsl */ `
  out vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const skyFragment = /* glsl */ `
  uniform float uBlend;
  in vec3 vWorld;
  out vec4 fragColor;
  void main() {
    vec3 dir = normalize(vWorld);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 sunset = vec3(0.93, 0.58, 0.34);
    vec3 tide = vec3(0.10, 0.48, 0.52);
    vec3 zenith = vec3(0.02, 0.09, 0.13);
    vec3 col = mix(sunset, tide, smoothstep(0.02, 0.42, h));
    col = mix(col, zenith, smoothstep(0.28, 0.95, h));
    vec3 sunDir = normalize(vec3(0.62, 0.16, -0.42));
    float sun = pow(max(dot(dir, sunDir), 0.0), 220.0);
    float glow = pow(max(dot(dir, sunDir), 0.0), 7.0);
    col += vec3(1.0, 0.9, 0.7) * sun;
    col += vec3(0.95, 0.55, 0.28) * glow * 0.42;
    vec3 voidCol = vec3(0.015, 0.02, 0.045);
    col = mix(col, voidCol, uBlend);
    fragColor = vec4(col, 1.0);
  }
`;
