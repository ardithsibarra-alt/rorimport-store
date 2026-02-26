import React, { useState } from 'react';
import { X, ShoppingBag, Check, Heart, Box, Ruler, Palette } from 'lucide-react';
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
      {/* Overlay con blur profundo */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* CONTENEDOR PRINCIPAL: Estilo Horizontal Acme */}
      <div className="relative bg-white w-full max-w-[1100px] md:h-[700px] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* BOTÓN CERRAR */}
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white rounded-full shadow-lg transition-all"
        >
          <X size={20} />
        </button>
        
        {/* PANEL IZQUIERDO: VISUAL (50%) */}
        <div className="w-full md:w-1/2 bg-[#F6F6F6] flex items-center justify-center p-12 md:p-20 shrink-0 relative">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain mix-blend-multiply transform hover:scale-105 transition-transform duration-700" 
          />
          {/* Badge de Stock */}
          <div className="absolute bottom-10 left-10">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase bg-white border ${tieneStock ? 'text-green-600 border-green-100' : 'text-red-600 border-red-100'}`}>
              <Box size={12} /> {tieneStock ? `STOCK: ${product.stock}` : 'AGOTADO'}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: INFO (50%) */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col bg-white overflow-y-auto">
          <div className="mb-8">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2 block">{product.categoria}</span>
            <h2 className="text-4xl md:text-5xl font-black text-black leading-[0.9] uppercase tracking-tighter mb-4">{product.nombre}</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
              {product.descripcion || "Diseño exclusivo rorimport con materiales de alta calidad, pensado para quienes buscan estilo y durabilidad en una sola pieza."}
            </p>
          </div>

          <p className="text-5xl font-black text-black mb-10" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-10 flex-grow">
            {/* SELECCIÓN DE TALLAS */}
            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">Seleccionar Talla</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => toggleSize(talla)} 
                      className={`w-14 h-14 border-2 font-black text-xs transition-all rounded-xl flex items-center justify-center ${
                        selectedSizes.includes(talla) ? 'border-black bg-black text-white shadow-xl' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SELECCIÓN DE COLORES */}
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">Colores Disponibles</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`px-6 py-2.5 border-2 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                        selectedColors.includes(color) ? 'border-black bg-black text-white shadow-lg' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      {selectedColors.includes(color) && <Check size={12} />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="mt-12 flex gap-4">
            <button 
              disabled={!tieneStock}
              onClick={handleAdd}
              className="flex-[4] bg-black text-white py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-900 active:scale-95 transition-all shadow-2xl disabled:bg-zinc-100 disabled:text-zinc-300"
            >
              <ShoppingBag size={20} /> 
              {tieneStock ? 'Añadir al Carrito' : 'Sin Existencias'}
            </button>
            <button className="flex-1 border-2 border-zinc-100 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <Heart size={22} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;
