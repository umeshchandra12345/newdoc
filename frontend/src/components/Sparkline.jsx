import React from 'react';

/**
 * Apple-style Micro Sparkline SVG Component
 * Generates a smooth cubic Bezier curve with opacity gradient fill and glowing terminus point.
 */
const Sparkline = ({ data = [], color = '#0071E3', height = 36, width = 120 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;
  const stepX = (width - 8) / (data.length - 1);

  // Compute points
  const points = data.map((val, idx) => {
    const x = 4 + idx * stepX;
    // Invert y: high values near the top
    const y = paddingY + usableHeight - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  // Build cubic Bezier path for smooth Apple curves
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    pathD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
  }

  // Build area fill path
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaD = `${pathD} L ${lastPoint.x},${height} L ${firstPoint.x},${height} Z`;

  // Unique gradient ID
  const gradId = `sparkline-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, overflow: 'hidden' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle baseline track */}
        <line
          x1="4"
          y1={height - 2}
          x2={width - 4}
          y2={height - 2}
          stroke="rgba(0, 0, 0, 0.05)"
          strokeDasharray="2 2"
          strokeWidth="1"
        />

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Curve line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glowing terminus circle */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3.5"
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default Sparkline;
