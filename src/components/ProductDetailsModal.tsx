import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, ShoppingBag, Ruler, Palette, Check, Box } from 'lucide-react';
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl md:h-[550px] rounded-[2rem] shadow-2xl flex flex-col md:grid md:grid-cols-2 overflow-hidden animate-in zoom-in duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-50 p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="bg-[#f8f9fa] flex items-center justify-center p-8 h-64 md:h-full">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ${!tieneStock ? 'grayscale opacity-70' : ''}`} 
          />
        </div>

        <div className="p-8 md:px-12 md:py-10 flex flex-col justify-center h-full">
          <div className="flex flex-col mb-2 pr-8">
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-1.5">{product.categoria}</span>
            <div className="flex">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <Box size={10} /> {tieneStock ? `Stock: ${product.stock}` : 'Agotado'}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-2 leading-tight">{product.nombre}</h2>
          <p className="text-4xl font-black text-[#1e3a5f] mb-6" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-5 flex-grow-0">
            {mostrarVariantes && colores.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  <Palette size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button 
                        key={color} 
                        disabled={!tieneStock}
                        onClick={() => toggleColor(color)} 
                        className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
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
              <div>
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  <Ruler size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => {
                    const isSelected = selectedSizes.includes(talla);
                    return (
                      <button 
                        key={talla} 
                        disabled={!tieneStock}
                        onClick={() => toggleSize(talla)} 
                        className={`min-w-[48px] h-12 px-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center relative ${
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

          <div className="mt-8">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="w-full bg-[#1e3a5f] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-xl"
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
      console.error("Error en Firebase:", error);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
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
