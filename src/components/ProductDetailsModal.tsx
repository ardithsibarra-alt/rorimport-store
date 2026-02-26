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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <style>{`
        .no-scroll-area::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .no-scroll-area { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl md:h-[580px] rounded-[3rem] shadow-2xl flex flex-col md:grid md:grid-cols-2 overflow-hidden animate-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white rounded-full transition-all">
          <X size={20}/>
        </button>
        
        <div className="bg-[#f3f4f6] flex items-center justify-center p-12 h-64 md:h-full shrink-0">
          <img src={product.imagen || product.image} alt={product.nombre} className="w-full h-full object-contain" />
        </div>

        <div className="px-12 py-10 flex flex-col justify-center gap-6 h-full overflow-y-auto no-scroll-area">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-1">{product.categoria}</p>
            <h2 className="text-3xl font-serif italic text-black leading-tight uppercase">{product.nombre}</h2>
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border w-fit ${tieneStock ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
               <Box size={10} /> {tieneStock ? `DISPONIBLE: ${product.stock}` : 'SIN STOCK'}
            </div>
          </div>

          <p className="text-5xl font-black text-black" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-6">
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> Colores</span>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button key={c} onClick={() => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                      className={`px-5 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedColors.includes(c) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Ruler size={14}/> Tallas</span>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => (
                    <button key={t} onClick={() => setSelectedSizes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${selectedSizes.includes(t) ? 'bg-black text-white border-black scale-105' : 'border-zinc-100 text-zinc-600 hover:border-zinc-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex">
            <button 
              disabled={estaBloqueado}
              onClick={handleAdd}
              className={`w-full py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all ${
                estaBloqueado 
                ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-zinc-800 active:scale-95 shadow-xl'
              }`}
            >
              <ShoppingBag size={20} />
              {!tieneStock ? 'AGOTADO' : seleccionIncompleta() ? 'SELECCIONA TALLA Y COLOR' : 'AÑADIR AL CARRITO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;
