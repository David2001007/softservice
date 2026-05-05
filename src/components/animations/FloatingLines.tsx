import { useEffect, useRef } from 'react'
import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import './FloatingLines.css'

// ── Shaders ──────────────────────────────────────────────────────────────────
// lowp precision = fastest GPU path
// No log(), no exp() – replaced with cheaper alternatives
// rotate() precomputed OUTSIDE each loop (was wrongly inside before)
const vertexShader = /* glsl */ `
precision lowp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
precision lowp float;

uniform float iTime;
uniform vec2  iResolution;     // vec2, not vec3 – saves a uniform slot
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDist;
uniform float midLineDist;
uniform float botLineDist;

// wave rotations baked as sin/cos pairs (no runtime trig inside loops)
uniform vec2 topRot;
uniform vec2 midRot;
uniform vec2 botRot;

uniform float topOffsetY;
uniform float midOffsetY;
uniform float botOffsetY;
uniform float topOffsetX;
uniform float midOffsetX;
uniform float botOffsetX;

uniform vec2  iMouse;
uniform bool  interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int  lineGradientCount;

vec3 getColor(float t) {
  if (lineGradientCount <= 1) return lineGradient[0];
  float s  = clamp(t, 0.0, 0.9999) * float(lineGradientCount - 1);
  int   i  = int(s);
  int   i2 = min(i + 1, lineGradientCount - 1);
  return mix(lineGradient[i], lineGradient[i2], fract(s)) * 0.5;
}

// Inline rotate: mat2 application without a function call
vec2 rot2(vec2 v, vec2 sc) { return vec2(v.x * sc.x + v.y * sc.y, -v.x * sc.y + v.y * sc.x); }

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv) {
  float t   = iTime * animationSpeed;
  float amp = sin(offset + t * 0.2) * 0.3;
  float y   = sin(uv.x + offset + t * 0.1) * amp;

  if (interactive) {
    // 1/(1+d²r) is ~4x faster than exp(-d²r) and looks similar
    vec2  d   = screenUv - mouseUv;
    float dd  = dot(d, d);
    float inf = 1.0 / (1.0 + dd * bendRadius);
    y += (mouseUv.y - screenUv.y) * inf * bendStrength * bendInfluence;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 baseUv    = (2.0 * fragCoord - iResolution) / iResolution.y;
  baseUv.y      *= -1.0;
  if (parallax) baseUv += parallaxOffset;

  vec3 col     = vec3(0.0);
  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv    = (2.0 * iMouse - iResolution) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  // Rotate UV once per wave, outside the line loop
  if (enableBottom) {
    vec2 ruv = rot2(baseUv, botRot);
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t  = fi / max(float(bottomLineCount - 1), 1.0);
      col += getColor(t) * wave(
        ruv + vec2(botLineDist * fi + botOffsetX, botOffsetY),
        1.5 + 0.2 * fi, baseUv, mouseUv
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    vec2 ruv = rot2(baseUv, midRot);
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t  = fi / max(float(middleLineCount - 1), 1.0);
      col += getColor(t) * wave(
        ruv + vec2(midLineDist * fi + midOffsetX, midOffsetY),
        2.0 + 0.15 * fi, baseUv, mouseUv
      );
    }
  }

  if (enableTop) {
    vec2 ruv  = rot2(baseUv, topRot);
    ruv.x    *= -1.0;
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t  = fi / max(float(topLineCount - 1), 1.0);
      col += getColor(t) * wave(
        ruv + vec2(topLineDist * fi + topOffsetX, topOffsetY),
        1.0 + 0.2 * fi, baseUv, mouseUv
      ) * 0.1;
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
`

const MAX_STOPS = 8
const TWO_PI   = Math.PI * 2

function hexToVec3(hex: string): Vector3 {
  const v = hex.trim().replace(/^#/, '').padEnd(6, '0')
  return new Vector3(
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  )
}

// Bake rotation angle into a vec2(sin, cos) so the GPU never calls trig per-loop
function angleToSinCos(angleDeg: number): [number, number] {
  const r = (angleDeg / 360) * TWO_PI
  return [Math.sin(r), Math.cos(r)]
}

type WaveType = 'top' | 'middle' | 'bottom'

export interface FloatingLinesProps {
  linesGradient?:     string[]
  enabledWaves?:      WaveType[]
  lineCount?:         number | number[]
  lineDistance?:      number | number[]
  topWavePosition?:   { x: number; y: number; rotate: number }
  middleWavePosition?: { x: number; y: number; rotate: number }
  bottomWavePosition?: { x: number; y: number; rotate: number }
  animationSpeed?:    number
  interactive?:       boolean
  bendRadius?:        number
  bendStrength?:      number
  mouseDamping?:      number
  parallax?:          boolean
  parallaxStrength?:  number
  mixBlendMode?:      React.CSSProperties['mixBlendMode']
}

export default function FloatingLines({
  linesGradient,
  enabledWaves    = ['top', 'middle', 'bottom'],
  lineCount       = [4],
  lineDistance    = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -20 },
  animationSpeed  = 1,
  interactive     = true,
  bendRadius      = 5.0,
  bendStrength    = -0.5,
  mouseDamping    = 0.08,
  parallax        = true,
  parallaxStrength = 0.12,
  mixBlendMode    = 'screen',
}: FloatingLinesProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const targetMouse   = useRef(new Vector2(-1000, -1000))
  const smoothMouse   = useRef(new Vector2(-1000, -1000))
  const targetInfl    = useRef(0)
  const smoothInfl    = useRef(0)
  const targetPar     = useRef(new Vector2(0, 0))
  const smoothPar     = useRef(new Vector2(0, 0))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let active   = true
    // Detect low-end/mobile: small screen OR no GPU pointer
    const mobile = window.innerWidth < 768 || !window.matchMedia('(pointer:fine)').matches

    // ── Line counts: aggressive reduction for performance ─────────
    const getCount = (wave: WaveType): number => {
      if (!enabledWaves.includes(wave)) return 0
      const base =
        typeof lineCount === 'number'
          ? lineCount
          : (lineCount as number[])[enabledWaves.indexOf(wave)] ?? 4
      // Mobile: only middle wave, 3 lines max
      if (mobile) return wave === 'middle' ? Math.min(base, 3) : 0
      return Math.min(base, 8) // desktop cap at 8 per wave
    }

    const getDist = (wave: WaveType): number => {
      const base =
        typeof lineDistance === 'number'
          ? lineDistance
          : (lineDistance as number[])[enabledWaves.indexOf(wave)] ?? 5
      return base * 0.01
    }

    // ── WebGL renderer at HALF resolution ─────────────────────────
    // Renders at 50% size, CSS stretches it – blur is imperceptible
    // for a background animation but gives 4x fewer fragment executions
    const SCALE     = mobile ? 0.35 : 0.5
    const isInteract = interactive && !mobile
    const useParallax = parallax && !mobile

    const renderer = new WebGLRenderer({
      antialias:       false,
      alpha:           false,
      powerPreference: 'high-performance',
      stencil:         false,
      depth:           false,
    })
    renderer.setPixelRatio(1) // always 1 – SCALE already handles it
    const canvas = renderer.domElement
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:auto;'
    container.appendChild(canvas)

    // ── Scene ─────────────────────────────────────────────────────
    const scene  = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    camera.position.z = 1

    // ── Gradient ──────────────────────────────────────────────────
    const gradArr  = Array.from({ length: MAX_STOPS }, () => new Vector3(1, 1, 1))
    let   gradCount = 0
    if (linesGradient?.length) {
      const stops = linesGradient.slice(0, MAX_STOPS)
      gradCount   = stops.length
      stops.forEach((h, i) => { const v = hexToVec3(h); gradArr[i].set(v.x, v.y, v.z) })
    }

    // Bake rotation angles into sin/cos pairs (CPU, once)
    const topAngle = topWavePosition?.rotate    ?? -15
    const midAngle = middleWavePosition?.rotate ??  10
    const botAngle = bottomWavePosition?.rotate ?? -20
    const [topSin, topCos] = angleToSinCos(topAngle)
    const [midSin, midCos] = angleToSinCos(midAngle)
    const [botSin, botCos] = angleToSinCos(botAngle)

    // ── Uniforms ──────────────────────────────────────────────────
    const uniforms = {
      iTime:         { value: 0 },
      iResolution:   { value: new Vector2(1, 1) },
      animationSpeed:{ value: animationSpeed },

      enableTop:     { value: !mobile && enabledWaves.includes('top') },
      enableMiddle:  { value: enabledWaves.includes('middle') },
      enableBottom:  { value: !mobile && enabledWaves.includes('bottom') },

      topLineCount:  { value: getCount('top') },
      middleLineCount:{ value: getCount('middle') },
      bottomLineCount:{ value: getCount('bottom') },

      topLineDist:   { value: getDist('top') },
      midLineDist:   { value: getDist('middle') },
      botLineDist:   { value: getDist('bottom') },

      // Pre-baked sin/cos – no trig in shader
      topRot: { value: new Vector2(topSin, topCos) },
      midRot: { value: new Vector2(midSin, midCos) },
      botRot: { value: new Vector2(botSin, botCos) },

      topOffsetX:    { value: topWavePosition?.x    ?? 10.0 },
      topOffsetY:    { value: topWavePosition?.y    ??  0.5 },
      midOffsetX:    { value: middleWavePosition?.x ??  5.0 },
      midOffsetY:    { value: middleWavePosition?.y ??  0.0 },
      botOffsetX:    { value: bottomWavePosition?.x ??  2.0 },
      botOffsetY:    { value: bottomWavePosition?.y ?? -0.7 },

      iMouse:        { value: new Vector2(-1000, -1000) },
      interactive:   { value: isInteract },
      bendRadius:    { value: bendRadius },
      bendStrength:  { value: bendStrength },
      bendInfluence: { value: 0 },

      parallax:      { value: useParallax },
      parallaxOffset:{ value: new Vector2(0, 0) },

      lineGradient:      { value: gradArr },
      lineGradientCount: { value: gradCount },
    }

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader })
    const geometry = new PlaneGeometry(2, 2)
    scene.add(new Mesh(geometry, material))

    // ── Size ──────────────────────────────────────────────────────
    const setSize = () => {
      if (!active) return
      const w = Math.round((container.clientWidth  || 1) * SCALE)
      const h = Math.round((container.clientHeight || 1) * SCALE)
      renderer.setSize(w, h, false)
      uniforms.iResolution.value.set(w, h)
    }
    setSize()

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { if (active) setSize() })
      : null
    ro?.observe(container)

    // ── Pointer (desktop only, passive) ───────────────────────────
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x    = (e.clientX - rect.left)  * SCALE
      const y    = (e.clientY - rect.top)   * SCALE
      targetMouse.current.set(x, (rect.height * SCALE) - y)
      targetInfl.current = 1
      if (useParallax) {
        targetPar.current.set(
          ((e.clientX - rect.left  - rect.width  / 2) / rect.width)  *  parallaxStrength,
          ((e.clientY - rect.top   - rect.height / 2) / rect.height) * -parallaxStrength,
        )
      }
    }
    const onLeave = () => { targetInfl.current = 0 }

    if (isInteract) {
      canvas.addEventListener('pointermove',  onMove,   { passive: true })
      canvas.addEventListener('pointerleave', onLeave,  { passive: true })
    }

    // ── Page Visibility – pause when tab is hidden ─────────────────
    let visible = !document.hidden
    const onVisibility = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    // ── Render loop – 30 fps cap ───────────────────────────────────
    const clock       = new Clock(true)
    const FPS_INTERVAL = 1 / 30   // target 30 fps
    let   lastTime    = -1
    let   raf         = 0

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!active || !visible) return

      const elapsed = clock.getElapsedTime()
      if (elapsed - lastTime < FPS_INTERVAL) return  // frame skip
      lastTime = elapsed

      uniforms.iTime.value = elapsed

      if (isInteract) {
        smoothMouse.current.lerp(targetMouse.current, mouseDamping)
        uniforms.iMouse.value.copy(smoothMouse.current)
        smoothInfl.current += (targetInfl.current - smoothInfl.current) * mouseDamping
        uniforms.bendInfluence.value = smoothInfl.current
      }

      if (useParallax) {
        smoothPar.current.lerp(targetPar.current, mouseDamping)
        uniforms.parallaxOffset.value.copy(smoothPar.current)
      }

      renderer.render(scene, camera)
    }
    loop()

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      active = false
      cancelAnimationFrame(raf)
      ro?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      if (isInteract) {
        canvas.removeEventListener('pointermove',  onMove)
        canvas.removeEventListener('pointerleave', onLeave)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.parentElement?.removeChild(canvas)
    }
  }, [
    linesGradient, enabledWaves, lineCount, lineDistance,
    topWavePosition, middleWavePosition, bottomWavePosition,
    animationSpeed, interactive, bendRadius, bendStrength,
    mouseDamping, parallax, parallaxStrength,
  ])

  return <div ref={containerRef} className="floating-lines-container" style={{ mixBlendMode }} />
}
