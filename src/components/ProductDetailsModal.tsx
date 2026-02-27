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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div className="relative bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white rounded-full shadow-lg transition-all"
        >
          <X size={20}/>
        </button>
        
        <div className="w-full md:w-1/2 bg-[#f3f4f6] flex items-center justify-center p-8 md:p-16 shrink-0 h-[35vh] md:h-auto">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain mix-blend-multiply" 
          />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white overflow-y-auto md:overflow-hidden hide-scrollbar">
          <div className="mb-6">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-1">{product.categoria}</p>
            <h2 className="text-3xl md:text-4xl font-serif italic text-black leading-tight uppercase mb-2">{product.nombre}</h2>
            <p className="text-4xl font-black text-black" style={robotoStyle}>${product.precio}</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {colores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-zinc-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setSelectedColors([c])} 
                      className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedColors.includes(c) ? 'bg-black text-white border-black shadow-md' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tallas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-zinc-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedSizes([t])} 
                      className={`w-12 h-12 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${selectedSizes.includes(t) ? 'bg-black text-white border-black shadow-md' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400">
               <Box size={14} /> STOCK: {product.stock}
            </div>
          </div>

          <div className="mt-10 md:mt-12">
            <button 
              disabled={estaBloqueado}
              onClick={handleAdd}
              className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${estaBloqueado ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800 shadow-xl active:scale-95'}`}
            >
              <ShoppingBag size={18} />
              {!tieneStock ? 'AGOTADO' : seleccionIncompleta() ? 'SELECCIONA TALLA Y COLOR' : 'AÑADIR AL CARRITO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;
