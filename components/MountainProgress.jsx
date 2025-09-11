// components/MountainProgress.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Platform } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  G,
  Rect,
  Polygon,
  Text as SvgText,
} from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/* ---------------- helpers ---------------- */

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

function pathD(pts) {
  return pts?.length
    ? `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
    : "";
}

function getPointAlongPolyline(points, t) {
  if (!points?.length) return { x: 0, y: 0 };
  const seg = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = dist(points[i], points[i + 1]);
    seg.push(d);
    total += d;
  }
  if (!total) return points[0];
  let target = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]) {
      const s = points[i], e = points[i + 1];
      const r = seg[i] === 0 ? 0 : target / seg[i];
      return { x: s.x + (e.x - s.x) * r, y: s.y + (e.y - s.y) * r, segIndex: i };
    }
    target -= seg[i];
  }
  const last = points[points.length - 1];
  return { x: last.x, y: last.y, segIndex: points.length - 2 };
}

function tangentAt(points, segIndex) {
  const i = Math.max(0, Math.min(points.length - 2, segIndex || 0));
  const s = points[i], e = points[i + 1];
  const vx = e.x - s.x, vy = e.y - s.y;
  const len = Math.hypot(vx, vy) || 1;
  return { x: vx / len, y: vy / len };
}
function leftNormalAt(points, segIndex) {
  const t = tangentAt(points, segIndex);
  return { x: -t.y, y: t.x }; // +90°
}

/* deterministic PRNG (so cliff is stable across renders) */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 1D “coherent” noise via a few harmonics of sine with random phases */
function jagNoise(t, rng, rough = 1) {
  const f1 = 2.0, f2 = 5.0, f3 = 11.0, f4 = 23.0;
  const p1 = rng() * Math.PI * 2, p2 = rng() * Math.PI * 2, p3 = rng() * Math.PI * 2, p4 = rng() * Math.PI * 2;
  // return a closure so each edge reuses the same phases (smooth)
  return (tt) => {
    const base =
      0.52 * Math.sin((tt * f1 + p1)) +
      0.28 * Math.sin((tt * f2 + p2)) +
      0.14 * Math.sin((tt * f3 + p3)) +
      0.06 * Math.sin((tt * f4 + p4));
    // a bit of choppy crumble
    const chip = (Math.sin((tt * 37 + p3) * 3) * Math.sin((tt * 19 + p2) * 2)) * 0.15;
    return (base + chip) * rough;
  };
}

/* ---------------- component ---------------- */

export default function MountainProgress({
  tasks = [],
  showLabels = true,
  animate = true,
  seed = 1337,             // tweak to get a different cliff silhouette
}) {
  const width = SCREEN_W;
  const height = SCREEN_H;
  const midX = width * 0.5;

  // layout
  const cliffLeftX = midX - 2;     // tiny overlap hides center seam
  const cliffRightX = width;       // flush to screen edge
  const baseY = height * 0.96;
  const topY  = height * 0.06;

  // cliff controls (tweak these to match your screenshot more/less rugged)
  const THICKNESS = width;  // face thickness from sky-side edge inward
  const ROUGHNESS = 1.0;           // overall jag amplitude scale
  const JAG_AMPL  = width * 0.125; // max horizontal jag from “mean” edge
  const STEPS     = 120;           // more = smoother, heavier

  // Summit ledge (a subtle top lip pointing into the sky)
  const OUT_LEN   = width * 0.12;
  const OUT_THICK = height * 0.024;

  // --- Build a jagged sky-side edge like your reference image ---
  const { edgeSky, edgeInner, summitAttach } = useMemo(() => {
    const rng = mulberry32(seed | 0);
    const n = jagNoise(0, rng, ROUGHNESS); // closure with fixed phases

    const skyPts = [];
    const innerPts = [];

    // “mean” sky edge is a vertical line with slight taper; noise adds bite-marks
    const meanX0 = cliffLeftX + width * 0.02;      // small inset from seam
    const meanX1 = cliffLeftX + width * 0.03;      // slightly more inset at top (subtle taper)

    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;                          // 0..1 bottom->top
      const y = baseY - t * (baseY - topY);
      const meanX = meanX0 + (meanX1 - meanX0) * t;

      // long irregular outline
      const jag = n(t) * JAG_AMPL;

      // occasional small overhang notches (gives that “crumbly” look)
      const notch =
        (i % 17 === 0 ? -width * 0.014 : 0) +
        (i % 29 === 0 ?  width * 0.012 : 0);

      const xSky = meanX + jag + notch;
      skyPts.push({ x: xSky, y });

      // inner face follows roughly parallel with slight waviness so thickness varies a bit
      const thickJitter = (n(t * 0.7 + 0.3) * 0.5 + 0.5) * (THICKNESS * 0.25);
      const xIn = Math.min(cliffRightX - 2, xSky + THICKNESS + thickJitter);
      innerPts.push({ x: xIn, y });
    }

    // top attach point for outcrop is the last sky point
    const summitAttach = skyPts[skyPts.length - 1];

    return { edgeSky: skyPts, edgeInner: innerPts, summitAttach };
  }, [width, height, cliffLeftX, cliffRightX, baseY, topY, THICKNESS, ROUGHNESS, JAG_AMPL, STEPS, seed]);

  // Make a solid cliff polygon by walking up the inner edge, then back down the sky edge
  const cliffPolyD = useMemo(() => {
    const forward = edgeInner.map(p => `${p.x} ${p.y}`).join(" L ");
    const back    = [...edgeSky].reverse().map(p => `${p.x} ${p.y}`).join(" L ");
    return `M ${forward} L ${back} Z`;
  }, [edgeInner, edgeSky]);

  // Summit outcrop params + flag location (to the LEFT, into sky)
  const outLeftX = Math.max(0, summitAttach.x - OUT_LEN);
  const outTopY  = Math.max(0, summitAttach.y - OUT_THICK);
  const outBotY  = summitAttach.y;

  // route: snake up the cliff roughly centered between sky edge & inner face
  const route = useMemo(() => {
    const pts = [];
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const y = baseY - t * (baseY - (outBotY - height * 0.02));

      // find x span at this y by sampling both edges near that y
      const findXAtY = (arr) => {
        // linear scan is fine for STEPS ~ 120
        for (let k = 1; k < arr.length; k++) {
          const a = arr[k - 1], b = arr[k];
          if ((a.y >= y && b.y <= y) || (a.y <= y && b.y >= y)) {
            const r = (y - a.y) / (b.y - a.y || 1);
            return a.x + (b.x - a.x) * r;
          }
        }
        return arr[arr.length - 1].x;
      };

      const xSky   = findXAtY(edgeSky);
      const xInner = findXAtY(edgeInner);
      const cx = xSky + (xInner - xSky) * (0.38 + 0.12 * Math.sin(t * Math.PI * 2)); // meander
      const wobble = Math.sin(t * Math.PI * 5) * width * 0.01;
      pts.push({ x: cx + wobble, y });
    }
    return pts;
  }, [edgeSky, edgeInner, width, height, baseY, outBotY]);

  const ridge = useMemo(() => pathD(route), [route]);

  // progress & tie-offs
  const total = tasks.length;
  const done  = tasks.filter(t => t.completed).length;
  const progress = total ? done / total : 0;

  const tieOffs = useMemo(() => {
    if (!total) return [];
    return Array.from({ length: total }, (_, i) => getPointAlongPolyline(route, (i + 1) / total));
  }, [total, route]);

  // animated climber
  const anim = useRef(new Animated.Value(0)).current;
  const [climber, setClimber] = useState(getPointAlongPolyline(route, progress));
  useEffect(() => {
    const id = anim.addListener(({ value }) => setClimber(getPointAlongPolyline(route, value)));
    return () => anim.removeListener(id);
  }, [anim, route]);
  useEffect(() => {
    if (!animate) {
      anim.stopAnimation(); anim.setValue(progress);
      setClimber(getPointAlongPolyline(route, progress));
      return;
    }
    Animated.timing(anim, {
      toValue: progress, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false
    }).start();
  }, [progress, animate, anim, route]);

  // clouds
  const cloudAnim = useRef(new Animated.Value(0)).current;
  const [cloudOffset, setCloudOffset] = useState(0);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(cloudAnim, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    const id = cloudAnim.addListener(({ value }) => {
      // 0..1 -> 0..12px drift
      setCloudOffset(12 * value);
    });
    loop.start();
    return () => { loop.stop(); cloudAnim.removeListener(id); };
  }, [cloudAnim]);
  const AnimatedG = Animated.createAnimatedComponent(G);
  // flag flutter
  const flagAnim = useRef(new Animated.Value(0)).current;
  const [flagOffset, setFlagOffset] = useState(0);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(flagAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(flagAnim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]));
    const id = flagAnim.addListener(({ value }) => setFlagOffset(Math.sin(value * Math.PI * 2) * 6));
    loop.start();
    return () => { loop.stop(); flagAnim.removeListener(id); };
  }, [flagAnim]);

  /* --------------- render --------------- */
  const widthScreen = SCREEN_W, heightScreen = SCREEN_H;
  return (
    <View style={styles.root} pointerEvents="none">
      <Svg width={widthScreen} height={heightScreen}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2={height}>
            <Stop offset="0" stopColor="#bfe4ff" />
            <Stop offset="1" stopColor="#eaf7ff" />
          </LinearGradient>
          <LinearGradient id="cliffShade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2c3136" />
            <Stop offset="1" stopColor="#3c434a" />
          </LinearGradient>
          <LinearGradient id="edgeLight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="rgba(255,255,255,0.28)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.0)" />
          </LinearGradient>
          <LinearGradient id="rope" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2d2d2d" />
            <Stop offset="1" stopColor="#111" />
          </LinearGradient>
        </Defs>

        {/* left sky */}
        <Rect x={0} y={0} width={midX} height={height} fill="url(#sky)" />
     <AnimatedG transform={`translate(${cloudOffset}, 0)`}>
           {renderCloud(midX * 0.18, height * 0.18, midX * 0.22)}
           {renderCloud(midX * 0.42, height * 0.10, midX * 0.18)}
           {renderCloud(midX * 0.34, height * 0.32, midX * 0.26)}
         </AnimatedG>

        {/* cliff body (fills to right edge, with jagged sky-side silhouette) */}
        <Path d={cliffPolyD} fill="url(#cliffShade)" />

        {/* tiny top lip/outcrop into the sky */}
        <Polygon
          points={`${summitAttach.x},${outBotY} ${outLeftX},${outBotY} ${outLeftX},${outTopY} ${summitAttach.x},${outTopY}`}
          fill="#dde3e8"
          stroke="#2e4057"
          strokeWidth={1.4}
        />
        {/* outcrop under-shadow for depth */}
        <Polygon
          points={`${summitAttach.x+2},${outBotY+2} ${outLeftX+2},${outBotY+3} ${outLeftX+2},${outTopY+2} ${summitAttach.x+2},${outTopY+2}`}
          fill="rgba(0,0,0,0.18)"
        />

        {/* subtle highlight along outer (right) edge for form */}
        <Path d={pathD(edgeInner)} stroke="url(#edgeLight)" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.9} />

        {/* faint horizontal striations */}
        {Array.from({ length: 8 }).map((_, i) => {
          const y = baseY - i * (height * 0.09);
          const x1 = edgeSky[0].x + width * 0.06 + i * 4;
          const x2 = cliffRightX - width * 0.02 - i * 10;
          return (
            <Path
              key={`strata-${i}`}
              d={`M ${x1} ${y} L ${x2} ${y - 3}`}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {/* route crack */}
        <Path d={ridge} stroke="#b7bec4" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.95} />

        {/* rope to current progress */}
        {(() => {
          const steps = 70;
          const ropePts = [];
          for (let i = 0; i <= steps; i++) {
            const p = getPointAlongPolyline(route, (i * progress) / steps);
            ropePts.push({ x: p.x, y: p.y });
          }
          const d = ropePts.length
            ? `M ${ropePts[0].x} ${ropePts[0].y} ` + ropePts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
            : "";
          return <Path d={d} stroke="url(#rope)" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
        })()}

        {/* piton tie-offs (wedges pointing toward sky) */}
        <G>
          {tieOffs.map((p, i) => {
            const isDone = i < done;
            const norm = leftNormalAt(route, p.segIndex);
            const len = width * 0.035;
            const tip = { x: p.x + norm.x * len, y: p.y + norm.y * len };
            const base = { x: p.x + norm.x * (len * 0.45), y: p.y + norm.y * (len * 0.45) };
            const wedge = `${p.x},${p.y} ${base.x},${base.y} ${tip.x},${tip.y}`;
            return (
              <G key={`piton-${i}`}>
                <Polygon points={wedge} fill={isDone ? "#2ecc71" : "#bfc7ce"} stroke="#2e4057" strokeWidth={1.8} />
                <Circle cx={p.x} cy={p.y} r={6} fill="#fff" stroke="#2e4057" strokeWidth={2} />
                {showLabels && (
                  <SvgText x={tip.x} y={tip.y - 10} fontSize={11} fill="#e9f2f7" stroke="#2e4057" strokeWidth={0.6} textAnchor="middle">
                    {i + 1}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>

        {/* optional flag on the left side of the outcrop */}
        <Path
          d={`M ${outLeftX + width*0.02} ${outTopY} L ${outLeftX + width*0.02} ${outTopY - 28}`}
          stroke="#2e4057" strokeWidth={2.3}
        />
        <Polygon
          points={`${outLeftX + width*0.02},${outTopY - 26} ${outLeftX + width*0.02},${outTopY - 8} ${outLeftX + width*0.02 - (22 + flagOffset)},${outTopY - 17}`}
          fill="#ff3b3b"
        />

        {/* climber */}
        <G>
          <Circle cx={climber.x} cy={climber.y + 6} r={6} fill="rgba(0,0,0,0.18)" />
          <Circle cx={climber.x} cy={climber.y} r={7} fill="#0d6efd" stroke="#143d6b" strokeWidth={2} />
          <Circle cx={climber.x} cy={climber.y - 9} r={4.5} fill="#ffffff" stroke="#2e4057" strokeWidth={1.6} />
        </G>
      </Svg>

      <View style={styles.captionWrap} pointerEvents="none">
        <Text style={styles.caption}>{done}/{total} tie-offs reached</Text>
      </View>
    </View>
  );
}

/* small fluffy clouds */
function renderCloud(cx, cy, w) {
  const h = w * 0.5;
  return (
    <G opacity={0.85}>
      <Circle cx={cx - w * 0.25} cy={cy} r={h * 0.38} fill="#ffffff" />
      <Circle cx={cx} cy={cy - h * 0.15} r={h * 0.45} fill="#ffffff" />
      <Circle cx={cx + w * 0.20} cy={cy} r={h * 0.35} fill="#ffffff" />
      <Rect x={cx - w * 0.4} y={cy - h * 0.15} width={w * 0.8} height={h * 0.45} rx={h * 0.2} fill="#ffffff" />
    </G>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SCREEN_W,
    height: SCREEN_H,
    backgroundColor: "#eaf7ff",
  },
  captionWrap: {
    position: "absolute",
    bottom: Platform.select({ ios: 28, android: 20 }),
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  caption: {
    fontSize: 14,
    color: "#2e4057",
    fontWeight: "600",
  },
});
