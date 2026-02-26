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
      
      {/* Contenedor Vertical Estilo Ficha */}
      <div className="relative bg-white w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 scrollbar-hide">
        
        {/* Botón Cerrar (Posicionado para no estorbar) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-white/90 backdrop-blur-md rounded-full border border-zinc-100 shadow-sm active:scale-90 transition-all"
        >
          <X size={18} className="text-black" />
        </button>
        
        {/* IMAGEN: Totalmente recta y centrada */}
        <div className="w-full aspect-square bg-[#f8f9fa] flex items-center justify-center p-8 relative">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain ${!tieneStock ? 'grayscale opacity-50' : ''}`} 
          />
          
          <div className="absolute bottom-4 left-6">
             <span className="bg-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]" style={robotoStyle}>
                {product.categoria}
             </span>
          </div>
        </div>

        {/* CUERPO DE DETALLES: Debajo de la imagen */}
        <div className="p-8 pt-6 space-y-6">
          
          {/* Fila de Título y Stock Mejorada */}
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h2 className="text-2xl font-black text-[#1e3a5f] uppercase leading-none tracking-tighter" style={robotoStyle}>
                {product.nombre}
              </h2>
              {/* Stock visible sin interferencia del botón X */}
              <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${tieneStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <Box size={10} />
                <span>{tieneStock ? `Stock: ${product.stock}` : 'Agotado'}</span>
              </div>
            </div>
            <p className="text-3xl font-black text-[#1e3a5f]" style={robotoStyle}>${product.precio}</p>
          </div>

          <hr className="border-zinc-100" />

          {/* Selección de Colores */}
          {mostrarVariantes && colores.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Palette size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Selecciona Color</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colores.map((color: string) => (
                  <button 
                    key={color} 
                    onClick={() => toggleColor(color)} 
                    className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                      selectedColors.includes(color) ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-md' : 'border-zinc-100 bg-zinc-50 text-zinc-400'
                    }`}
                    style={robotoStyle}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Tallas */}
          {mostrarVariantes && tallas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Ruler size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Selecciona Talla</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tallas.map((talla: string) => (
                  <button 
                    key={talla} 
                    onClick={() => toggleSize(talla)} 
                    className={`w-12 h-12 rounded-xl border-2 font-black text-[10px] transition-all flex items-center justify-center ${
                      selectedSizes.includes(talla) ? 'border-[#d4af37] bg-[#d4af37] text-white shadow-lg' : 'border-zinc-100 bg-zinc-50 text-zinc-600'
                    }`}
                    style={robotoStyle}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Acción */}
          <button 
            disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
            onClick={handleAdd}
            className="w-full bg-[#1e3a5f] text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all shadow-xl"
            style={robotoStyle}
          >
            <ShoppingBag size={18} /> 
            {tieneStock ? 'Añadir al Carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}
