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

  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 1024;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        style={{
          display: isDesktop ? 'grid' : 'flex',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : 'none',
          flexDirection: isDesktop ? 'row' : 'column',
          width: isDesktop ? '1000px' : '100%',
          height: isDesktop ? '600px' : 'auto',
          maxHeight: '95vh',
          backgroundColor: 'white',
          borderRadius: '2rem',
          overflow: 'hidden',
          position: 'relative'
        }}
        className="shadow-2xl animate-in zoom-in duration-300"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-white/50 hover:bg-black hover:text-white rounded-full transition-all"
        >
          <X size={24} />
        </button>
        
        {/* PANEL IZQUIERDO: IMAGEN */}
        <div style={{
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          height: isDesktop ? '100%' : '300px'
        }}>
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            className="drop-shadow-2xl" 
          />
        </div>

        {/* PANEL DERECHO: INFO */}
        <div style={{
          padding: isDesktop ? '4rem' : '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
          <div className="mb-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">{product.categoria}</span>
            <h2 className="text-4xl font-black text-black uppercase leading-tight mt-1">{product.nombre}</h2>
          </div>

          <p className="text-5xl font-black text-black mb-8" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-8 flex-grow-0 mb-10">
            {mostrarVariantes && tallas.length > 0 && (
              <div>
                <span className="text-[11px] font-black text-black uppercase tracking-widest block mb-4">Talla</span>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => toggleSize(talla)} 
                      className={`w-12 h-12 border-2 font-black text-xs transition-all ${
                        selectedSizes.includes(talla) ? 'border-black bg-black text-white' : 'border-zinc-100 text-zinc-400'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && colores.length > 0 && (
              <div>
                <span className="text-[11px] font-black text-black uppercase tracking-widest block mb-4">Color</span>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`px-5 py-2 border-2 rounded-full text-[10px] font-black uppercase transition-all ${
                        selectedColors.includes(color) ? 'border-black bg-black text-white' : 'border-zinc-100 text-zinc-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={!tieneStock}
            onClick={handleAdd}
            className="w-full bg-black text-white py-5 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg disabled:bg-zinc-100 disabled:text-zinc-300"
          >
            <ShoppingBag size={18} /> 
            {tieneStock ? 'Añadir al Carrito' : 'Agotado'}
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
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-20 text-center font-black tracking-widest text-zinc-300">CARGANDO...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="cursor-pointer group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-[2rem] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img 
                  src={p.imagen || p.image} 
                  alt={p.nombre} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
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
