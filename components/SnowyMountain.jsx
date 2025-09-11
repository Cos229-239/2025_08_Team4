// components/SnowyMountain.jsx
import React from "react";
import Svg, { Polygon } from "react-native-svg";

export default function SnowyMountain({
  width = 80,
  height = 80,
  mountainColor = "#3b3b52",
  snowColor = "#64F0D2",
  strokeColor = "#222239",
  strokeWidth = 2,
}) {
  const w = width;
  const h = height;

  // Base mountain
  const base = [
    [0, h],       // bottom left
    [w / 2, 0],   // peak
    [w, h],       // bottom right
  ];

  // Snow cap (jagged polygon)
  const snow = [
    [w * 0.25, h * 0.45], // left shoulder
    [w * 0.35, h * 0.35],
    [w * 0.42, h * 0.42],
    [w * 0.50, h * 0.30], // center high point
    [w * 0.58, h * 0.42],
    [w * 0.65, h * 0.36],
    [w * 0.75, h * 0.45], // right shoulder
    [w / 2, 0],           // peak
  ];

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Mountain body */}
      <Polygon
        points={base.map((p) => p.join(",")).join(" ")}
        fill={mountainColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Snow cap */}
      <Polygon
        points={snow.map((p) => p.join(",")).join(" ")}
        fill={snowColor}
      />
    </Svg>
  );
}
