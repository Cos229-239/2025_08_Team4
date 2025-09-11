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

// distance helper
const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

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
      const s = points[i];
      const e = points[i + 1];
      const r = seg[i] === 0 ? 0 : target / seg[i];
      return { x: s.x + (e.x - s.x) * r, y: s.y + (e.y - s.y) * r };
    }
    target -= seg[i];
  }
  return points[points.length - 1];
}

const pathD = (pts) =>
  pts?.length ? `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") : "";

/**
 * Fullscreen Mountain/Wall Progress
 * props:
 *  - tasks: [{id?, title?, completed: boolean}]
 *  - showLabels?: boolean
 *  - animate?: boolean
 */
export default function MountainProgress({
  tasks = [],
  showLabels = true,
  animate = true,
}) {
  const width = SCREEN_W;
  const height = SCREEN_H;

  // Split
  const midX = width * 0.5;

  // Route runs on the right half (rock wall). A mostly vertical zig-zag.
  const route = useMemo(() => {
    const x = midX + width * 0.22; // place the route ~3/4 across the screen
    return [
      { x, y: height * 0.92 },
      { x: x - width * 0.03, y: height * 0.82 },
      { x: x + width * 0.02, y: height * 0.73 },
      { x: x - width * 0.04, y: height * 0.62 },
      { x: x + width * 0.03, y: height * 0.50 },
      { x: x - width * 0.02, y: height * 0.40 },
      { x: x + width * 0.01, y: height * 0.30 },
      { x: x - width * 0.015, y: height * 0.20 },
      { x: x, y: height * 0.10 }, // near summit
    ];
  }, [width, height, midX]);

  const ridge = useMemo(() => pathD(route), [route]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const progress = total ? done / total : 0;

  const tieOffs = useMemo(() => {
    if (!total) return [];
    return Array.from({ length: total }, (_, i) => getPointAlongPolyline(route, (i + 1) / total));
  }, [total, route]);

  // Animated climber
  const anim = useRef(new Animated.Value(0)).current;
  const [climber, setClimber] = useState(getPointAlongPolyline(route, progress));

  useEffect(() => {
    const id = anim.addListener(({ value }) => {
      setClimber(getPointAlongPolyline(route, value));
    });
    return () => anim.removeListener(id);
  }, [anim, route]);

  useEffect(() => {
    if (!animate) {
      anim.stopAnimation();
      anim.setValue(progress);
      setClimber(getPointAlongPolyline(route, progress));
      return;
    }
    Animated.timing(anim, {
      toValue: progress,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, animate, anim, route]);

  const summit = route[route.length - 1];

  // Clouds animation (gentle drift)
  const cloudAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(cloudAnim, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [cloudAnim]);
  const cloudTranslate = cloudAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12], // small horizontal drift
  });

  // Animated group wrapper for clouds
  const AnimatedG = Animated.createAnimatedComponent(G);

  return (
    <View style={styles.root} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          {/* sky gradient */}
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2={height}>
            <Stop offset="0" stopColor="#bfe4ff" />
            <Stop offset="1" stopColor="#eaf7ff" />
          </LinearGradient>
          {/* wall gradient */}
          <LinearGradient id="wall" x1="0" y1="0" x2="0" y2={height}>
            <Stop offset="0" stopColor="#7b6f66" />
            <Stop offset="1" stopColor="#5e544d" />
          </LinearGradient>
          {/* rock shading bands */}
          <LinearGradient id="wallShade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000" stopOpacity="0.10" />
            <Stop offset="1" stopColor="#000" stopOpacity="0" />
          </LinearGradient>
          {/* rope */}
          <LinearGradient id="rope" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2d2d2d" />
            <Stop offset="1" stopColor="#111" />
          </LinearGradient>
        </Defs>

        {/* Left half: sky */}
        <Rect x={0} y={0} width={midX} height={height} fill="url(#sky)" />

        {/* Subtle mountains silhouettes far left (for depth) */}
        <Path
          d={`M 0 ${height * 0.75} 
              L ${midX * 0.2} ${height * 0.55} 
              L ${midX * 0.45} ${height * 0.80}
              L ${midX * 0.7} ${height * 0.60}
              L ${midX} ${height * 0.82}
              L 0 ${height} Z`}
          fill="#a9cfe6"
          opacity={0.35}
        />

        {/* Clouds (animated group) */}
        <AnimatedG style={{ transform: [{ translateX: cloudTranslate }] }}>
          {renderCloud(midX * 0.15, height * 0.18, midX * 0.22)}
          {renderCloud(midX * 0.40, height * 0.10, midX * 0.18)}
          {renderCloud(midX * 0.30, height * 0.32, midX * 0.26)}
        </AnimatedG>

        {/* Right half: rock wall */}
        <Rect x={midX} y={0} width={midX} height={height} fill="url(#wall)" />
        {/* subtle vertical bands to give rock texture */}
        {Array.from({ length: 6 }).map((_, i) => {
          const x = midX + (i * midX) / 6;
          return <Rect key={i} x={x} y={0} width={midX / 10} height={height} fill="url(#wallShade)" opacity={0.25} />;
        })}

        {/* Route “groove” */}
        <Path d={ridge} stroke="#313131" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.35} />
        {/* Safety rope from bottom to current progress */}
        {(() => {
          const steps = 70;
          const ropePts = [];
          for (let i = 0; i <= steps; i++) {
            ropePts.push(getPointAlongPolyline(route, (i * progress) / steps));
          }
          const d = ropePts.length
            ? `M ${ropePts[0].x} ${ropePts[0].y} ` + ropePts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
            : "";
          return <Path d={d} stroke="url(#rope)" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
        })()}

        {/* Tie-off points */}
        <G>
          {tieOffs.map((p, i) => {
            const isDone = i < done;
            return (
              <G key={`tie-${i}`}>
                <Circle cx={p.x} cy={p.y} r={9} fill={isDone ? "#2ecc71" : "#ffffff"} stroke="#2e4057" strokeWidth={2} />
                {showLabels && (
                  <SvgText x={p.x} y={p.y - 14} fontSize={11} fill="#2e4057" textAnchor="middle">
                    {i + 1}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>

        {/* Summit flag on the wall top */}
        <G>
          <Polygon
            points={`${summit.x},${summit.y - 24} ${summit.x},${summit.y - 2} ${summit.x + 22},${summit.y - 13}`}
            fill="#ff3b3b"
          />
          <Path d={`M ${summit.x} ${summit.y} L ${summit.x} ${summit.y - 28}`} stroke="#2e4057" strokeWidth={2.3} />
        </G>

        {/* Climber */}
        <G>
          <Circle cx={climber.x} cy={climber.y + 6} r={6} fill="rgba(0,0,0,0.18)" />
          <Circle cx={climber.x} cy={climber.y} r={7} fill="#0d6efd" stroke="#143d6b" strokeWidth={2} />
          <Circle cx={climber.x} cy={climber.y - 9} r={4.5} fill="#ffffff" stroke="#2e4057" strokeWidth={1.6} />
        </G>
      </Svg>

      {/* overlay caption (kept simple) */}
      <View style={styles.captionWrap} pointerEvents="none">
        <Text style={styles.caption}>{done}/{total} tasks complete</Text>
      </View>
    </View>
  );
}

// tiny helper to draw a fluffy cloud
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
    backgroundColor: "rgba(255,255,255,0.7)",
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
