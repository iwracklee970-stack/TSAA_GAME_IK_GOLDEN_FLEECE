export type GarmentType = 'hoodie' | 'tshirt' | 'sweatshirt' | 'tote' | 'cap';

export type GarmentView = 'front' | 'back';

export type PatternType = 'none' | 'checkerboard' | 'grid' | 'stripes' | 'dots' | 'camo' | 'tiedye' | 'halftone';

export interface PatternSettings {
  type: PatternType;
  scale: number;      // 0.2 to 3
  rotation: number;   // 0 to 360
  opacity: number;    // 0 to 1
  color1: string;     // Hex color (CMYK)
  color2: string;     // Hex color (CMYK)
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'difference';
}

export type EmblemType = 'print' | 'embroidery';

export interface EmblemLayer {
  id: string;
  name: string;
  url: string;        // SVG, preset path, or uploaded image base64
  x: number;          // percent coordinates on active zone (0 - 100)
  y: number;          // percent coordinates on active zone (0 - 100)
  scale: number;      // scale multiplier (0.1 to 3)
  rotation: number;   // rotation angle in degrees
  type: EmblemType;
  placement: GarmentView; // placement view
  threadColors?: string[]; // for embroidery
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;          // percent coordinates (0 - 100)
  y: number;
  scale: number;      // scale multiplier
  rotation: number;   // rotation in degrees
  fontFamily: string;
  color: string;      // CMYK Hex
  placement: GarmentView;
}

export interface StitchingSettings {
  enabled: boolean;
  color: string;      // Hex color
  style: 'double' | 'single' | 'overlock';
}

export interface ProductDesign {
  id: string;
  name: string;
  garmentType: GarmentType;
  baseColor: string;  // Hex color
  pattern: PatternSettings;
  emblems: EmblemLayer[];
  texts: TextLayer[];
  stitching: StitchingSettings;
  retailPrice: number;
  selectedPartnerId: string;
  mockupUrl?: string;
  createdAt: string;
}

export interface PrintPartner {
  id: string;
  name: string;
  location: string;
  rating: number;
  capabilities: string[];
  baseGarmentCosts: Record<GarmentType, number>;
  printCosts: {
    dtg: number;
    embroidery: number;
    patternSurcharge: number;
  };
  shippingCarrier: string;
  shippingCostBase: number;
  shippingDays: string;
  productionDays: string;
}

export interface SimulatedOrder {
  id: string;
  designId: string;
  productName: string;
  garmentType: GarmentType;
  customerName: string;
  customerAddress: string;
  date: string;
  status: 'pending' | 'printing' | 'shipping' | 'delivered';
  retailPrice: number;
  baseCost: number;
  shippingCost: number;
  profit: number;
  trackingNumber?: string;
}
