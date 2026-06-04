import React, { useState, useRef, useEffect } from 'react';
import { EmblemLayer, TextLayer, GarmentType, GarmentView, PatternSettings } from '../types/editor';
import { Trash2, RotateCw } from 'lucide-react';

interface EditorCanvasProps {
  garmentType: GarmentType;
  garmentView: GarmentView;
  baseColor: string;
  pattern: PatternSettings;
  emblems: EmblemLayer[];
  texts: TextLayer[];
  stitchingColor: string;
  stitchingEnabled: boolean;
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  updateEmblem: (id: string, updates: Partial<EmblemLayer>) => void;
  updateText: (id: string, updates: Partial<TextLayer>) => void;
  deleteLayer: (id: string) => void;
}

export default function EditorCanvas({
  garmentType,
  garmentView,
  baseColor,
  pattern,
  emblems,
  texts,
  stitchingColor,
  stitchingEnabled,
  activeLayerId,
  setActiveLayerId,
  updateEmblem,
  updateText,
  deleteLayer,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging and Transform State
  const [transformState, setTransformState] = useState<{
    type: 'drag' | 'scale' | 'rotate' | null;
    startX: number;
    startY: number;
    startLayerX: number;
    startLayerY: number;
    startScale: number;
    startRotation: number;
    handleName?: 'tl' | 'tr' | 'bl' | 'br';
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startLayerX: 0,
    startLayerY: 0,
    startScale: 1,
    startRotation: 0
  });

  // Filter layers by the active view (front/back)
  const activeEmblems = emblems.filter(e => e.placement === garmentView);
  const activeTexts = texts.filter(t => t.placement === garmentView);
  
  // Combine all active layers for selection purposes
  const activeLayers = [
    ...activeEmblems.map(e => ({ id: e.id, type: 'emblem' as const, x: e.x, y: e.y, scale: e.scale, rotation: e.rotation, content: e })),
    ...activeTexts.map(t => ({ id: t.id, type: 'text' as const, x: t.x, y: t.y, scale: t.scale, rotation: t.rotation, content: t }))
  ];

  const currentActiveLayer = activeLayers.find(l => l.id === activeLayerId);

  // Mouse Handlers
  const handleMouseDown = (
    e: React.MouseEvent, 
    layerId: string, 
    type: 'drag' | 'scale' | 'rotate',
    handleName?: 'tl' | 'tr' | 'bl' | 'br'
  ) => {
    e.stopPropagation();
    const layer = activeLayers.find(l => l.id === layerId);
    if (!layer) return;

    setActiveLayerId(layerId);
    
    setTransformState({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startLayerX: layer.x,
      startLayerY: layer.y,
      startScale: layer.scale,
      startRotation: layer.rotation,
      handleName
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!transformState.type || !activeLayerId || !containerRef.current) return;
      const layer = activeLayers.find(l => l.id === activeLayerId);
      if (!layer) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - transformState.startX;
      const dy = e.clientY - transformState.startY;

      // Map dx, dy relative to percentage (0 - 100) inside container
      const pctDx = (dx / rect.width) * 100;
      const pctDy = (dy / rect.height) * 100;

      if (transformState.type === 'drag') {
        const nextX = Math.min(Math.max(transformState.startLayerX + pctDx, 5), 95);
        const nextY = Math.min(Math.max(transformState.startLayerY + pctDy, 5), 95);
        
        if (layer.type === 'emblem') {
          updateEmblem(activeLayerId, { x: nextX, y: nextY });
        } else {
          updateText(activeLayerId, { x: nextX, y: nextY });
        }
      } 
      else if (transformState.type === 'scale') {
        const scaleFactor = 1 - (dy / 150);
        const nextScale = Math.min(Math.max(transformState.startScale * scaleFactor, 0.2), 4.0);
        
        if (layer.type === 'emblem') {
          updateEmblem(activeLayerId, { scale: Number(nextScale.toFixed(2)) });
        } else {
          updateText(activeLayerId, { scale: Number(nextScale.toFixed(2)) });
        }
      } 
      else if (transformState.type === 'rotate') {
        const elementCenterScreenX = rect.left + (layer.x / 100) * rect.width;
        const elementCenterScreenY = rect.top + (layer.y / 100) * rect.height;
        
        const angleStart = Math.atan2(
          transformState.startY - elementCenterScreenY,
          transformState.startX - elementCenterScreenX
        );
        const angleCurrent = Math.atan2(
          e.clientY - elementCenterScreenY,
          e.clientX - elementCenterScreenX
        );
        
        const angleDiff = ((angleCurrent - angleStart) * 180) / Math.PI;
        const nextRotation = (transformState.startRotation + angleDiff) % 360;
        const normalizedRotation = nextRotation < 0 ? nextRotation + 360 : nextRotation;

        if (layer.type === 'emblem') {
          updateEmblem(activeLayerId, { rotation: Math.round(normalizedRotation) });
        } else {
          updateText(activeLayerId, { rotation: Math.round(normalizedRotation) });
        }
      }
    };

    const handleMouseUp = () => {
      setTransformState({
        type: null,
        startX: 0,
        startY: 0,
        startLayerX: 0,
        startLayerY: 0,
        startScale: 1,
        startRotation: 0
      });
    };

    if (transformState.type) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [transformState, activeLayerId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    setActiveLayerId(null);
  };

  const renderGarmentOutline = () => {
    const strokeWidth = 3;
    const isBack = garmentView === 'back';

    switch (garmentType) {
      case 'hoodie':
        return (
          <>
            {/* Base Hoodie Silhouette */}
            <path
              id="garment-base"
              d="M 120 40 C 135 40, 165 40, 180 40 C 190 70, 205 90, 210 110 L 260 140 L 290 190 L 250 215 L 210 170 L 210 320 L 90 320 L 90 170 L 50 215 L 10 190 L 40 140 L 90 110 C 95 90, 110 70, 120 40 Z"
              fill={baseColor}
              stroke="#000000"
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {pattern.type !== 'none' && (
              <path
                d="M 120 40 C 135 40, 165 40, 180 40 C 190 70, 205 90, 210 110 L 260 140 L 290 190 L 250 215 L 210 170 L 210 320 L 90 320 L 90 170 L 50 215 L 10 190 L 40 140 L 90 110 C 95 90, 110 70, 120 40 Z"
                fill="url(#patternFill)"
                style={{ mixBlendMode: 'normal', opacity: pattern.opacity }}
              />
            )}

            {!isBack ? (
              <>
                {/* Pocket */}
                <path
                  d="M 115 250 L 185 250 L 200 295 L 100 295 Z"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2.5"
                />
                <path
                  d="M 115 250 L 185 250 L 200 295 L 100 295 Z"
                  fill="url(#patternFill)"
                  style={{ mixBlendMode: 'normal', opacity: pattern.type !== 'none' ? pattern.opacity * 0.5 : 0 }}
                />
                {/* Drawstrings & Hood interior */}
                <path d="M 135 60 C 135 90, 140 130, 140 150" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <path d="M 165 60 C 165 90, 160 130, 160 150" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <path d="M 120 40 C 120 70, 180 70, 180 40" fill="none" stroke="#000000" strokeWidth="2.5" />
                <path
                  d="M 120 40 C 130 50, 170 50, 180 40 C 190 70, 175 85, 150 85 C 125 85, 110 70, 120 40 Z"
                  fill="rgba(0,0,0,0.1)"
                  stroke="#000000"
                  strokeWidth="2.5"
                />
              </>
            ) : (
              <path
                d="M 115 40 C 115 20, 185 20, 185 40 C 190 65, 110 65, 115 40 Z"
                fill="rgba(0,0,0,0.15)"
                stroke="#000000"
                strokeWidth="2.5"
              />
            )}

            {/* Arm Crease & Seam Shadows */}
            <g stroke="#000000" strokeWidth="2" fill="none" opacity="0.6">
              <path d="M 90 110 L 90 170" />
              <path d="M 210 110 L 210 170" />
              <path d="M 90 310 L 210 310" />
            </g>

            {/* Stitching Seams Overlay */}
            {stitchingEnabled && (
              <g stroke={stitchingColor} strokeWidth="2" strokeDasharray="4,4" fill="none" className="custom-seam-stitch">
                <path d="M 255 210 L 285 185" />
                <path d="M 45 210 L 15 185" />
                <path d="M 92 316 L 208 316" />
                {!isBack && <path d="M 117 252 L 183 252 M 197 293 L 103 293" />}
              </g>
            )}
          </>
        );

      case 'tshirt':
        return (
          <>
            {/* T-Shirt Silhouette */}
            <path
              id="garment-base"
              d="M 115 50 C 135 50, 165 50, 185 50 C 200 65, 225 75, 245 80 L 235 115 L 205 105 L 205 325 L 95 325 L 95 105 L 65 115 L 55 80 C 75 75, 100 65, 115 50 Z"
              fill={baseColor}
              stroke="#000000"
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {pattern.type !== 'none' && (
              <path
                d="M 115 50 C 135 50, 165 50, 185 50 C 200 65, 225 75, 245 80 L 235 115 L 205 105 L 205 325 L 95 325 L 95 105 L 65 115 L 55 80 C 75 75, 100 65, 115 50 Z"
                fill="url(#patternFill)"
                style={{ mixBlendMode: 'normal', opacity: pattern.opacity }}
              />
            )}

            {/* Collar */}
            <path
              d="M 115 50 C 120 65, 180 65, 185 50 Z"
              fill="rgba(0,0,0,0.08)"
              stroke="#000000"
              strokeWidth="2.5"
            />

            {/* Outline shading */}
            <g stroke="#000000" strokeWidth="2.5" fill="none" opacity="0.4">
              <path d="M 95 105 L 95 325" />
              <path d="M 205 105 L 205 325" />
            </g>

            {/* Stitching Seams Overlay */}
            {stitchingEnabled && (
              <g stroke={stitchingColor} strokeWidth="2" strokeDasharray="4,4" fill="none" className="custom-seam-stitch">
                <path d="M 210 102 L 232 110" />
                <path d="M 90 102 L 68 110" />
                <path d="M 97 321 L 203 321" />
                <path d="M 117 56 C 125 67, 175 67, 183 56" />
              </g>
            )}
          </>
        );

      case 'sweatshirt':
        return (
          <>
            {/* Sweatshirt Silhouette */}
            <path
              id="garment-base"
              d="M 115 50 C 130 50, 170 50, 185 50 C 200 65, 215 85, 220 105 L 270 155 L 290 195 L 255 215 L 220 170 L 220 320 L 80 320 L 80 170 L 45 215 L 10 195 L 30 155 L 80 105 C 85 85, 100 65, 115 50 Z"
              fill={baseColor}
              stroke="#000000"
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {pattern.type !== 'none' && (
              <path
                d="M 115 50 C 130 50, 170 50, 185 50 C 200 65, 215 85, 220 105 L 270 155 L 290 195 L 255 215 L 220 170 L 220 320 L 80 320 L 80 170 L 45 215 L 10 195 L 30 155 L 80 105 C 85 85, 100 65, 115 50 Z"
                fill="url(#patternFill)"
                style={{ mixBlendMode: 'normal', opacity: pattern.opacity }}
              />
            )}

            {/* Neck collar */}
            <path
              d="M 115 50 C 120 62, 180 62, 185 50 Z"
              fill="rgba(0,0,0,0.1)"
              stroke="#000000"
              strokeWidth="2.5"
            />

            {/* Stitching Seams Overlay */}
            {stitchingEnabled && (
              <g stroke={stitchingColor} strokeWidth="2" strokeDasharray="4,4" fill="none" className="custom-seam-stitch">
                <path d="M 83 316 L 217 316" />
                <path d="M 258 212 L 285 192" />
                <path d="M 42 212 L 15 192" />
                {!isBack && <path d="M 140 60 L 150 72 L 160 60" strokeWidth="2" />}
              </g>
            )}
          </>
        );

      case 'tote':
        return (
          <>
            {/* Bag straps */}
            <path
              d="M 115 110 L 115 40 C 115 30, 135 20, 150 20 C 165 20, 185 30, 185 40 L 185 110"
              fill="none"
              stroke="#000000"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 115 110 L 115 40 C 115 30, 135 20, 150 20 C 165 20, 185 30, 185 40 L 185 110"
              fill="none"
              stroke={baseColor}
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Bag Main Body */}
            <rect
              id="garment-base"
              x="90"
              y="110"
              width="120"
              height="160"
              rx="2"
              fill={baseColor}
              stroke="#000000"
              strokeWidth={strokeWidth}
            />
            {pattern.type !== 'none' && (
              <rect
                x="90"
                y="110"
                width="120"
                height="160"
                rx="2"
                fill="url(#patternFill)"
                style={{ mixBlendMode: 'normal', opacity: pattern.opacity }}
              />
            )}

            {/* Stitching Seams Overlay */}
            {stitchingEnabled && (
              <g stroke={stitchingColor} strokeWidth="2" strokeDasharray="4,4" fill="none" className="custom-seam-stitch">
                <rect x="95" y="115" width="110" height="150" />
              </g>
            )}
          </>
        );

      case 'cap':
        return (
          <>
            {/* Cap Brim */}
            <path
              d="M 60 145 C 50 145, 40 160, 70 170 C 100 178, 150 178, 180 170 C 210 160, 200 145, 190 145 C 160 152, 90 152, 60 145 Z"
              fill="rgba(0,0,0,0.15)"
              stroke="#000000"
              strokeWidth="3"
            />
            
            {/* Cap Dome */}
            <path
              id="garment-base"
              d="M 70 145 C 60 100, 90 60, 125 60 C 160 60, 190 100, 180 145 Z"
              fill={baseColor}
              stroke="#000000"
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {pattern.type !== 'none' && (
              <path
                d="M 70 145 C 60 100, 90 60, 125 60 C 160 60, 190 100, 180 145 Z"
                fill="url(#patternFill)"
                style={{ mixBlendMode: 'normal', opacity: pattern.opacity }}
              />
            )}

            {/* Cap Brim Overlay */}
            <path
              d="M 60 145 C 50 145, 40 160, 70 170 C 100 178, 150 178, 180 170 C 210 160, 200 145, 190 145 C 160 152, 90 152, 60 145 Z"
              fill={baseColor}
              stroke="#000000"
              strokeWidth="2.5"
            />
            {pattern.type !== 'none' && (
              <path
                d="M 60 145 C 50 145, 40 160, 70 170 C 100 178, 150 178, 180 170 C 210 160, 200 145, 190 145 C 160 152, 90 152, 60 145 Z"
                fill="url(#patternFill)"
                style={{ mixBlendMode: 'normal', opacity: pattern.opacity }}
              />
            )}

            {/* Cap pane outline details */}
            <circle cx="125" cy="58" r="6" fill="#000000" />
            <path d="M 125 58 L 125 145 M 125 58 C 105 75, 85 105, 76 135 M 125 58 C 145 75, 165 105, 174 135" stroke="#000000" strokeWidth="1.5" fill="none" opacity="0.5" />

            {/* Stitching Seams Overlay */}
            {stitchingEnabled && (
              <g stroke={stitchingColor} strokeWidth="1.5" strokeDasharray="3,3" fill="none" className="custom-seam-stitch">
                <path d="M 62 148 C 90 155, 160 155, 188 148" />
                <path d="M 65 154 C 90 161, 160 161, 185 154" />
              </g>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const renderPatternDefinitions = () => {
    const { type, scale, rotation, color1, color2 } = pattern;
    const baseSize = 40 * scale;

    switch (type) {
      case 'checkerboard':
        return (
          <pattern
            id="patternFill"
            width={baseSize}
            height={baseSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <rect width={baseSize / 2} height={baseSize / 2} fill={color1} />
            <rect x={baseSize / 2} width={baseSize / 2} height={baseSize / 2} fill={color2} />
            <rect y={baseSize / 2} width={baseSize / 2} height={baseSize / 2} fill={color2} />
            <rect x={baseSize / 2} y={baseSize / 2} width={baseSize / 2} height={baseSize / 2} fill={color1} />
          </pattern>
        );

      case 'grid':
        return (
          <pattern
            id="patternFill"
            width={baseSize}
            height={baseSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <rect width={baseSize} height={baseSize} fill={color2} />
            <line x1="0" y1="0" x2={baseSize} y2="0" stroke={color1} strokeWidth={2.5 * scale} />
            <line x1="0" y1="0" x2="0" y2={baseSize} stroke={color1} strokeWidth={2.5 * scale} />
          </pattern>
        );

      case 'stripes':
        return (
          <pattern
            id="patternFill"
            width={baseSize}
            height={baseSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <rect width={baseSize / 2} height={baseSize} fill={color1} />
            <rect x={baseSize / 2} width={baseSize / 2} height={baseSize} fill={color2} />
          </pattern>
        );

      case 'dots':
        return (
          <pattern
            id="patternFill"
            width={baseSize}
            height={baseSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <rect width={baseSize} height={baseSize} fill={color2} />
            <circle cx={baseSize / 2} cy={baseSize / 2} r={baseSize / 4} fill={color1} />
          </pattern>
        );

      case 'camo':
        return (
          <pattern
            id="patternFill"
            width={baseSize * 2}
            height={baseSize * 2}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <rect width={baseSize * 2} height={baseSize * 2} fill={color2} />
            <path
              d={`M 10 10 Q 30 5, 40 25 T 70 30 T 60 70 T 20 60 Z`}
              fill={color1}
              transform={`scale(${scale})`}
              stroke="#000000"
              strokeWidth="1"
            />
            <path
              d={`M 80 80 Q 110 70, 120 100 T 150 110 T 130 140 T 90 120 Z`}
              fill={color1}
              transform={`scale(${scale})`}
              stroke="#000000"
              strokeWidth="1"
            />
          </pattern>
        );

      case 'tiedye':
        return (
          <pattern
            id="patternFill"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation}) scale(${scale})`}
          >
            <rect width="200" height="200" fill={color1} />
            <circle cx="100" cy="100" r="95" fill="none" stroke={color2} strokeWidth="15" />
            <circle cx="100" cy="100" r="70" fill="none" stroke={color1} strokeWidth="10" />
            <circle cx="100" cy="100" r="50" fill="none" stroke={color2} strokeWidth="15" />
            <path
              d="M 100 100 Q 120 50, 150 10 T 180 80 T 100 100 Z"
              fill={color2}
              opacity="0.6"
            />
            <path
              d="M 100 100 Q 50 120, 10 150 T 80 180 T 100 100 Z"
              fill="#000000"
              opacity="0.4"
            />
          </pattern>
        );

      case 'halftone':
        return (
          <pattern
            id="patternFill"
            width={baseSize}
            height={baseSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <rect width={baseSize} height={baseSize} fill={color2} />
            <circle cx={baseSize / 2} cy={baseSize / 2} r={baseSize * 0.4} fill={color1} />
            <circle cx="0" cy="0" r={baseSize * 0.25} fill={color1} />
            <circle cx={baseSize} cy="0" r={baseSize * 0.25} fill={color1} />
            <circle cx="0" cy={baseSize} r={baseSize * 0.25} fill={color1} />
            <circle cx={baseSize} cy={baseSize} r={baseSize * 0.25} fill={color1} />
          </pattern>
        );

      default:
        return null;
    }
  };

  const getPrintZoneBounds = () => {
    switch (garmentType) {
      case 'hoodie':
      case 'sweatshirt':
        return { x: '27%', y: '30%', width: '46%', height: '42%' };
      case 'tshirt':
        return { x: '27%', y: '25%', width: '46%', height: '52%' };
      case 'tote':
        return { x: '33%', y: '46%', width: '34%', height: '44%' };
      case 'cap':
        return { x: '35%', y: '40%', width: '30%', height: '30%' };
      default:
        return { x: '25%', y: '25%', width: '50%', height: '50%' };
    }
  };

  const printBounds = getPrintZoneBounds();

  return (
    <div 
      ref={containerRef}
      onClick={handleCanvasClick}
      className="relative w-full aspect-square max-w-[500px] mx-auto bg-white border-3 border-black rounded-none shadow-[6px_6px_0px_#000000] pop-grid-dense flex items-center justify-center p-6 select-none overflow-hidden"
    >
      <div className="absolute top-4 left-4 font-mono text-[9px] tracking-widest text-black/50 z-0">
        DESIGN WORKSPACE // POP-ART GATEWAY
      </div>

      <svg
        className="w-full h-full relative z-10"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {renderPatternDefinitions()}
        </defs>

        {/* Base garment layer */}
        {renderGarmentOutline()}

        {/* Safe print area */}
        <rect
          x={printBounds.x}
          y={printBounds.y}
          width={printBounds.width}
          height={printBounds.height}
          fill="none"
          stroke="#000000"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          opacity="0.4"
          className="pointer-events-none"
        />
        <text 
          x={printBounds.x} 
          y={parseFloat(printBounds.y) - 3 + '%'}
          fill="#000000" 
          fontSize="5" 
          fontWeight="bold"
          fontFamily="monospace"
          opacity="0.5"
        >
          SAFE PRINT AREA
        </text>
      </svg>

      {/* Interactive layer wrappers */}
      <div className="absolute inset-0 pointer-events-auto">
        {activeLayers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          const { id, type, x, y, scale, rotation, content } = layer;

          const baseWidth = type === 'emblem' ? 90 : 130;
          const baseHeight = type === 'emblem' ? 90 : 40;
          
          const width = baseWidth * scale;
          const height = baseHeight * scale;

          return (
            <div
              key={id}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                cursor: transformState.type === 'drag' ? 'grabbing' : 'grab',
                zIndex: isActive ? 40 : 20,
              }}
              onMouseDown={(e) => handleMouseDown(e, id, 'drag')}
              className={`absolute select-none flex items-center justify-center ${
                isActive ? 'border-2 border-black bg-white/20' : 'border border-transparent hover:border-black/30'
              }`}
            >
              {/* Emblem rendering with thick black borders */}
              {type === 'emblem' && (
                <div 
                  className={`w-full h-full relative flex items-center justify-center p-1 ${
                    (content as EmblemLayer).type === 'embroidery' ? 'border border-dashed border-black/40 bg-white/10' : ''
                  }`}
                >
                  <img
                    src={(content as EmblemLayer).url}
                    alt="emblem"
                    className="max-w-full max-h-full object-contain pointer-events-none select-none"
                  />
                  {(content as EmblemLayer).type === 'embroidery' && (
                    <div 
                      className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.1)_100%)]" 
                      style={{ 
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)` 
                      }} 
                    />
                  )}
                </div>
              )}

              {/* Text rendering */}
              {type === 'text' && (
                <div
                  className="w-full text-center select-none font-black uppercase overflow-hidden whitespace-nowrap text-ellipsis px-1"
                  style={{
                    fontFamily: (content as TextLayer).fontFamily,
                    color: (content as TextLayer).color,
                    fontSize: `${18 * scale}px`,
                    textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`,
                  }}
                >
                  {(content as TextLayer).text}
                </div>
              )}

              {/* Active selection handles */}
              {isActive && (
                <>
                  {/* Delete button - brutalist style */}
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      deleteLayer(id);
                    }}
                    className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-magenta text-white border-2 border-black rounded-none flex items-center justify-center shadow-[1px_1px_0px_#000000] hover:translate-y-[1px] hover:shadow-none pointer-events-auto"
                  >
                    <Trash2 size={12} className="stroke-[3px]" />
                  </button>

                  {/* Rotate handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, id, 'rotate')}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow text-black border-2 border-black rounded-full flex items-center justify-center shadow-[1px_1px_0px_#000000] cursor-alias pointer-events-auto"
                  >
                    <RotateCw size={10} className="stroke-[3px]" />
                  </div>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-black" />

                  {/* Corner scale handles - small yellow blocks */}
                  {['tl', 'tr', 'bl', 'br'].map((corner) => {
                    const cornerClasses = {
                      tl: '-top-1.5 -left-1.5 cursor-nwse-resize',
                      tr: '-top-1.5 -right-1.5 cursor-nesw-resize',
                      bl: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                      br: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                    }[corner];

                    return (
                      <div
                        key={corner}
                        onMouseDown={(e) => handleMouseDown(e, id, 'scale', corner as any)}
                        className={`absolute w-3.5 h-3.5 bg-cyan border-2 border-black rounded-none pointer-events-auto ${cornerClasses}`}
                      />
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 border-2 border-black rounded-none text-[9px] font-mono tracking-widest text-black font-bold shadow-[2px_2px_0px_#000000]">
        VIEW: {garmentView.toUpperCase()}
      </div>
    </div>
  );
}
