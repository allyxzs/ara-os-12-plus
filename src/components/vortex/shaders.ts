export const VORTEX_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPointSize;
  uniform float uSharpness;
  uniform float uTurbulence;
  uniform float uAudioEnergy;
  uniform float uThinkingBoost;
  uniform float uTwist;

  attribute vec3 aTarget;
  attribute float aSeed;
  attribute float aLayer;

  varying float vSeed;
  varying float vLayer;
  varying float vDepth;
  varying float vGlow;

  vec3 pseudoCurl(vec3 p, float t) {
    float x = sin(p.y * 1.7 + t) * cos(p.z * 1.3 - t * 0.7);
    float y = sin(p.z * 1.5 - t * 0.8) * cos(p.x * 1.6 + t);
    float z = sin(p.x * 1.4 + t * 0.9) * cos(p.y * 1.8 - t * 0.6);
    return vec3(x, y, z);
  }

  void main() {
    vSeed = aSeed;
    vLayer = aLayer;

    vec3 pos = mix(position, aTarget, 1.0);

    float angle = uTwist * 0.004 * pos.y + sin(uTime * 0.35 + aSeed * 6.2831) * 0.08;
    float s = sin(angle);
    float c = cos(angle);
    pos.xz = mat2(c, -s, s, c) * pos.xz;

    float amp = (0.12 + uTurbulence * 0.24) * (1.0 + uAudioEnergy * 1.35 + uThinkingBoost * 0.75);
    vec3 flow = pseudoCurl(pos * 0.45 + aSeed, uTime * (0.55 + uThinkingBoost * 0.9));
    pos += flow * amp;

    pos *= 1.0 + sin(uTime * 2.4 + aLayer * 4.0) * (0.015 + uAudioEnergy * 0.08 + uThinkingBoost * 0.04);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = max(1.2, -mvPosition.z);
    vDepth = clamp(1.0 - (dist - 3.0) / 14.0, 0.15, 1.0);
    vGlow = clamp(0.45 + uAudioEnergy * 0.5 + uThinkingBoost * 0.4, 0.0, 1.4);

    float sizePx = uPointSize * (18.0 + aSeed * 16.0) * (1.0 / dist) * (0.85 + uSharpness * 0.2);
    gl_PointSize = clamp(sizePx, 1.0, 14.0);
  }
`;

export const VORTEX_FRAGMENT_SHADER = /* glsl */ `
  uniform float uHue;
  uniform float uSharpness;
  uniform float uWhiteCoreMix;
  uniform float uTime;
  uniform float uIsLightMode;
  uniform float uOpacity;
  uniform vec3 uAccent1;
  uniform vec3 uAccent2;

  varying float vSeed;
  varying float vLayer;
  varying float vDepth;
  varying float vGlow;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float edge = mix(0.48, 0.14, clamp((uSharpness - 0.5) / 2.0, 0.0, 1.0));
    float alpha = smoothstep(0.5, edge, d);

    float h = fract(uHue / 360.0 + vLayer * 0.14 + sin(vSeed * 12.0 + uTime * 0.2) * 0.04);
    vec3 hueColor = hsl2rgb(vec3(h, 0.90, uIsLightMode > 0.5 ? 0.44 : 0.62));
    vec3 accentMix = mix(uAccent1, uAccent2, smoothstep(0.35, 0.95, vSeed));
    vec3 chromatic = mix(hueColor, accentMix, 0.55);

    // Dark mode: luminous crisp white core | Light mode: deep architectural slate/ink core
    vec3 coreTone = mix(vec3(0.97, 0.98, 1.0), vec3(0.08, 0.11, 0.20), uIsLightMode);
    float coreBlend = clamp(uWhiteCoreMix + (1.0 - d * 2.0) * 0.26, 0.0, 1.0);
    vec3 finalColor = mix(chromatic, coreTone, coreBlend);

    float brightness = uIsLightMode > 0.5 ? (0.85 + vDepth * 0.25) : ((0.72 + vDepth * 0.48) * vGlow);
    float finalAlpha = alpha * (0.62 + vDepth * 0.36) * uOpacity;

    gl_FragColor = vec4(finalColor * brightness, finalAlpha);
  }
`;
