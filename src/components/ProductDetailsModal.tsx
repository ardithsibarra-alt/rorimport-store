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
      {/* Overlay oscuro con blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Contenedor Principal Estilo PC (Horizontal como tus capturas) */}
      <div className="relative bg-white w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex animate-in zoom-in duration-300">
        
        {/* BOTÓN CERRAR: Con margen suficiente para no tapar el stock */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all active:scale-90 shadow-sm"
        >
          <X size={20} className="text-black" />
        </button>
        
        {/* COLUMNA IZQUIERDA: IMAGEN (Totalmente recta) */}
        <div className="w-1/2 bg-[#f8f9fa] flex items-center justify-center p-12">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain transform-none ${!tieneStock ? 'grayscale opacity-50' : ''}`} 
            /* transform-none asegura que no herede rotaciones previas */
          />
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="w-1/2 p-12 flex flex-col overflow-y-auto scrollbar-hide">
          
          {/* Header con Categoría y Stock */}
          <div className="flex justify-between items-center mb-4 pr-12"> 
            {/* El pr-12 evita que el stock choque visualmente con la posición de la X */}
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]" style={robotoStyle}>
              {product.categoria}
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <Box size={10} />
              {tieneStock ? `STOCK: ${product.stock}` : 'AGOTADO'}
            </div>
          </div>

          <h2 className="text-4xl font-black text-black uppercase leading-tight italic mb-2" style={robotoStyle}>
            {product.nombre}
          </h2>
          <p className="text-4xl font-black text-black mb-8" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-8">
            {/* Selección de Colores */}
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Palette size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                        selectedColors.includes(color) ? 'border-black bg-black text-white' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'
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
                  <span className="text-[10px] font-black uppercase tracking-widest">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => toggleSize(talla)} 
                      className={`w-14 h-14 rounded-xl border-2 font-black text-[11px] transition-all flex items-center justify-center ${
                        selectedSizes.includes(talla) ? 'border-zinc-800 bg-zinc-800 text-white shadow-lg' : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón Añadir (Abajo) */}
          <div className="mt-auto pt-10">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="w-full bg-zinc-100 hover:bg-black hover:text-white text-zinc-400 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              style={robotoStyle}
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
