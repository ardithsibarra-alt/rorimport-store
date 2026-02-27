import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, Box, ShoppingBag, Ruler, Palette, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

function ModalVistaUnica({ product, isOpen, onClose }: any) {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  if (!isOpen || !product) return null;

  const mostrarVariantes = product.aplicaVariantes !== false;
  const tallas = (mostrarVariantes && Array.isArray(product.tallas)) ? product.tallas : [];
  const colores = (mostrarVariantes && Array.isArray(product.colores)) ? product.colores : [];
  const tieneStock = Number(product.stock) > 0;

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const seleccionIncompleta = () => {
    if (!mostrarVariantes) return false;
    const faltaTalla = tallas.length > 0 && selectedSizes.length === 0;
    const faltaColor = colores.length > 0 && selectedColors.length === 0;
    return faltaTalla || faltaColor;
  };

  const estaBloqueado = !tieneStock || seleccionIncompleta();

  const handleAdd = () => {
    if (estaBloqueado) return;

    const finalColors = colores.length > 0 ? selectedColors : ["N/A"];
    const finalSizes = tallas.length > 0 ? selectedSizes : ["N/A"];

    finalColors.forEach(color => {
      finalSizes.forEach(size => {
        const variantName = `${product.nombre}${color !== 'N/A' ? ` (${color})` : ''}${size !== 'N/A' ? ` - ${size}` : ''}`;
        
        addToCart({
          id: `${product.id}-${color}-${size}`,
          name: variantName,
          price: product.precio,
          image: product.imagen || product.image,
          quantity: 1,
          selectedSize: size,
          selectedColor: color
        });
      });
    });

    setSelectedColors([]);
    setSelectedSizes([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { 
          -ms-overflow-style: none !important; 
          scrollbar-width: none !important; 
          overflow-y: auto !important;
        }
      `}`}</style>

      <div className="relative bg-white w-full max-w-[1100px] h-full md:h-auto md:max-h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white rounded-full shadow-lg transition-all">
          <X size={20}/>
        </button>
        
        <div className="w-full md:w-1/2 bg-[#f3f4f6] flex items-center justify-center p-8 md:p-20 shrink-0 h-[35vh] md:h-auto">
          <img src={product.imagen || product.image} alt={product.nombre} className="w-full h-full object-contain mix-blend-multiply" />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center bg-white overflow-y-auto no-scrollbar">
          <div className="mb-4">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-2">{product.categoria}</p>
            <h2 className="text-3xl md:text-5xl font-serif italic text-black leading-tight uppercase tracking-tighter mb-2">{product.nombre}</h2>
            <p className="text-4xl md:text-5xl font-black text-black" style={robotoStyle}>${product.precio}</p>
          </div>

          <div className="space-y-6 md:space-y-10">
            {colores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-widest">
                  <Palette size={14} /> COLORES SELECCIONADOS ({selectedColors.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button 
                      key={c} 
                      onClick={() => toggleColor(c)} 
                      className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedColors.includes(c) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}
                    >
                      {selectedColors.includes(c) && <Check size={10} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tallas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-widest">
                  <Ruler size={14} /> TALLAS SELECCIONADAS ({selectedSizes.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => (
                    <button 
                      key={t} 
                      onClick={() => toggleSize(t)} 
                      className={`w-12 h-12 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center relative ${selectedSizes.includes(t) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-500'}`}
                    >
                      {selectedSizes.includes(t) && <Check size={8} className="absolute top-1 right-1" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400">
               <Box size={14} /> STOCK DISPONIBLE: {product.stock}
            </div>
          </div>

          <div className="mt-8 md:mt-12">
            <button 
              disabled={estaBloqueado}
              onClick={handleAdd}
              className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase text-[11px] md:text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl ${
                estaBloqueado 
                ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
              }`}
            >
              <ShoppingBag size={20} />
              {!tieneStock ? 'AGOTADO' : seleccionIncompleta() ? 'SELECCIONA OPCIONES' : `AÑADIR ${selectedSizes.length * (selectedColors.length || 1)} AL CARRITO`}
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
      const activeProds = allProds.filter((p: any) => 
        Number(p.stock) > 0 && p.inhabilitado !== true
      );
      setProducts(activeProds as any);
      setLoading(false);
    }, (error) => {
      console.error("Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-20 text-center font-black tracking-[0.5em] text-zinc-300 animate-pulse">CARGANDO GALERÍA...</div>;

  if (products.length === 0) return (
    <div className="py-20 text-center font-black text-zinc-400 uppercase tracking-widest">
      No hay productos activos para mostrar.
    </div>
  );

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="cursor-pointer group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-[2rem] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img src={p.imagen || p.image} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{p.categoria}</p>
              <h3 className="font-serif italic text-base uppercase text-black mb-1 leading-none">{p.nombre}</h3>
              <p className="font-black text-sm text-black" style={robotoStyle}>${p.precio}</p>
            </div>
          ))}
        </div>
      </div>
      
      <ModalVistaUnica 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
