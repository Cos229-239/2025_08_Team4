import React from "react";
import Svg, { Polygon } from "react-native-svg";

export default function SnowyMountain({
  width = 80,
  height = 80,
  mountainColor = "#3b3b52",
  snowColor = "#A5F3E2",
  strokeColor = "#222239",
  strokeWidth = 2,
}) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;

  const basePoints = `${w * 0},${h * 1} ${w * 0.5},${h * 0} ${w * 1},${h * 1}`;

  const snowPoints = [
    [w * 0.25, h * 0.45],
    [w * 0.35, h * 0.35],
    [w * 0.42, h * 0.42],
    [w * 0.5, h * 0.3],
    [w * 0.58, h * 0.42],
    [w * 0.65, h * 0.36],
    [w * 0.75, h * 0.45],
    [w * 0.5, h * 0],
  ]
    .map((p) => p.join(","))
    .join(" ");

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Polygon
        points={basePoints}
        fill={mountainColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Polygon points={snowPoints} fill={snowColor} />
    </Svg>
  );
}