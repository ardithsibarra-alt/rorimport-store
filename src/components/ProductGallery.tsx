import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, Box, ShoppingBag, Ruler, Palette, Check, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

function ProductDetailsModal({ product, isOpen, onClose }: any) {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

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
        alert("Por favor, selecciona al menos una talla."); return;
      }
      if (colores.length > 0 && selectedColors.length === 0) {
        alert("Por favor, selecciona al menos un color."); return;
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* MODAL CORREGIDO: Eliminado max-w-[480px], agregado max-w-[1100px] y md:flex-row */}
      <div className="relative bg-white w-full max-w-[1100px] md:h-[650px] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white backdrop-blur-sm rounded-full shadow-lg transition-all"
        >
          <X size={20}/>
        </button>
        
        {/* PARTE IZQUIERDA: IMAGEN (50% en PC) */}
        <div className="w-full md:w-1/2 bg-[#f3f4f6] flex items-center justify-center p-12 md:p-20 relative shrink-0">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain mix-blend-multiply" 
          />
          <div className="absolute bottom-8 left-10 flex">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase bg-white/80 border ${tieneStock ? 'text-green-700 border-green-100' : 'text-red-700 border-red-100'}`}>
              <Box size={12} /> {tieneStock ? `EN STOCK: ${product.stock}` : 'SIN STOCK'}
            </div>
          </div>
        </div>

        {/* PARTE DERECHA: INFORMACIÓN (50% en PC) */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col bg-white overflow-y-auto">
          <div className="mb-8">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-2">{product.categoria}</p>
            <h2 className="text-4xl md:text-5xl font-serif italic text-black leading-tight uppercase tracking-tighter mb-4">{product.nombre}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {product.descripcion || "Diseño exclusivo rorimport con materiales de alta calidad, diseñado para ofrecer comodidad y estilo en cada detalle."}
            </p>
          </div>

          <p className="text-5xl font-black text-black mb-10" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-10 flex-grow">
            {/* COLORES */}
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-black">
                  <Palette size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button 
                      key={c} 
                      onClick={() => toggleColor(c)} 
                      className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedColors.includes(c) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                    >
                      {selectedColors.includes(c) && <Check size={12} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TALLAS */}
            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-black">
                  <Ruler size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => (
                    <button 
                      key={t} 
                      onClick={() => toggleSize(t)} 
                      className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${selectedSizes.includes(t) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-600 hover:border-zinc-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              disabled={!tieneStock}
              onClick={handleAdd}
              className="flex-[4] bg-black text-white py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-xl disabled:bg-zinc-100"
            >
              <ShoppingBag size={20} />
              {tieneStock ? 'AÑADIR AL CARRITO' : 'AGOTADO'}
            </button>
            <button className="flex-1 border-2 border-zinc-100 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-all">
              <Heart size={20} className="text-zinc-400" />
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

  if (loading) return <div className="py-20 text-center font-black tracking-widest text-zinc-300 animate-pulse">CARGANDO...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
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
