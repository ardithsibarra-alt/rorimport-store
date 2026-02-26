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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* CONTENEDOR MAESTRO: md:min-w-[900px] asegura que no se vea como teléfono */}
      <div className="relative bg-white w-full max-w-5xl md:min-w-[950px] h-auto max-h-[95vh] rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden animate-in zoom-in duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="bg-[#f8f9fa] flex items-center justify-center p-8 md:p-16">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl" 
          />
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em]">{product.categoria}</span>
            <h2 className="text-4xl font-black text-[#1e3a5f] uppercase mt-2 leading-none">{product.nombre}</h2>
            <div className="mt-4 flex">
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <Box size={12} /> {tieneStock ? `DISPONIBLE: ${product.stock}` : 'AGOTADO'}
              </span>
            </div>
          </div>

          <p className="text-5xl font-black text-[#1e3a5f] mb-10" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-8 mb-12">
            {mostrarVariantes && colores.length > 0 && (
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Seleccionar Color</span>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                        selectedColors.includes(color) ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {selectedColors.includes(color) && <Check size={12} />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Seleccionar Talla</span>
                <div className="flex flex-wrap gap-3">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => toggleSize(talla)} 
                      className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center relative ${
                        selectedSizes.includes(talla) ? 'border-[#d4af37] bg-[#d4af37] text-white shadow-lg' : 'border-gray-100 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {talla}
                      {selectedSizes.includes(talla) && (
                        <div className="absolute -top-1 -right-1 bg-[#1e3a5f] rounded-full p-1 border-2 border-white">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
            onClick={handleAdd}
            className="w-full bg-[#1e3a5f] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-xl"
          >
            <ShoppingBag size={20} /> 
            {tieneStock ? 'Añadir al Carrito' : 'Producto Agotado'}
          </button>
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

  if (loading) return <div className="py-20 text-center font-black tracking-widest text-zinc-300 italic">CARGANDO COLECCIÓN...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="cursor-pointer group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-[2rem] mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
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
      </div>
      <ProductDetailsModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
