import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, ShoppingBag, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 lg:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[950px] bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] lg:max-h-[550px] lg:h-full">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-black hover:text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-full lg:w-1/2 bg-[#f4f4f5] flex items-center justify-center p-8 h-64 lg:h-auto shrink-0">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain drop-shadow-xl transition-all duration-500 ${!tieneStock ? 'grayscale opacity-70' : ''}`} 
          />
        </div>

        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.categoria}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-black mt-1 leading-tight">{product.nombre}</h2>
          </div>

          <p className="text-3xl font-black text-black mb-8" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-6 flex-grow-0">
            {mostrarVariantes && tallas.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-black uppercase tracking-wider block mb-3">Select Size</span>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => {
                    const isSelected = selectedSizes.includes(talla);
                    return (
                      <button 
                        key={talla} 
                        disabled={!tieneStock}
                        onClick={() => toggleSize(talla)} 
                        className={`min-w-[42px] h-10 px-3 border text-xs font-semibold transition-all flex items-center justify-center ${
                          isSelected ? 'border-[#3b82f6] text-[#3b82f6] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        } ${!tieneStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {talla}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mostrarVariantes && colores.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-black uppercase tracking-wider block mb-3">Select Color</span>
                <div className="flex flex-wrap gap-3">
                  {colores.map((color: string) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button 
                        key={color} 
                        disabled={!tieneStock}
                        onClick={() => toggleColor(color)} 
                        className={`px-4 py-2 border rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                          isSelected ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
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
          </div>

          <div className="mt-10 flex items-center gap-4">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="flex-1 bg-black text-white py-4 rounded-md font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
            >
              <ShoppingBag size={16} /> 
              {!tieneStock 
                ? 'Agotado' 
                : (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)
                  ? 'Elige tus Tallas'
                  : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductGallery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "productos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allProds.filter((p: any) => 
        p.status === 'active' || p.status === undefined || p.status === ''
      );
      setProducts(filtered as any);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-20 text-center font-black tracking-widest text-zinc-300">CARGANDO PRODUCTOS...</div>;

  return (
    <section id="productos" className="py-20 bg-white min-h-[500px]">
      <div className="container mx-auto px-6">
        {products.length === 0 ? (
          <div className="text-center py-20 font-black text-zinc-400">NO SE ENCONTRARON PRODUCTOS DISPONIBLES</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {products.map((p: any) => (
              <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="cursor-pointer group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-[2rem] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={p.imagen || p.image} 
                    alt={p.nombre} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  {Number(p.stock) <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-black text-white text-[8px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Agotado</span>
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{p.categoria}</p>
                <h3 className="font-serif italic text-base uppercase text-black mb-1 leading-none">{p.nombre}</h3>
                <p className="font-black text-sm text-black" style={robotoStyle}>${p.precio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <ProductDetailsModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
