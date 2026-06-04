import React from 'react';
import Logo from './Logo';
import { ArrowRight, Globe, Layers, Zap, ShoppingCart } from 'lucide-react';

interface LandingPageProps {
  onStartCustomizer: () => void;
  onViewDashboard: () => void;
}

export default function LandingPage({ onStartCustomizer, onViewDashboard }: LandingPageProps) {
  return (
    <div className="w-full min-h-screen bg-gray-bg relative overflow-hidden flex flex-col text-black font-sans">
      {/* Light Pop Art Grid Background */}
      <div className="absolute inset-0 pop-grid opacity-50 pointer-events-none z-0" />
      
      {/* Top Navigation Bar */}
      <nav className="w-full px-6 py-4 border-b-3 border-black bg-white relative z-10 flex justify-between items-center max-w-6xl mx-auto rounded-none mt-4 shadow-[4px_4px_0px_#000]">
        <Logo size={36} />
        <div className="flex items-center gap-6">
          <button
            onClick={onViewDashboard}
            className="text-xs font-mono font-bold tracking-widest uppercase text-black hover:underline"
          >
            Dashboard
          </button>
          <button
            onClick={onStartCustomizer}
            className="px-4 py-2 bg-yellow hover:bg-yellow/95 text-black border-2 border-black font-mono text-xs uppercase font-bold rounded-none shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] transition-all"
          >
            Launch Creator
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 z-10 max-w-6xl mx-auto py-12 lg:py-20 gap-12 relative">
        
        {/* Left Column: Title & Intro */}
        <div className="flex-1 text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow border-2 border-black font-mono font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            <Zap className="w-3 h-3 fill-black text-black" />
            <span>Zero Inventory dropshipping</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-none tracking-tight">
            CUSTOM CLOTHING <br />
            <span className="bg-magenta text-white px-2 py-0.5 border-2 border-black inline-block mt-1 transform rotate-[-1deg] shadow-[4px_4px_0px_#000]">
              DESIGN PORTAL
            </span>
          </h1>

          <p className="text-xs md:text-sm font-mono text-black/75 uppercase leading-relaxed font-bold">
            Combine clothing with customization, print-ready CMYK colors, and global print fulfillment. Connect with production partners to dropship your brand.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onStartCustomizer}
              className="px-6 py-4 bg-cyan hover:bg-cyan/95 text-black border-3 border-black font-mono text-xs font-black uppercase shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Customizer</span>
              <ArrowRight className="w-4 h-4 stroke-[3px]" />
            </button>
            
            <button
              onClick={onViewDashboard}
              className="px-6 py-4 bg-white hover:bg-gray-bg text-black border-3 border-black font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] transition-all"
            >
              Merchant Dashboard
            </button>
          </div>
        </div>

        {/* Right Column: Clothes Rack Mockup (SVG Recreation of Reference Image 1) */}
        <div className="flex-1 w-full max-w-lg bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-4 flex flex-col items-center justify-center relative overflow-hidden h-[340px] select-none">
          
          {/* Reference Image Background blocks & circles */}
          <div className="absolute inset-0 z-0 flex flex-col justify-end pointer-events-none">
            {/* Color Strip bars at the bottom */}
            <div className="w-full h-1/4 flex">
              <div className="flex-1 bg-yellow" />
              <div className="flex-1 bg-black" />
              <div className="flex-1 bg-cyan" />
              <div className="flex-1 bg-magenta" />
            </div>
          </div>
          
          {/* Circular shapes floating on the background */}
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-magenta/90 z-0 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-yellow/90 z-0 pointer-events-none" />
          <div className="absolute top-28 left-20 w-36 h-36 rounded-full bg-cyan/95 z-0 pointer-events-none" />
          <div className="absolute top-24 right-12 w-28 h-28 rounded-full bg-magenta/95 z-0 pointer-events-none" />

          {/* Hangers and Shirts Vectors */}
          <div className="w-full relative z-10 flex flex-col items-center justify-center h-full pb-8">
            
            {/* Clothes Rack Steel Rod Bar */}
            <div className="w-[105%] h-5 bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400 border-2 border-black z-30 absolute top-12" />
            
            {/* Clothes list wrapper */}
            <div className="w-full flex justify-between px-4 absolute top-12 left-0 right-0 z-20">
              
              {/* SHIRT 1: YELLOW */}
              <div className="flex flex-col items-center w-1/4 relative top-1">
                {/* Hanger hook */}
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M25 15 C20 10, 20 2, 25 2 C30 2, 30 10, 25 12" stroke="black" strokeWidth="2.5" />
                  <path d="M8 25 L25 12 L42 25" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {/* Garment Block */}
                <div className="w-20 h-28 bg-yellow border-2 border-black rounded-none flex items-center justify-center relative shadow-[2px_2px_0px_rgba(0,0,0,0.15)] mt-[-4px]">
                  {/* Short sleeves */}
                  <div className="absolute left-[-10px] top-0 w-4 h-12 bg-yellow border-2 border-black border-r-0 transform rotate-[-20deg]" />
                  <div className="absolute right-[-10px] top-0 w-4 h-12 bg-yellow border-2 border-black border-l-0 transform rotate([20deg])" />
                  
                  {/* Black Asterisk logo on yellow shirt */}
                  <div className="relative z-10 scale-45">
                    <svg width="45" height="45" viewBox="0 0 200 200" fill="none">
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(-25 100 106)" fill="black" />
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(35 100 106)" fill="black" />
                      <rect x="84" y="35" width="32" height="130" rx="4" transform="rotate(5 100 100)" fill="black" />
                      <circle cx="68" cy="62" r="15" fill="black"/>
                      <circle cx="68" cy="62" r="10" fill="%23ffff00"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* SHIRT 2: BLACK */}
              <div className="flex flex-col items-center w-1/4 relative top-1">
                {/* Hanger hook */}
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M25 15 C20 10, 20 2, 25 2 C30 2, 30 10, 25 12" stroke="black" strokeWidth="2.5" />
                  <path d="M8 25 L25 12 L42 25" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {/* Garment Block */}
                <div className="w-20 h-28 bg-black border-2 border-black rounded-none flex items-center justify-center relative shadow-[2px_2px_0px_rgba(0,0,0,0.15)] mt-[-4px]">
                  {/* Short sleeves */}
                  <div className="absolute left-[-10px] top-0 w-4 h-12 bg-black border-2 border-black border-r-0 transform rotate-[-20deg]" />
                  <div className="absolute right-[-10px] top-0 w-4 h-12 bg-black border-2 border-black border-l-0 transform rotate([20deg])" />
                  
                  {/* White Asterisk logo on black shirt */}
                  <div className="relative z-10 scale-45">
                    <svg width="45" height="45" viewBox="0 0 200 200" fill="none">
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(-25 100 106)" fill="white" />
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(35 100 106)" fill="white" />
                      <rect x="84" y="35" width="32" height="130" rx="4" transform="rotate(5 100 100)" fill="white" />
                      <circle cx="68" cy="62" r="15" fill="white"/>
                      <circle cx="68" cy="62" r="10" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* SHIRT 3: CYAN */}
              <div className="flex flex-col items-center w-1/4 relative top-1">
                {/* Hanger hook */}
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M25 15 C20 10, 20 2, 25 2 C30 2, 30 10, 25 12" stroke="black" strokeWidth="2.5" />
                  <path d="M8 25 L25 12 L42 25" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {/* Garment Block */}
                <div className="w-20 h-28 bg-cyan border-2 border-black rounded-none flex items-center justify-center relative shadow-[2px_2px_0px_rgba(0,0,0,0.15)] mt-[-4px]">
                  {/* Short sleeves */}
                  <div className="absolute left-[-10px] top-0 w-4 h-12 bg-cyan border-2 border-black border-r-0 transform rotate-[-20deg]" />
                  <div className="absolute right-[-10px] top-0 w-4 h-12 bg-cyan border-2 border-black border-l-0 transform rotate([20deg])" />
                  
                  {/* Black Asterisk logo on cyan shirt */}
                  <div className="relative z-10 scale-45">
                    <svg width="45" height="45" viewBox="0 0 200 200" fill="none">
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(-25 100 106)" fill="black" />
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(35 100 106)" fill="black" />
                      <rect x="84" y="35" width="32" height="130" rx="4" transform="rotate(5 100 100)" fill="black" />
                      <circle cx="68" cy="62" r="15" fill="black"/>
                      <circle cx="68" cy="62" r="10" fill="%2300ffff"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* SHIRT 4: MAGENTA */}
              <div className="flex flex-col items-center w-1/4 relative top-1">
                {/* Hanger hook */}
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M25 15 C20 10, 20 2, 25 2 C30 2, 30 10, 25 12" stroke="black" strokeWidth="2.5" />
                  <path d="M8 25 L25 12 L42 25" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {/* Garment Block */}
                <div className="w-20 h-28 bg-magenta border-2 border-black rounded-none flex items-center justify-center relative shadow-[2px_2px_0px_rgba(0,0,0,0.15)] mt-[-4px]">
                  {/* Short sleeves */}
                  <div className="absolute left-[-10px] top-0 w-4 h-12 bg-magenta border-2 border-black border-r-0 transform rotate-[-20deg]" />
                  <div className="absolute right-[-10px] top-0 w-4 h-12 bg-magenta border-2 border-black border-l-0 transform rotate([20deg])" />
                  
                  {/* Black Asterisk logo on magenta shirt */}
                  <div className="relative z-10 scale-45">
                    <svg width="45" height="45" viewBox="0 0 200 200" fill="none">
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(-25 100 106)" fill="black" />
                      <rect x="35" y="90" width="130" height="32" rx="4" transform="rotate(35 100 106)" fill="black" />
                      <rect x="84" y="35" width="32" height="130" rx="4" transform="rotate(5 100 100)" fill="black" />
                      <circle cx="68" cy="62" r="15" fill="black"/>
                      <circle cx="68" cy="62" r="10" fill="%23ff00ff"/>
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Pop Art Features blocks Grid */}
      <section className="bg-white border-t-3 border-black relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white border-3 border-black shadow-[4px_4px_0px_#000] space-y-4">
            <div className="w-10 h-10 border-2 border-black bg-cyan flex items-center justify-center shadow-[1px_1px_0px_#000]">
              <Layers className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">1. Customizer Layers</h3>
            <p className="text-xs font-mono text-black/70 leading-relaxed uppercase">
              Apply flat ink patterns (grids, checkers, halftones), layer custom lettering fonts, and drop transparent brand stickers directly on garment surfaces.
            </p>
          </div>

          <div className="p-6 bg-white border-3 border-black shadow-[4px_4px_0px_#000] space-y-4">
            <div className="w-10 h-10 border-2 border-black bg-magenta flex items-center justify-center shadow-[1px_1px_0px_#000]">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">2. Global Print routing</h3>
            <p className="text-xs font-mono text-black/70 leading-relaxed uppercase">
              Select verified print providers from the USA, UK, or EU. Compare baseline manufacturing margins, shipping rates, and dispatch timelines.
            </p>
          </div>

          <div className="p-6 bg-white border-3 border-black shadow-[4px_4px_0px_#000] space-y-4">
            <div className="w-10 h-10 border-2 border-black bg-yellow flex items-center justify-center shadow-[1px_1px_0px_#000]">
              <ShoppingCart className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">3. Automated Dropship</h3>
            <p className="text-xs font-mono text-black/70 leading-relaxed uppercase">
              Link with Shopify, Etsy, or WooCommerce storefront configurations. Orders received are printed and shipped automatically to customers via DHL or FedEx.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t-3 border-black bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-black uppercase font-bold">
          <span>© 2026 Design Customs Inc. All Rights Reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Fulfillment Terms</a>
            <a href="#" className="hover:underline">Privacy System</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Global interface representing browser layout alignment
interface Globe {
  className?: string;
}
