import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
  color?: 'black' | 'white' | 'cyan' | 'magenta' | 'yellow';
}

export default function Logo({ className = '', iconOnly = false, size = 40, color = 'black' }: LogoProps) {
  const colorMap = {
    black: '#000000',
    white: '#ffffff',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    yellow: '#ffff00',
  };

  const fillColor = colorMap[color];
  const gearFill = color === 'black' ? '#ffffff' : '#000000';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Icon - Recreated exactly like reference images */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <g id="brutalist-asterisk">
          {/* Spoke 1: Diagonal bottom-left to top-right */}
          <rect
            x="32"
            y="88"
            width="136"
            height="32"
            transform="rotate(-25 100 104)"
            fill={fillColor}
            stroke="#000000"
            strokeWidth="1.5"
          />
          {/* Spoke 2: Diagonal top-left to bottom-right */}
          <rect
            x="32"
            y="88"
            width="136"
            height="32"
            transform="rotate(35 100 104)"
            fill={fillColor}
            stroke="#000000"
            strokeWidth="1.5"
          />
          {/* Spoke 3: Vertical-diagonal spoke */}
          <rect
            x="84"
            y="32"
            width="32"
            height="136"
            transform="rotate(5 100 100)"
            fill={fillColor}
            stroke="#000000"
            strokeWidth="1.5"
          />

          {/* White Gear shape on the top-left spoke */}
          <g transform="translate(68, 62) scale(0.85)">
            {/* Gear Outer Silhouette */}
            <circle cx="0" cy="0" r="25" fill={gearFill} stroke="#000000" strokeWidth="2.5" />
            
            {/* Gear Teeth (Outer notches) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <rect
                key={angle}
                x="-4.5"
                y="-30"
                width="9"
                height="9"
                transform={`rotate(${angle} 0 0)`}
                fill={gearFill}
                stroke="#000000"
                strokeWidth="2.5"
              />
            ))}
            
            {/* Gear Inner Cutout (Takes the primary asterisk color) */}
            <circle cx="0" cy="0" r="14" fill={fillColor} />
            
            {/* Inner center solid core */}
            <circle cx="0" cy="0" r="8" fill={gearFill} />

            {/* Gear indicator clock notch */}
            <path
              d="M 0 0 L 4 -4"
              stroke={fillColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      {!iconOnly && (
        <div className="flex flex-col leading-none font-sans font-black uppercase italic tracking-wider">
          <span className="text-xl text-black">Design</span>
          <span className="text-lg text-black bg-yellow px-1 py-0.5 border border-black inline-block mt-0.5">
            Customs
          </span>
        </div>
      )}
    </div>
  );
}
