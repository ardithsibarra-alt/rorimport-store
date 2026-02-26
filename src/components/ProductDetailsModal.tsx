import React, { useState } from 'react';
import { X, Box, ShoppingBag, Ruler, Palette, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

function ProductDetailsModal({ product, isOpen, onClose }: any) {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  if (!isOpen || !product) return null;

  const mostrarVariantes = product.aplicaVariantes !== false;
  const tallas = (mostrarVariantes && Array.isArray(product.tallas)) ? product.tallas : [];
  const colores = (mostrarVariantes && Array.isArray(product.colores)) ? product.colores : [];
  const tieneStock = Number(product.stock) > 0;

  const seleccionIncompleta = () => {
    if (!mostrarVariantes) return false;
    const faltaTalla = tallas.length > 0 && selectedSizes.length === 0;
    const faltaColor = colores.length > 0 && selectedColors.length === 0;
    return faltaTalla || faltaColor;
  };

  const estaBloqueado = !tieneStock || seleccionIncompleta();

  const handleAdd = () => {
    if (estaBloqueado) return;
    const variantName = `${product.nombre} ${selectedColors.join(', ')} ${selectedSizes.join(', ')}`;
    addToCart({
      id: `${product.id}-${selectedColors.join('-')}-${selectedSizes.join('-')}`,
      name: variantName,
      price: product.precio,
      image: product.imagen || product.image,
      quantity: 1,
      selectedSize: selectedSizes.join(', '),
      selectedColor: selectedColors.join(', ')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div className="relative bg-white w-full max-w-5xl md:h-[580px] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 z-[110] p-3 bg-white hover:bg-black hover:text-white rounded-full transition-all shadow-md">
          <X size={20}/>
        </button>
        
        <div className="w-full md:w-1/2 bg-[#f3f4f6] flex items-center justify-center p-12 shrink-0">
          <img src={product.imagen || product.image} alt={product.nombre} className="w-full h-full object-contain" />
        </div>

        <div className="w-full md:w-1/2 px-12 py-10 flex flex-col justify-center hide-scrollbar overflow-y-auto">
          <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-1">{product.categoria}</p>
          <h2 className="text-3xl font-serif italic text-black leading-tight uppercase mb-4">{product.nombre}</h2>
          <p className="text-5xl font-black text-black mb-8" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-6 mb-10">
            {colores.length > 0 && (
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Colores</span>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button key={c} onClick={() => setSelectedColors([c])} className={`px-5 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedColors.includes(c) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            {tallas.length > 0 && (
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Tallas</span>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => (
                    <button key={t} onClick={() => setSelectedSizes([t])} className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${selectedSizes.includes(t) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-600'}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={estaBloqueado}
            onClick={handleAdd}
            className={`w-full py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all ${estaBloqueado ? 'bg-zinc-100 text-zinc-300' : 'bg-black text-white hover:bg-zinc-800 shadow-xl'}`}
          >
            <ShoppingBag size={20} />
            {!tieneStock ? 'AGOTADO' : seleccionIncompleta() ? 'SELECCIONA TALLA Y COLOR' : 'AÑADIR AL CARRITO'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;
