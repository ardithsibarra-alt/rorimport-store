import React, { useState } from 'react';
import { X, ShoppingBag, Ruler, Palette, Check, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailsModal({ product, isOpen, onClose }: any) {
  const { addToCart } = useCart();
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  if (!isOpen || !product) return null;

  const mostrarVariantes = product.aplicaVariantes !== false;
  const tallas = (mostrarVariantes && Array.isArray(product.tallas)) ? product.tallas : [];
  const colores = (mostrarVariantes && Array.isArray(product.colores)) ? product.colores : [];
  const tieneStock = Number(product.stock) > 0;

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (talla: string) => {
    setSelectedSizes(prev => 
      prev.includes(talla) ? prev.filter(t => t !== talla) : [...prev, talla]
    );
  };

  const handleAdd = () => {
    if (mostrarVariantes) {
      if (tallas.length > 0 && selectedSizes.length === 0) {
        alert("Por favor, selecciona al menos una talla.");
        return;
      }
      if (colores.length > 0 && selectedColors.length === 0) {
        alert("Por favor, selecciona al menos un color.");
        return;
      }
    }

    const variantName = `${product.nombre} ${selectedColors.length > 0 ? `(${selectedColors.join(', ')})` : ''} ${selectedSizes.length > 0 ? `- Tallas: ${selectedSizes.join(', ')}` : ''}`;
    
    addToCart({
      id: `${product.id}-${selectedColors.sort().join('-')}-${selectedSizes.sort().join('-')}`,
      name: variantName,
      price: product.precio,
      image: product.imagen || product.image,
      quantity: 1,
      selectedSize: mostrarVariantes ? selectedSizes.join(', ') : 'N/A',
      selectedColor: mostrarVariantes ? selectedColors.join(', ') : 'N/A'
    });
    
    setSelectedColors([]);
    setSelectedSizes([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom duration-300">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-3 bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <X size={20} />
        </button>
        
        <div className="w-full md:w-1/2 bg-[#f8f9fa] flex items-center justify-center p-8 min-h-[350px]">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full max-h-[300px] md:max-h-none object-contain drop-shadow-2xl md:-rotate-12 ${!tieneStock ? 'grayscale opacity-70' : ''}`} 
          />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col pb-32 md:pb-12">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">{product.categoria}</span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${tieneStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Box size={10} /> {tieneStock ? `Stock: ${product.stock}` : 'Agotado'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-[#1e3a5f] uppercase mb-2">{product.nombre}</h2>
          <p className="text-3xl font-black text-[#1e3a5f] mb-6">${product.precio}</p>

          {mostrarVariantes && colores.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Palette size={14} />
                <span className="text-[10px] font-black uppercase">Colores</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colores.map((color: string) => (
                  <button 
                    key={color} 
                    onClick={() => toggleColor(color)} 
                    className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                      selectedColors.includes(color) ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white' : 'border-zinc-100 text-zinc-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mostrarVariantes && tallas.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Ruler size={14} />
                <span className="text-[10px] font-black uppercase">Tallas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tallas.map((talla: string) => (
                  <button 
                    key={talla} 
                    onClick={() => toggleSize(talla)} 
                    className={`w-12 h-12 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${
                      selectedSizes.includes(talla) ? 'border-[#d4af37] bg-[#d4af37] text-white' : 'border-zinc-100 text-zinc-600'
                    }`}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="fixed md:relative bottom-0 left-0 right-0 p-6 md:p-0 bg-white md:bg-transparent border-t md:border-none border-zinc-100 z-[60]">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="w-full bg-[#1e3a5f] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400 transition-all shadow-xl"
            >
              <ShoppingBag size={20} /> 
              {!tieneStock ? 'Agotado' : 'Añadir al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
