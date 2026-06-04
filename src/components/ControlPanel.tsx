import React, { useState, useRef } from 'react';
import { GarmentType, GarmentView, PatternSettings, EmblemLayer, TextLayer, PatternType, EmblemType } from '../types/editor';
import { Upload, Plus, Layers, Image as ImageIcon, Type, Sparkles, Check, Scissors, ChevronRight, AlertTriangle } from 'lucide-react';

// Flat vectors representing Reference Image 2 illustrations & stickers
const PRESET_EMBLEMS = [
  {
    name: 'Asterisk Black/Yellow',
    type: 'print' as const,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="black" transform="rotate(-25 50 50)"/>
        <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="black" transform="rotate(35 50 50)"/>
        <rect x="46" y="16" width="8" height="68" fill="black" transform="rotate(5 50 50)"/>
        <circle cx="34" cy="30" r="14" fill="black"/>
        <circle cx="34" cy="30" r="10" fill="%23ffff00"/>
        <circle cx="34" cy="30" r="4" fill="black"/>
      </svg>
    `)}`
  },
  {
    name: 'Asterisk Black/Cyan',
    type: 'print' as const,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="black" transform="rotate(-25 50 50)"/>
        <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="black" transform="rotate(35 50 50)"/>
        <rect x="46" y="16" width="8" height="68" fill="black" transform="rotate(5 50 50)"/>
        <circle cx="34" cy="30" r="14" fill="black"/>
        <circle cx="34" cy="30" r="10" fill="%2300ffff"/>
        <circle cx="34" cy="30" r="4" fill="black"/>
      </svg>
    `)}`
  },
  {
    name: 'Asterisk Black/Magenta',
    type: 'print' as const,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="black" transform="rotate(-25 50 50)"/>
        <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="black" transform="rotate(35 50 50)"/>
        <rect x="46" y="16" width="8" height="68" fill="black" transform="rotate(5 50 50)"/>
        <circle cx="34" cy="30" r="14" fill="black"/>
        <circle cx="34" cy="30" r="10" fill="%23ff00ff"/>
        <circle cx="34" cy="30" r="4" fill="black"/>
      </svg>
    `)}`
  },
  {
    name: 'Asterisk White/Black',
    type: 'print' as const,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="black" stroke-width="2.5" stroke-linejoin="round">
          <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="white" transform="rotate(-25 50 50)"/>
          <path d="M16 46 L84 46 L84 54 L16 54 Z" fill="white" transform="rotate(35 50 50)"/>
          <rect x="46" y="16" width="8" height="68" fill="white" transform="rotate(5 50 50)"/>
        </g>
        <circle cx="34" cy="30" r="14" fill="white" stroke="black" stroke-width="2"/>
        <circle cx="34" cy="30" r="10" fill="black"/>
        <circle cx="34" cy="30" r="4" fill="white"/>
      </svg>
    `)}`
  },
  {
    name: 'CMYK Dial Wedge',
    type: 'print' as const,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="42" fill="black"/>
        <path d="M50 50 L50 8 A42 42 0 0 1 92 50 Z" fill="%2300ffff"/>
        <path d="M50 50 L8 50 A42 42 0 0 1 50 8 Z" fill="%23ff00ff" opacity="0.3"/>
        <circle cx="50" cy="50" r="15" fill="white" stroke="black" stroke-width="3"/>
        <path d="M50 50 L60 40" stroke="black" stroke-width="3"/>
      </svg>
    `)}`
  },
  {
    name: 'Interlocking Gears Cluster',
    type: 'embroidery' as const,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="black" stroke-width="2" stroke-linejoin="round">
          {/* Top Yellow Gear */}
          <circle cx="50" cy="45" r="20" fill="%23ffff00"/>
          <path d="M50 20 L50 15 M70 45 L75 45 M30 45 L25 45 M50 70 L50 75" stroke="black" stroke-width="3"/>
          <circle cx="50" cy="45" r="7" fill="white"/>
          
          {/* Right Cyan Gear */}
          <circle cx="95" cy="55" r="20" fill="%2300ffff"/>
          <path d="M95 30 L95 25 M115 55 L120 55 M75 55 L70 55 M95 80 L95 85" stroke="black" stroke-width="3"/>
          <circle cx="95" cy="55" r="7" fill="white"/>
          
          {/* Left Magenta Gear */}
          <circle cx="45" cy="90" r="20" fill="%23ff00ff"/>
          <path d="M45 65 L45 60 M65 90 L70 90 M25 90 L20 90 M45 115 L45 120" stroke="black" stroke-width="3"/>
          <circle cx="45" cy="90" r="7" fill="white"/>

          {/* Bottom White Gear */}
          <circle cx="90" cy="100" r="20" fill="white"/>
          <path d="M90 75 L90 70 M110 100 L115 100 M70 100 L65 100 M90 125 L90 130" stroke="black" stroke-width="3"/>
          <circle cx="90" cy="100" r="7" fill="black"/>
        </g>
      </svg>
    `)}`
  }
];

const GARMENT_TYPES = [
  { id: 'hoodie', label: 'Hoodie', baseCost: '$21.50' },
  { id: 'tshirt', label: 'T-Shirt', baseCost: '$10.20' },
  { id: 'sweatshirt', label: 'Sweatshirt', baseCost: '$18.90' },
  { id: 'tote', label: 'Tote Bag', baseCost: '$6.50' },
  { id: 'cap', label: 'Cap', baseCost: '$8.00' }
] as const;

const BASE_COLOR_PRESETS = [
  { hex: '#ffff00', label: 'Y - Process Yellow' },
  { hex: '#000000', label: 'K - Rich Black' },
  { hex: '#00ffff', label: 'C - Process Cyan' },
  { hex: '#ff00ff', label: 'M - Process Magenta' },
  { hex: '#ffffff', label: 'W - Pure White' },
  { hex: '#e5e7eb', label: 'G - Cool Gray' }
];

const STITCH_COLOR_PRESETS = [
  { hex: '#000000', label: 'Black' },
  { hex: '#ffffff', label: 'White' },
  { hex: '#00ffff', label: 'Cyan' },
  { hex: '#ff00ff', label: 'Magenta' },
  { hex: '#ffff00', label: 'Yellow' }
];

const PATTERN_TYPES: { id: PatternType; label: string }[] = [
  { id: 'none', label: 'No Pattern' },
  { id: 'checkerboard', label: 'Checker' },
  { id: 'grid', label: 'Pop Grid' },
  { id: 'stripes', label: 'Solid Stripes' },
  { id: 'dots', label: 'Dotted Half' },
  { id: 'camo', label: 'Swiss Camo' },
  { id: 'tiedye', label: 'Pop Tie-Dye' },
  { id: 'halftone', label: 'CMYK Offset' }
];

const BLEND_MODES = [
  { id: 'normal', label: 'Flat Print' },
  { id: 'multiply', label: 'Multiply Blend' },
  { id: 'overlay', label: 'Overlay Blend' }
];

interface ControlPanelProps {
  garmentType: GarmentType;
  setGarmentType: (type: GarmentType) => void;
  garmentView: GarmentView;
  setGarmentView: (view: GarmentView) => void;
  baseColor: string;
  setBaseColor: (color: string) => void;
  pattern: PatternSettings;
  setPattern: (pattern: PatternSettings) => void;
  emblems: EmblemLayer[];
  addEmblem: (url: string, name: string, type: EmblemType) => void;
  texts: TextLayer[];
  addText: (text: string, fontFamily: string, color: string) => void;
  stitchingEnabled: boolean;
  setStitchingEnabled: (enabled: boolean) => void;
  stitchingColor: string;
  setStitchingColor: (color: string) => void;
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  deleteLayer: (id: string) => void;
  updateEmblem: (id: string, updates: Partial<EmblemLayer>) => void;
  updateText: (id: string, updates: Partial<TextLayer>) => void;
  onProceedToFulfillment: () => void;
}

export default function ControlPanel({
  garmentType,
  setGarmentType,
  garmentView,
  setGarmentView,
  baseColor,
  setBaseColor,
  pattern,
  setPattern,
  emblems,
  addEmblem,
  texts,
  addText,
  stitchingEnabled,
  setStitchingEnabled,
  stitchingColor,
  setStitchingColor,
  activeLayerId,
  setActiveLayerId,
  deleteLayer,
  updateEmblem,
  updateText,
  onProceedToFulfillment,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'garment' | 'pattern' | 'emblems' | 'text' | 'layers'>('garment');
  const [newText, setNewText] = useState('');
  const [newFont, setNewFont] = useState('sans-serif');
  const [newTextColor, setNewTextColor] = useState('#000000');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addEmblem(event.target.result as string, file.name.substring(0, 12), 'print');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    if (!newText.trim()) return;
    addText(newText, newFont, newTextColor);
    setNewText('');
  };

  const updatePatternConfig = (updates: Partial<PatternSettings>) => {
    setPattern({ ...pattern, ...updates });
  };

  return (
    <div className="w-full flex flex-col h-full bg-white brutalist-border shadow-[4px_4px_0px_#000000] overflow-hidden">
      
      {/* Tab Switch View Header */}
      <div className="p-4 border-b-3 border-black flex items-center justify-between bg-gray-bg">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-black" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-black">DESIGN CONTROLS</span>
        </div>
        <div className="flex bg-white p-0.5 border-2 border-black rounded-none">
          <button
            onClick={() => setGarmentView('front')}
            className={`px-3 py-1 text-xs font-mono tracking-widest uppercase transition-all ${
              garmentView === 'front' ? 'bg-black text-white font-bold' : 'text-black hover:bg-gray-bg'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setGarmentView('back')}
            className={`px-3 py-1 text-xs font-mono tracking-widest uppercase transition-all ${
              garmentView === 'back' ? 'bg-black text-white font-bold' : 'text-black hover:bg-gray-bg'
            }`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Tabs navigation icons */}
      <div className="flex border-b-3 border-black bg-white">
        {(['garment', 'pattern', 'emblems', 'text', 'layers'] as const).map((tab) => {
          const tabLabels = {
            garment: 'Base',
            pattern: 'Pattern',
            emblems: 'Stickers',
            text: 'Text',
            layers: 'Layers'
          };
          const tabIcons = {
            garment: <Scissors className="w-4 h-4" />,
            pattern: <Sparkles className="w-4 h-4" />,
            emblems: <ImageIcon className="w-4 h-4" />,
            text: <Type className="w-4 h-4" />,
            layers: <Layers className="w-4 h-4" />
          };

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-1 flex flex-col items-center gap-1 border-r border-black border-r-3 last:border-r-0 text-[9px] font-mono tracking-wider uppercase transition-all ${
                activeTab === tab 
                  ? 'bg-yellow text-black font-black border-b-3 border-b-yellow' 
                  : 'text-black hover:bg-gray-bg border-b-3 border-b-transparent'
              }`}
            >
              {tabIcons[tab]}
              <span>{tabLabels[tab]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[380px] md:max-h-[unset] bg-white">
        
        {/* PANEL 1: BASE CONFIGS */}
        {activeTab === 'garment' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest uppercase text-black font-bold">1. Select Garment</label>
              <div className="grid grid-cols-2 gap-2">
                {GARMENT_TYPES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGarmentType(g.id)}
                    className={`p-3 text-left border-2 border-black rounded-none transition-all flex flex-col justify-between ${
                      garmentType === g.id
                        ? 'bg-cyan shadow-[2px_2px_0px_#000000] text-black font-bold'
                        : 'bg-white hover:bg-gray-bg text-black'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold uppercase">{g.label}</span>
                    <span className="text-[9px] font-mono text-black/60 mt-1 uppercase">Base Cost: {g.baseCost}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono tracking-widest uppercase text-black font-bold">2. Fabric Color</label>
              <div className="grid grid-cols-3 gap-2">
                {BASE_COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setBaseColor(color.hex)}
                    className={`p-2 border-2 border-black rounded-none text-[9px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                      baseColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'bg-white shadow-[2px_2px_0px_#000000] ring-2 ring-yellow'
                        : 'bg-white hover:bg-gray-bg'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 border border-black inline-block" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate">{color.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="color" 
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-8 h-8 rounded-none border-2 border-black bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono uppercase text-black">CUSTOM HEX: {baseColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="border-t-2 border-black pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-mono uppercase text-black">Contrast Stitching Seams</span>
                  <span className="text-[9px] font-mono text-black/60">Colored contrast threads (+ $1.50)</span>
                </div>
                <input
                  type="checkbox"
                  checked={stitchingEnabled}
                  onChange={(e) => setStitchingEnabled(e.target.checked)}
                  className="w-5 h-5 border-2 border-black accent-black rounded-none cursor-pointer"
                />
              </div>

              {stitchingEnabled && (
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-black/60 uppercase">Thread Color</label>
                  <div className="flex gap-2">
                    {STITCH_COLOR_PRESETS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setStitchingColor(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-6 h-6 rounded-none border-2 border-black transition-all ${
                          stitchingColor.toLowerCase() === color.hex.toLowerCase()
                            ? 'ring-2 ring-yellow scale-110 shadow-[1px_1px_0px_#000]'
                            : 'hover:scale-105'
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 2: PATTERNS */}
        {activeTab === 'pattern' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest uppercase text-black font-bold">Repeating Inks</label>
              <div className="grid grid-cols-2 gap-2">
                {PATTERN_TYPES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => updatePatternConfig({ type: p.id })}
                    className={`p-2.5 text-left border-2 border-black rounded-none font-mono text-xs uppercase transition-all ${
                      pattern.type === p.id
                        ? 'bg-magenta text-white font-bold shadow-[2px_2px_0px_#000000]'
                        : 'bg-white hover:bg-gray-bg text-black'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {pattern.type !== 'none' && (
              <div className="space-y-4 border-t-2 border-black pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-black/60 uppercase">Ink Color A</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pattern.color1}
                        onChange={(e) => updatePatternConfig({ color1: e.target.value })}
                        className="w-7 h-7 rounded-none border-2 border-black bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono uppercase text-black/70">{pattern.color1}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-black/60 uppercase">Ink Color B</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pattern.color2}
                        onChange={(e) => updatePatternConfig({ color2: e.target.value })}
                        className="w-7 h-7 rounded-none border-2 border-black bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono uppercase text-black/70">{pattern.color2}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-black uppercase font-bold">
                    <span>Pattern Scale</span>
                    <span>{Math.round(pattern.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={pattern.scale}
                    onChange={(e) => updatePatternConfig({ scale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-bg border border-black rounded-none appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-black uppercase font-bold">
                    <span>Pattern Angle</span>
                    <span>{pattern.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={pattern.rotation}
                    onChange={(e) => updatePatternConfig({ rotation: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-bg border border-black rounded-none appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-black uppercase font-bold">
                    <span>Ink Transparency</span>
                    <span>{Math.round(pattern.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={pattern.opacity}
                    onChange={(e) => updatePatternConfig({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-bg border border-black rounded-none appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 3: STICKERS */}
        {activeTab === 'emblems' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-widest uppercase text-black font-bold">Upload Custom Emblem</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-black bg-gray-bg/20 hover:bg-gray-bg rounded-none flex flex-col items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-5 h-5 text-black" />
                <span className="text-xs font-mono font-bold text-black uppercase">Choose Custom Graphic</span>
                <span className="text-[8px] font-mono text-black/50">PNG / SVG transparent image files</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-3 pt-3 border-t-2 border-black">
              <span className="text-xs font-mono tracking-widest uppercase text-black font-bold">Illustrations & Stickers</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_EMBLEMS.map((emblem, idx) => (
                  <button
                    key={idx}
                    onClick={() => addEmblem(emblem.url, emblem.name, emblem.type)}
                    className="p-2 bg-white border-2 border-black rounded-none flex flex-col items-center justify-center hover:bg-gray-bg hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#000] transition-all relative"
                  >
                    <img src={emblem.url} alt={emblem.name} className="w-10 h-10 object-contain" />
                    <span className="text-[7px] font-mono mt-2 text-black/80 font-bold uppercase truncate max-w-full">{emblem.name.replace('Asterisk ', '')}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 bg-yellow/10 border border-yellow/40 p-3">
              <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div className="text-[9px] font-mono text-black leading-relaxed">
                ASSETS REPLICATE THE MINIMALIST CMYK DECALS SHOWN IN STICKERS SHEET REFERENCE.
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: TEXT TILES */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest uppercase text-black font-bold">Custom Wording Layer</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="ENTER GRAPHIC TEXT"
                rows={2}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-none text-xs font-mono text-black placeholder:text-black/35 focus:outline-none uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-black/60 uppercase font-bold">Font Style</span>
                <select
                  value={newFont}
                  onChange={(e) => setNewFont(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border-2 border-black text-xs font-mono text-black focus:outline-none"
                >
                  <option value="sans-serif">Space Sans</option>
                  <option value="monospace">Space Mono</option>
                  <option value="Impact">Impact Block</option>
                  <option value="Courier New">Courier Retro</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-black/60 uppercase font-bold">Text Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTextColor}
                    onChange={(e) => setNewTextColor(e.target.value)}
                    className="w-8 h-8 rounded-none border-2 border-black bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-mono uppercase text-black/70">{newTextColor}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddText}
              className="w-full py-3 bg-cyan hover:bg-cyan/90 text-black border-3 border-black font-mono text-xs font-bold uppercase transition-all shadow-[3px_3px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000000] active:translate-y-[2px]"
            >
              Add Wording
            </button>
          </div>
        )}

        {/* PANEL 5: LAYERS */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-black font-bold">Layer Stack</span>
            
            {emblems.length === 0 && texts.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-black/30 bg-gray-bg/10">
                <span className="text-xs font-mono text-black/50">Stack is empty. Add a text or decal.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {emblems.map((emblem) => (
                  <div
                    key={emblem.id}
                    onClick={() => setActiveLayerId(emblem.id)}
                    className={`p-3 border-2 transition-all flex items-center justify-between cursor-pointer ${
                      activeLayerId === emblem.id
                        ? 'border-black bg-yellow shadow-[2px_2px_0px_#000]'
                        : 'border-black bg-white hover:bg-gray-bg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={emblem.url} alt={emblem.name} className="w-8 h-8 object-contain bg-gray-bg p-0.5 border border-black" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold font-mono truncate max-w-[120px] uppercase">{emblem.name}</span>
                        <span className="text-[8px] font-mono text-black/60 uppercase">
                          {emblem.type} / {emblem.placement} / S:{Math.round(emblem.scale * 100)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(emblem.id);
                      }}
                      className="p-1 hover:text-magenta transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  </div>
                ))}

                {texts.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveLayerId(t.id)}
                    className={`p-3 border-2 transition-all flex items-center justify-between cursor-pointer ${
                      activeLayerId === t.id
                        ? 'border-black bg-yellow shadow-[2px_2px_0px_#000]'
                        : 'border-black bg-white hover:bg-gray-bg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Type className="w-6 h-6 text-black shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold font-mono truncate max-w-[120px] uppercase">{t.text}</span>
                        <span className="text-[8px] font-mono text-black/60 uppercase">
                          TEXT / {t.placement} / {t.fontFamily}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(t.id);
                      }}
                      className="p-1 hover:text-magenta transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Select Print Partner redirection button */}
      <div className="p-4 bg-gray-bg border-t-3 border-black flex gap-3">
        <button
          onClick={onProceedToFulfillment}
          className="flex-1 py-3 bg-cyan hover:bg-cyan/95 text-black border-3 border-black font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]"
        >
          <span>Select Print Partner</span>
          <ChevronRight className="w-4 h-4 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
}

function Trash2({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-9 5v6m4-6v6" />
    </svg>
  );
}
