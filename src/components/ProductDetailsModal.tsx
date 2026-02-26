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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Contenedor Centrado y Ajustado a la Imagen */}
      <div className="relative bg-white w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 scrollbar-hide">
        
        {/* Botón Cerrar Flotante */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-50 p-2.5 bg-white/80 backdrop-blur-md border border-zinc-100 rounded-full active:scale-90 transition-all shadow-sm"
        >
          <X size={20} className="text-zinc-900" />
        </button>
        
        {/* Sección de Imagen (Ancho Completo) */}
        <div className="w-full aspect-square bg-[#f8f9fa] flex items-center justify-center p-10 relative overflow-hidden">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 ${!tieneStock ? 'grayscale opacity-70' : ''}`} 
          />
          
          {/* Badge de Categoría Flotante */}
          <div className="absolute top-6 left-6">
             <span className="bg-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest" style={robotoStyle}>
                {product.categoria}
             </span>
          </div>
        </div>

        {/* Detalles Ajustados al Ancho de la Imagen */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-[#1e3a5f] uppercase leading-none tracking-tighter mb-2" style={robotoStyle}>
                {product.nombre}
              </h2>
              <p className="text-3xl font-black text-[#1e3a5f]" style={robotoStyle}>${product.precio}</p>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${tieneStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Box size={10} /> {tieneStock ? `${product.stock} DISPONIBLES` : 'Agotado'}
            </span>
          </div>

          <hr className="border-zinc-100" />

          {/* Variantes de Color */}
          {mostrarVariantes && colores.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Palette size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Colores</span>
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

          {/* Variantes de Talla */}
          {mostrarVariantes && tallas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Ruler size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Tallas</span>
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

          {/* Botón Final */}
          <button 
            disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
            onClick={handleAdd}
            className="w-full bg-[#1e3a5f] text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all shadow-xl"
            style={robotoStyle}
          >
            <ShoppingBag size={18} /> 
            {!tieneStock ? 'PRODUCTO AGOTADO' : 'Añadir al Carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
