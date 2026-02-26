import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, ShoppingBag, Check, Heart } from 'lucide-react';
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

  const handleAdd = () => {
    if (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0) {
      alert("Por favor, selecciona al menos una talla.");
      return;
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
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay oscuro con blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      {/* MODAL - FORZADO A SER ANCHO EN PC */}
      <div className="relative bg-white w-full max-w-[1150px] md:h-[650px] rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* BOTÓN CERRAR */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[100] p-3 bg-white/80 hover:bg-black hover:text-white rounded-full transition-all shadow-md"
        >
          <X size={24} />
        </button>
        
        {/* COLUMNA IZQUIERDA: IMAGEN (Ocupa el 50% exacto en PC) */}
        <div className="w-full md:w-1/2 bg-[#F2F2F2] flex items-center justify-center p-10 md:p-20">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105" 
          />
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN (Ocupa el 50% restante) */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col bg-white overflow-y-auto">
          <div className="mb-6">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.4em]">{product.categoria}</span>
            <h2 className="text-4xl md:text-5xl font-black text-black mt-2 leading-none uppercase tracking-tighter">{product.nombre}</h2>
          </div>

          <p className="text-5xl font-black text-black mb-8" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-8 flex-grow">
            {/* TALLAS */}
            {mostrarVariantes && tallas.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">Select Size</span>
                  <span className="text-[10px] font-bold text-zinc-400 underline cursor-pointer">Guía de tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => setSelectedSizes(prev => prev.includes(talla) ? prev.filter(t => t !== talla) : [...prev, talla])} 
                      className={`w-14 h-14 border-2 font-black text-xs transition-all rounded-xl ${
                        selectedSizes.includes(talla) ? 'border-black bg-black text-white' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORES */}
            {mostrarVariantes && colores.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-4">Colores Disponibles</span>
                <div className="flex flex-wrap gap-3">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])} 
                      className={`px-6 py-2 border-2 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                        selectedColors.includes(color) ? 'border-black bg-black text-white' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACCIONES */}
          <div className="mt-10 flex gap-4">
            <button 
              disabled={!tieneStock}
              onClick={handleAdd}
              className="flex-[4] bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-xl disabled:bg-zinc-100 disabled:text-zinc-300"
            >
              <ShoppingBag size={20} /> 
              {tieneStock ? 'Add to cart' : 'Sold Out'}
            </button>
            <button className="flex-1 border-2 border-zinc-100 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <Heart size={20} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
