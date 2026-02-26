import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, ShoppingBag, Ruler, Palette, Check, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

function ProductDetailsModal({ product, isOpen, onClose }: any) {
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* CAMBIO CLAVE: 
          - md:max-w-5xl y md:h-[600px] definen un área de trabajo horizontal fija.
          - overflow-hidden elimina la barra de scroll lateral.
      */}
      <div className="relative bg-white w-full max-w-4xl md:h-[600px] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
        >
          <X size={20} />
        </button>
        
        {/* LADO IZQUIERDO: IMAGEN OCUPANDO EL 50% EXACTO */}
        <div className="md:w-1/2 h-64 md:h-full bg-[#f8f9fa] flex items-center justify-center p-8">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain drop-shadow-2xl transform-none scale-110" 
          />
        </div>

        {/* LADO DERECHO: CONTENIDO CENTRADO VERTICALMENTE */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white relative">
          <div className="space-y-2 mb-6">
            <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.4em]">{product.categoria}</span>
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-black text-black uppercase leading-tight max-w-[80%]">{product.nombre}</h2>
               <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                 <Box size={10} /> {tieneStock ? product.stock : 0}
               </div>
            </div>
          </div>

          <p className="text-5xl font-black text-black mb-8" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-6 flex-grow-0">
            {mostrarVariantes && colores.length > 0 && (
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-3">Colores</span>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                        selectedColors.includes(color) ? 'border-black bg-black text-white' : 'border-zinc-100 text-zinc-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-3">Tallas</span>
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
          </div>

          <div className="mt-10">
            <button 
              disabled={!tieneStock}
              onClick={handleAdd}
              className="w-full bg-[#1e3a5f] text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl disabled:bg-zinc-100 disabled:text-zinc-300"
            >
              <ShoppingBag size={18} /> 
              {tieneStock ? 'Añadir al Carrito' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
