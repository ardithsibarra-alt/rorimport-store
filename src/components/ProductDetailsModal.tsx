import React, { useState } from 'react';
import { X, ShoppingBag, Ruler, Palette, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

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
        alert("Selecciona talla");
        return;
      }
      if (colores.length > 0 && selectedColors.length === 0) {
        alert("Selecciona color");
        return;
      }
    }

    const variantName = `${product.nombre} ${selectedColors.length > 0 ? `(${selectedColors.join(', ')})` : ''} ${selectedSizes.length > 0 ? `- Tallas: ${selectedSizes.join(', ')}` : ''}`;
    
    addToCart({
      id: `${product.id}-${selectedColors.sort().join('')}-${selectedSizes.sort().join('')}`,
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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Contenedor optimizado para PC: Ancho fijo de 420px para evitar deformación */}
      <div className="relative bg-white w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 scrollbar-hide flex flex-col">
        
        {/* Botón Cerrar: Posicionado fuera del área de contenido crítico */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-white/60 hover:bg-white backdrop-blur-md rounded-full border border-zinc-100 shadow-sm transition-all"
        >
          <X size={20} className="text-black" />
        </button>
        
        {/* IMAGEN: Sin rotaciones, centrada y ajustada al ancho de la ficha */}
        <div className="w-full aspect-[4/5] bg-[#fdfdfd] flex items-center justify-center p-12 relative border-b border-zinc-50">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain ${!tieneStock ? 'grayscale opacity-40' : ''}`} 
          />
          
          <div className="absolute bottom-6 left-8">
             <span className="bg-zinc-900 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]" style={robotoStyle}>
                {product.categoria}
             </span>
          </div>
        </div>

        {/* DETALLES: Alineación vertical perfecta bajo la imagen */}
        <div className="p-10 space-y-8">
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-[#1e3a5f] uppercase leading-none tracking-tighter" style={robotoStyle}>
                {product.nombre}
              </h2>
              {/* Stock visualmente despejado de la X */}
              <div className="flex items-center">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${tieneStock ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  <Box size={12} />
                  {tieneStock ? `DISPONIBLE: ${product.stock} UDS` : 'AGOTADO'}
                </span>
              </div>
            </div>
            <p className="text-4xl font-black text-[#1e3a5f]" style={robotoStyle}>${product.precio}</p>
          </div>

          {/* Variantes de Color */}
          {mostrarVariantes && colores.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Palette size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Colores</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colores.map((color: string) => (
                  <button 
                    key={color} 
                    onClick={() => toggleColor(color)} 
                    className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                      selectedColors.includes(color) ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-lg scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'
                    }`}
                    style={robotoStyle}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variantes de Talla */}
          {mostrarVariantes && tallas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Ruler size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Tallas</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {tallas.map((talla: string) => (
                  <button 
                    key={talla} 
                    onClick={() => toggleSize(talla)} 
                    className={`w-14 h-14 rounded-xl border-2 font-black text-[11px] transition-all flex items-center justify-center ${
                      selectedSizes.includes(talla) ? 'border-[#d4af37] bg-[#d4af37] text-white shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-600 hover:border-zinc-200'
                    }`}
                    style={robotoStyle}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón Añadir */}
          <button 
            disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
            onClick={handleAdd}
            className="w-full bg-[#1e3a5f] text-white py-6 rounded-[1.8rem] font-black uppercase text-[12px] tracking-[0.25em] flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all shadow-2xl mt-4"
            style={robotoStyle}
          >
            <ShoppingBag size={20} /> 
            {tieneStock ? 'Añadir al Carrito' : 'Sin Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
