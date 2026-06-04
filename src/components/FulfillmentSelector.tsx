import React, { useState } from 'react';
import { GarmentType, PrintPartner, ProductDesign, EmblemLayer, TextLayer } from '../types/editor';
import { Truck, Calculator, ShieldCheck, Star, ArrowLeft, Check } from 'lucide-react';

interface FulfillmentSelectorProps {
  garmentType: GarmentType;
  emblems: EmblemLayer[];
  texts: TextLayer[];
  stitchingEnabled: boolean;
  patternType: string;
  onBack: () => void;
  onSaveProduct: (name: string, retailPrice: number, partnerId: string) => void;
}

const PRINT_PARTNERS: PrintPartner[] = [
  {
    id: 'partner-us-apex',
    name: 'Apex Print Hub',
    location: 'Austin, Texas (USA)',
    rating: 4.8,
    capabilities: ['DTG Print', 'Screen Print', 'Labeling'],
    baseGarmentCosts: {
      hoodie: 21.50,
      tshirt: 10.20,
      sweatshirt: 18.90,
      tote: 6.50,
      cap: 8.00
    },
    printCosts: {
      dtg: 3.50,
      embroidery: 5.50,
      patternSurcharge: 2.00
    },
    shippingCarrier: 'USPS / DHL',
    shippingCostBase: 4.99,
    shippingDays: '2-4 days',
    productionDays: '2-3 days'
  },
  {
    id: 'partner-uk-neon',
    name: 'Volt Threadworks',
    location: 'London (UK)',
    rating: 4.95,
    capabilities: ['Premium Embroidery', 'DTG Print', 'Custom Stitching'],
    baseGarmentCosts: {
      hoodie: 24.00,
      tshirt: 12.00,
      sweatshirt: 21.00,
      tote: 7.50,
      cap: 9.50
    },
    printCosts: {
      dtg: 4.00,
      embroidery: 4.50,
      patternSurcharge: 2.50
    },
    shippingCarrier: 'Royal Mail / DPD',
    shippingCostBase: 5.50,
    shippingDays: '1-3 days',
    productionDays: '3-4 days'
  },
  {
    id: 'partner-eu-cmyk',
    name: 'CMYK Lab Berlin',
    location: 'Berlin (Germany)',
    rating: 4.75,
    capabilities: ['DTG Print', 'Embroidery', 'Eco inks'],
    baseGarmentCosts: {
      hoodie: 22.00,
      tshirt: 11.00,
      sweatshirt: 19.50,
      tote: 6.80,
      cap: 8.50
    },
    printCosts: {
      dtg: 3.20,
      embroidery: 5.00,
      patternSurcharge: 1.80
    },
    shippingCarrier: 'Deutsche Post / DPD',
    shippingCostBase: 4.80,
    shippingDays: '2-4 days',
    productionDays: '2-4 days'
  },
  {
    id: 'partner-eu-baltic',
    name: 'Baltic Sublimation',
    location: 'Riga (Latvia)',
    rating: 4.6,
    capabilities: ['Sublimation', 'DTG Print', 'High volume Screen'],
    baseGarmentCosts: {
      hoodie: 19.80,
      tshirt: 9.00,
      sweatshirt: 17.00,
      tote: 5.50,
      cap: 7.20
    },
    printCosts: {
      dtg: 2.90,
      embroidery: 6.00,
      patternSurcharge: 1.50
    },
    shippingCarrier: 'Omniva / FedEx',
    shippingCostBase: 3.99,
    shippingDays: '3-5 days',
    productionDays: '3-5 days'
  }
];

const SHIPPING_UPGRADES = [
  { id: 'standard', name: 'Standard Carrier Delivery', priceDelta: 0, label: 'Base Rate' },
  { id: 'expedited', name: 'DHL Express Tracked', priceDelta: 6.50, label: '1-2 Days Guaranteed (+$6.50)' }
];

export default function FulfillmentSelector({
  garmentType,
  emblems,
  texts,
  stitchingEnabled,
  patternType,
  onBack,
  onSaveProduct,
}: FulfillmentSelectorProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(PRINT_PARTNERS[0].id);
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'expedited'>('standard');
  const [retailPrice, setRetailPrice] = useState<number>(45);
  const [productName, setProductName] = useState<string>('My Custom Brand Design');

  const selectedPartner = PRINT_PARTNERS.find(p => p.id === selectedPartnerId) || PRINT_PARTNERS[0];

  const calculateCosts = (partner: PrintPartner) => {
    const garmentBase = partner.baseGarmentCosts[garmentType];
    const patternCost = patternType !== 'none' ? partner.printCosts.patternSurcharge : 0;
    const emblemCost = emblems.reduce((total, emblem) => {
      return total + (emblem.type === 'embroidery' ? partner.printCosts.embroidery : partner.printCosts.dtg);
    }, 0);
    const textCost = texts.length * 1.50; 
    const stitchingCost = stitchingEnabled ? 1.50 : 0;

    const baseCostTotal = garmentBase + patternCost + emblemCost + textCost + stitchingCost;
    const shippingCost = partner.shippingCostBase + (selectedShipping === 'expedited' ? 6.50 : 0);
    const platformFee = Number((retailPrice * 0.05).toFixed(2));
    const netProfit = Number((retailPrice - baseCostTotal - shippingCost - platformFee).toFixed(2));
    const profitMarginPercentage = Number(((netProfit / retailPrice) * 100).toFixed(1));

    return {
      garmentBase,
      patternCost,
      emblemCost,
      textCost,
      stitchingCost,
      baseCostTotal,
      shippingCost,
      platformFee,
      netProfit,
      profitMarginPercentage
    };
  };

  const costs = calculateCosts(selectedPartner);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    onSaveProduct(productName, retailPrice, selectedPartnerId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fadeIn text-black space-y-8 bg-white border-3 border-black shadow-[5px_5px_0px_#000] p-6">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white border-2 border-black hover:bg-gray-bg text-black transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider italic">Fulfillment Partners</h1>
            <p className="text-xs font-mono text-black/60 uppercase mt-1">Route your designed items to print shops & shipping providers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000]">
          <ShieldCheck className="w-4 h-4 text-black stroke-[2.5px]" />
          <span className="text-xs font-mono tracking-wider font-bold uppercase">SECURED MERCHANT SYSTEM</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Print Partners selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-black">1. Select E-Commerce Printer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRINT_PARTNERS.map((partner) => {
                const partnerCosts = calculateCosts(partner);
                const isSelected = partner.id === selectedPartnerId;

                return (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className={`p-4 border-2 border-black rounded-none cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-yellow shadow-[4px_4px_0px_#000000]'
                        : 'bg-white hover:bg-gray-bg'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 border-b border-black/10 pb-1.5">
                        <span className="text-sm font-mono font-black uppercase">{partner.name}</span>
                        <div className="flex items-center gap-1 text-black font-bold font-mono text-xs">
                          <Star className="w-3.5 h-3.5 fill-black text-black" />
                          <span>{partner.rating.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <p className="text-[9px] font-mono text-black/60 uppercase mb-3 font-bold">{partner.location}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {partner.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            className="text-[8px] font-mono uppercase px-2 py-0.5 border border-black bg-white font-bold"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-black pt-3 flex items-center justify-between font-mono">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-black/60 uppercase font-bold">Base Manufacture</span>
                        <span className="text-xs font-bold">${partnerCosts.baseCostTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-black/60 uppercase font-bold">Shipping Speed</span>
                        <span className="text-xs font-bold uppercase">{partner.shippingDays}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping option */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-black">2. Select Shipping Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHIPPING_UPGRADES.map((ship) => (
                <div
                  key={ship.id}
                  onClick={() => setSelectedShipping(ship.id as any)}
                  className={`p-4 border-2 border-black rounded-none cursor-pointer transition-all flex items-center justify-between ${
                    selectedShipping === ship.id
                      ? 'bg-cyan shadow-[3px_3px_0px_#000]'
                      : 'bg-white hover:bg-gray-bg'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-black shrink-0 stroke-[2px]" />
                    <div className="flex flex-col font-mono">
                      <span className="text-xs font-bold uppercase">{ship.name}</span>
                      <span className="text-[9px] text-black/60 uppercase font-bold mt-0.5">Carrier: {selectedPartner.shippingCarrier}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold">{ship.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profit margins sheet */}
        <div className="space-y-6">
          <div className="p-6 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000] space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-black font-mono font-bold uppercase">
              <Calculator className="w-4 h-4" />
              <span>Calculations</span>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-mono text-black/60 uppercase font-bold">List Product Title</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="E.g. Custom Canvas Sweatshirt"
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-none text-xs font-mono text-black focus:outline-none uppercase"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-black uppercase font-bold">
                <span>Configure Price</span>
                <span>${retailPrice} USD</span>
              </div>
              <input
                type="range"
                min={Math.ceil(costs.baseCostTotal + costs.shippingCost + 5)}
                max="120"
                step="1"
                value={retailPrice}
                onChange={(e) => setRetailPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-bg border border-black rounded-none appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-black/55 font-bold">
                <span>min: ${Math.ceil(costs.baseCostTotal + costs.shippingCost + 5)}</span>
                <span>max: $120</span>
              </div>
            </div>

            <div className="space-y-2 border-t-2 border-b-2 border-black py-4 font-mono text-xs text-black/80">
              <div className="flex justify-between">
                <span>Base Garment Cost:</span>
                <span className="font-bold">${costs.garmentBase.toFixed(2)}</span>
              </div>
              {costs.patternCost > 0 && (
                <div className="flex justify-between">
                  <span>Surface Print Inks:</span>
                  <span className="font-bold">+${costs.patternCost.toFixed(2)}</span>
                </div>
              )}
              {costs.emblemCost > 0 && (
                <div className="flex justify-between">
                  <span>Decal Placements:</span>
                  <span className="font-bold">+${costs.emblemCost.toFixed(2)}</span>
                </div>
              )}
              {costs.textCost > 0 && (
                <div className="flex justify-between">
                  <span>Lettering Blocks:</span>
                  <span className="font-bold">+${costs.textCost.toFixed(2)}</span>
                </div>
              )}
              {costs.stitchingCost > 0 && (
                <div className="flex justify-between">
                  <span>Contrast Seams:</span>
                  <span className="font-bold">+${costs.stitchingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-black pt-2 font-black text-black">
                <span>Total Printing:</span>
                <span>${costs.baseCostTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Shipping Fee:</span>
                <span className="font-bold">+${costs.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Middleman Fee (5%):</span>
                <span className="font-bold">+${costs.platformFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-gray-bg border-2 border-black shadow-[2px_2px_0px_#000]">
                <div className="flex flex-col font-mono">
                  <span className="text-[9px] text-black/60 uppercase font-bold">Your Profit</span>
                  <span className="text-xl font-black mt-0.5">
                    ${costs.netProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col text-right font-mono">
                  <span className="text-[9px] text-black/60 uppercase font-bold">Margin</span>
                  <span className="text-sm font-black mt-1">
                    {costs.profitMarginPercentage}%
                  </span>
                </div>
              </div>

              {costs.netProfit < 0 ? (
                <div className="p-3 bg-magenta/10 border border-magenta text-[9px] font-mono uppercase font-bold text-center">
                  Error: Price too low. Increase pricing to cover baseline costs.
                </div>
              ) : (
                <div className="p-3 bg-cyan/15 border border-cyan text-[9px] font-mono uppercase font-bold text-center">
                  Profit margins safe. Ready to publish.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={costs.netProfit < 0}
              className="w-full py-4 bg-yellow hover:bg-yellow/95 disabled:bg-gray-bg disabled:text-black/40 text-black border-3 border-black font-mono text-xs font-bold tracking-widest uppercase shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]"
            >
              List & Sync to Store
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
