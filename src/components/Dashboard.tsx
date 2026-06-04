import React, { useState } from 'react';
import { ProductDesign, SimulatedOrder, GarmentType } from '../types/editor';
import { Layers, DollarSign, ShoppingBag, Radio, Trash2, CheckCircle2, Zap, Play } from 'lucide-react';

interface DashboardProps {
  products: ProductDesign[];
  orders: SimulatedOrder[];
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onSimulateOrder: (productId: string) => void;
  onFulfillStep: (orderId: string) => void;
  onAddNewDesign: () => void;
}

export default function Dashboard({
  products,
  orders,
  onEditProduct,
  onDeleteProduct,
  onSimulateOrder,
  onFulfillStep,
  onAddNewDesign,
}: DashboardProps) {
  const [shopifyConnected, setShopifyConnected] = useState(true);
  const [etsyConnected, setEtsyConnected] = useState(false);
  const [wooConnected, setWooConnected] = useState(false);
  
  const totalSales = orders.reduce((sum, o) => sum + o.retailPrice, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);

  const garmentLabels: Record<GarmentType, string> = {
    hoodie: '🧥 Hoodie',
    tshirt: '👕 T-Shirt',
    sweatshirt: '👚 Sweatshirt',
    tote: '👜 Tote Bag',
    cap: '🧢 Cap'
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fadeIn text-black space-y-8 bg-white border-3 border-black shadow-[5px_5px_0px_#000] p-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider italic">Merchant Dashboard</h1>
          <p className="text-xs font-mono text-black/60 uppercase mt-1">Manage storefront catalog, sales figures, and drop-ship routing</p>
        </div>
        <button
          onClick={onAddNewDesign}
          className="px-6 py-3 bg-yellow hover:bg-yellow/95 text-black border-3 border-black font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]"
        >
          <Zap className="w-4 h-4 fill-black" />
          Create New Design
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Sales */}
        <div className="p-5 bg-white border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-cyan flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
            <DollarSign className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[9px] text-black/60 uppercase font-bold">Gross Sales</span>
            <span className="text-lg font-black mt-0.5">${totalSales.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 2: Profit */}
        <div className="p-5 bg-white border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-magenta flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
            <DollarSign className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[9px] text-black/60 uppercase font-bold">Net Profits</span>
            <span className="text-lg font-black mt-0.5">${totalProfit.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 3: Orders count */}
        <div className="p-5 bg-white border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-yellow flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
            <ShoppingBag className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[9px] text-black/60 uppercase font-bold">Total Orders</span>
            <span className="text-lg font-black mt-0.5">{orders.length} ITEMS</span>
          </div>
        </div>

        {/* Metric 4: Channels */}
        <div className="p-5 bg-white border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-gray-bg flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
            <Radio className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[9px] text-black/60 uppercase font-bold">Channels Active</span>
            <span className="text-lg font-black mt-0.5">
              {[shopifyConnected, etsyConnected, wooConnected].filter(Boolean).length} / 3 SYNC
            </span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Products and Order Logs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-black">My E-Commerce Products</h3>
              <span className="text-xs font-mono text-black font-bold bg-gray-bg px-2.5 py-0.5 border-2 border-black">
                TOTAL: {products.length}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-black/40 bg-gray-bg/10">
                <Layers className="w-8 h-8 text-black/40 mx-auto mb-2" />
                <h4 className="text-xs font-bold font-mono uppercase">Catalog is empty</h4>
                <p className="text-[10px] font-mono text-black/60 mt-1 mb-4">Start by using the customize designer to create your line</p>
                <button
                  onClick={onAddNewDesign}
                  className="px-4 py-2 bg-yellow hover:bg-yellow/95 text-black border-2 border-black text-xs font-mono font-bold uppercase transition-all"
                >
                  Launch Editor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] transition-all"
                  >
                    <div>
                      {/* Product flat layout color block */}
                      <div 
                        className="w-full aspect-[4/3] border-2 border-black rounded-none mb-3 flex items-center justify-center relative overflow-hidden bg-gray-bg"
                        style={{ backgroundColor: product.baseColor }}
                      >
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 bg-white border-2 border-black text-black">
                            {product.garmentType.toUpperCase()} MOCKUP
                          </span>
                        </div>
                      </div>

                      {/* Header details */}
                      <h4 className="text-xs font-mono font-black uppercase truncate">{product.name}</h4>
                      <div className="flex items-center justify-between text-[9px] font-mono text-black/60 mt-1.5 pb-2 border-b border-black/10">
                        <span>{garmentLabels[product.garmentType]}</span>
                        <span className="text-black font-bold">RETAIL: ${product.retailPrice}</span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="pt-3 flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onEditProduct(product.id)}
                          className="px-2.5 py-1.5 bg-white hover:bg-gray-bg border-2 border-black rounded-none text-[9px] font-mono font-bold uppercase text-black transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="px-2.5 py-1.5 bg-white hover:text-magenta border-2 border-black rounded-none text-[9px] font-mono font-bold uppercase text-black transition-all"
                        >
                          Delete
                        </button>
                      </div>

                      <button
                        onClick={() => onSimulateOrder(product.id)}
                        className="px-3 py-1.5 bg-cyan hover:bg-cyan/95 text-black border-2 border-black rounded-none text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1.5px] active:shadow-none"
                      >
                        <Play className="w-2.5 h-2.5 fill-black stroke-[3px]" />
                        Simulate Sale
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders log table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-black">Routed Shop Orders</h3>
              <span className="text-xs font-mono text-black font-bold bg-gray-bg px-2.5 py-0.5 border-2 border-black">
                ITEMS: {orders.length}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-black/40 bg-gray-bg/10">
                <span className="text-xs font-mono text-black/55">Simulate a customer sale to test fulfillment processing</span>
              </div>
            ) : (
              <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-bg font-mono text-[9px] text-black uppercase tracking-wider">
                      <th className="p-3">ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Profit</th>
                      <th className="p-3 text-center">Fulfill Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 font-mono text-[10px]">
                    {orders.map((order) => {
                      const statusColors = {
                        pending: 'bg-yellow text-black border-black',
                        printing: 'bg-cyan text-black border-black',
                        shipping: 'bg-magenta text-white border-black',
                        delivered: 'bg-white text-black border-black/30'
                      };

                      return (
                        <tr key={order.id} className="hover:bg-gray-bg/25">
                          <td className="p-3 font-bold">#{order.id.slice(-4)}</td>
                          <td className="p-3 uppercase font-bold">{order.productName}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span>{order.customerName}</span>
                              <span className="text-[8px] text-black/60 font-bold uppercase">{order.customerAddress}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-none text-[8px] uppercase border font-bold ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                            {order.trackingNumber && (
                              <span className="block text-[8px] text-black/60 font-bold mt-0.5">TRACKING: {order.trackingNumber}</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-black">${order.profit.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            {order.status !== 'delivered' ? (
                              <button
                                onClick={() => onFulfillStep(order.id)}
                                className="px-2 py-1 bg-white hover:bg-gray-bg border border-black rounded-none text-[8px] font-black uppercase transition-all"
                              >
                                Next Step
                              </button>
                            ) : (
                              <span className="text-[9px] text-black/60 font-bold uppercase flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3.5px]" />
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Store Integration panel */}
        <div className="space-y-6">
          <div className="p-6 bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_#000] space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-black font-mono font-bold uppercase text-xs">
              <Radio className="w-4 h-4" />
              <span>Connected Storefronts</span>
            </div>
            
            <p className="text-xs font-mono text-black/60 leading-relaxed uppercase">
              ACTING AS THE ROUTING AGENT BETWEEN YOUR CUSTOMERS AND PRINT PARTNERS.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-3 bg-white border-2 border-black rounded-none flex items-center justify-between">
                <div className="flex flex-col font-mono">
                  <span className="text-xs font-bold uppercase">Shopify Shop</span>
                  <span className={`text-[8px] font-bold mt-0.5 uppercase ${shopifyConnected ? 'text-cyan' : 'text-black/45'}`}>
                    {shopifyConnected ? '● active_push' : '○ offline'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shopifyConnected}
                  onChange={(e) => setShopifyConnected(e.target.checked)}
                  className="w-4 h-4 border-2 border-black accent-black rounded-none cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-none flex items-center justify-between">
                <div className="flex flex-col font-mono">
                  <span className="text-xs font-bold uppercase">Etsy Listings</span>
                  <span className={`text-[8px] font-bold mt-0.5 uppercase ${etsyConnected ? 'text-cyan' : 'text-black/45'}`}>
                    {etsyConnected ? '● active_push' : '○ offline'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={etsyConnected}
                  onChange={(e) => setEtsyConnected(e.target.checked)}
                  className="w-4 h-4 border-2 border-black accent-black rounded-none cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-none flex items-center justify-between">
                <div className="flex flex-col font-mono">
                  <span className="text-xs font-bold uppercase">WooCommerce API</span>
                  <span className={`text-[8px] font-bold mt-0.5 uppercase ${wooConnected ? 'text-cyan' : 'text-black/45'}`}>
                    {wooConnected ? '● active_push' : '○ offline'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={wooConnected}
                  onChange={(e) => setWooConnected(e.target.checked)}
                  className="w-4 h-4 border-2 border-black accent-black rounded-none cursor-pointer"
                />
              </div>
            </div>

            <div className="border-t-2 border-black pt-4">
              <div className="p-3 bg-yellow/10 border border-yellow text-[9px] font-mono uppercase font-bold text-center">
                Toggle channels to auto-route orders directly.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
