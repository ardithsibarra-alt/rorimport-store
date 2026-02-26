import React, { useState } from 'react';
import { X, ShoppingBag, Ruler, Palette, Check, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';

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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="md:w-1/2 bg-[#f8f9fa] flex items-center justify-center p-8">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-auto object-contain drop-shadow-2xl transition-all duration-500 ${!tieneStock ? 'grayscale opacity-70' : ''}`} 
          />
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex flex-col mb-4 pr-12">
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-2">{product.categoria}</span>
            <div className="flex">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <Box size={10} /> {tieneStock ? `Stock: ${product.stock}` : 'Agotado'}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-4 leading-tight">{product.nombre}</h2>
          <p className="text-4xl font-black text-[#1e3a5f] mb-8">${product.precio}</p>

          <div className="space-y-8">
            {mostrarVariantes && colores.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={14} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button 
                        key={color} 
                        disabled={!tieneStock}
                        onClick={() => toggleColor(color)} 
                        className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                          isSelected ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                        } ${!tieneStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSelected && <Check size={12} />}
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler size={14} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => {
                    const isSelected = selectedSizes.includes(talla);
                    return (
                      <button 
                        key={talla} 
                        disabled={!tieneStock}
                        onClick={() => toggleSize(talla)} 
                        className={`min-w-[56px] h-14 px-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center relative ${
                          isSelected ? 'border-[#d4af37] bg-[#d4af37] text-white' : 'border-gray-100 text-gray-600 hover:border-gray-300'
                        } ${!tieneStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {talla}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-[#1e3a5f] rounded-full p-0.5 border-2 border-white shadow-sm">
                            <Check size={8} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="w-full bg-[#1e3a5f] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-xl"
            >
              <ShoppingBag size={20} /> 
              {!tieneStock 
                ? 'Agotado' 
                : (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)
                  ? 'Elige tus Tallas'
                  : 'Añadir al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
