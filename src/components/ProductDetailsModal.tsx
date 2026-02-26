import React, { useState } from 'react';
import { X, ShoppingBag, Box, Palette, Ruler } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

export default function ProductDetailsModal({ product, isOpen, onClose }: any) {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  if (!isOpen || !product) return null;

  const mostrarVariantes = product.aplicaVariantes !== false;
  const tallas = (mostrarVariantes && Array.isArray(product.tallas)) ? product.tallas : [];
  const colores = (mostrarVariantes && Array.isArray(product.colores)) ? product.colores : [];
  const tieneStock = Number(product.stock) > 0;

  const handleAdd = () => {
    if (mostrarVariantes) {
      if (tallas.length > 0 && selectedSizes.length === 0) {
        alert("Selecciona talla"); return;
      }
      if (colores.length > 0 && selectedColors.length === 0) {
        alert("Selecciona color"); return;
      }
    }

    const variantName = `${product.nombre} ${selectedColors.join(', ')}`;
    addToCart({
      id: `${product.id}-${selectedColors.join('')}-${selectedSizes.join('')}`,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      {/* Contenedor con ancho máximo controlado para evitar que se desparrame en PC */}
      <div className="relative bg-white w-full max-w-[500px] md:max-w-[900px] max-h-[95vh] overflow-y-auto rounded-[3rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 scrollbar-hide">
        
        {/* BOTÓN CERRAR: Posición fija y limpia */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white rounded-full shadow-md transition-all active:scale-90"
        >
          <X size={22}/>
        </button>
        
        {/* LADO IZQUIERDO: IMAGEN (Totalmente recta) */}
        <div className="w-full md:w-[55%] bg-[#F3F4F6] flex items-center justify-center p-10 md:p-16">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-auto object-contain transform-none drop-shadow-3xl" 
            style={{ transform: 'none' }} // Doble seguridad contra rotación
          />
        </div>

        {/* LADO DERECHO: CONTENIDO */}
        <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col">
          
          <div className="mb-8">
            <div className="flex flex-col gap-3 mb-4">
              <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.4em]" style={robotoStyle}>
                {product.categoria}
              </span>
              
              {/* STOCK: Ubicado debajo de la categoría, lejos de la X */}
              <div className="flex">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  <Box size={12} />
                  {tieneStock ? `STOCK: ${product.stock} UNIDADES` : 'SIN EXISTENCIAS'}
                </span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif italic text-black uppercase leading-tight mb-2">
              {product.nombre}
            </h2>
            <p className="text-4xl font-black text-black" style={robotoStyle}>${product.precio}</p>
          </div>

          <div className="flex-grow space-y-8">
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                  <Palette size={14}/> Colores Disponibles
                </span>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setSelectedColors([c])}
                      className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedColors.includes(c) ? 'bg-black border-black text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                  <Ruler size={14}/> Tallas
                </span>
                <div className="flex flex-wrap gap-3">
                  {tallas.map(t => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedSizes([t])}
                      className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${selectedSizes.includes(t) ? 'bg-black border-black text-white shadow-xl scale-105' : 'border-zinc-100 text-zinc-600 hover:border-zinc-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:bg-zinc-900 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 shadow-2xl"
              style={robotoStyle}
            >
              <ShoppingBag size={20} />
              {tieneStock ? 'AÑADIR A LA BOLSA' : 'AGOTADO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
