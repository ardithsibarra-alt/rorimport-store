import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, ShoppingBag, Check, Heart, Share2 } from 'lucide-react';
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
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* CONTENEDOR PRINCIPAL INSPIRADO EN ACME */}
      <div className="relative bg-white w-full max-w-[1100px] md:h-[700px] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* BOTONES DE INTERACCIÓN SUPERIORES (Estilo Acme) */}
        <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-black transition-colors"><Heart size={20} /></button>
          <button className="p-2 text-zinc-400 hover:text-black transition-colors"><Share2 size={20} /></button>
          <button onClick={onClose} className="ml-2 p-2 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* PARTE IZQUIERDA: VISUAL (50%) */}
        <div className="w-full md:w-1/2 bg-[#F6F6F6] flex items-center justify-center p-12 md:p-20 relative">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain mix-blend-multiply transform hover:scale-105 transition-transform duration-500" 
          />
          {/* Badge de disponibilidad */}
          <div className="absolute bottom-10 left-10 flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${tieneStock ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
               {tieneStock ? `Disponible: ${product.stock}` : 'Agotado'}
             </span>
          </div>
        </div>

        {/* PARTE DERECHA: CONFIGURACIÓN (50%) */}
        <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col bg-white overflow-y-auto">
          <div className="mb-10">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em] block mb-2">{product.categoria}</span>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight tracking-tighter uppercase mb-4">{product.nombre}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              {product.descripcion || "Diseño exclusivo rorimport con materiales de alta calidad, diseñado para ofrecer comodidad y estilo en cada detalle."}
            </p>
          </div>

          <div className="mb-10">
            <p className="text-4xl font-black text-black" style={robotoStyle}>${product.precio}</p>
          </div>

          <div className="space-y-10 flex-grow">
            {/* TALLAS - SELECCIÓN MÚLTIPLE */}
            {mostrarVariantes && tallas.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-4">Seleccionar Talla</span>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => toggleSize(talla)} 
                      className={`min-w-[50px] h-[50px] px-4 border-2 font-bold text-xs transition-all flex items-center justify-center rounded-lg ${
                        selectedSizes.includes(talla) ? 'border-black bg-black text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORES - SELECCIÓN MÚLTIPLE */}
            {mostrarVariantes && colores.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-4">Colores Disponibles</span>
                <div className="flex flex-wrap gap-3">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`group flex items-center gap-3 pr-4 pl-2 py-2 border-2 rounded-full transition-all ${
                        selectedColors.includes(color) ? 'border-black bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border border-black/10`} style={{ backgroundColor: color.toLowerCase().includes('rojo') ? '#9b1c1c' : color.toLowerCase().includes('negro') ? '#000' : '#ddd' }}></div>
                      <span className="text-[10px] font-bold uppercase">{color}</span>
                      {selectedColors.includes(color) && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTÓN AÑADIR AL CARRITO */}
          <div className="mt-12 flex gap-4">
            <button 
              disabled={!tieneStock}
              onClick={handleAdd}
              className="flex-1 bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-2xl disabled:bg-zinc-100 disabled:text-zinc-300"
            >
              <ShoppingBag size={20} /> 
              {tieneStock ? 'Añadir al Carrito' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
