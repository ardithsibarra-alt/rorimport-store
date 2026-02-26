import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, Box, ShoppingBag, Ruler, Palette, Check } from 'lucide-react';
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
      
      <div className="relative bg-white w-full max-w-[480px] max-h-[95vh] overflow-y-auto rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in duration-300 scrollbar-hide">
        
        {/* BOTÓN CERRAR: Z-index máximo y diseño limpio */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[110] p-3 bg-white/90 hover:bg-black hover:text-white backdrop-blur-sm rounded-full shadow-lg transition-all"
        >
          <X size={20}/>
        </button>
        
        {/* ÁREA DE IMAGEN: Forzado a 0 grados de rotación */}
        <div className="w-full aspect-square bg-[#f3f4f6] flex items-center justify-center p-12">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain transform-none rotate-0 block" 
          />
        </div>

        <div className="p-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start pr-12">
              <div>
                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-1">{product.categoria}</p>
                <h2 className="text-3xl font-serif italic text-black leading-tight uppercase">{product.nombre}</h2>
              </div>
            </div>
            
            <div className="flex">
              <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <Box size={10} /> {tieneStock ? `DISPONIBLE: ${product.stock}` : 'SIN STOCK'}
              </div>
            </div>
          </div>

          <p className="text-5xl font-black text-black" style={robotoStyle}>${product.precio}</p>

          <div className="space-y-8">
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Palette size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Colores (Selección múltiple)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => {
                    const isSelected = selectedColors.includes(c);
                    return (
                      <button 
                        key={c} 
                        onClick={() => toggleColor(c)} 
                        className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${isSelected ? 'bg-black text-white border-black shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                      >
                        {isSelected && <Check size={12} />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Ruler size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tallas (Selección múltiple)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => {
                    const isSelected = selectedSizes.includes(t);
                    return (
                      <button 
                        key={t} 
                        onClick={() => toggleSize(t)} 
                        className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all relative flex items-center justify-center ${isSelected ? 'bg-black text-white border-black shadow-lg scale-105' : 'border-zinc-100 text-zinc-600 hover:border-zinc-300'}`}
                      >
                        {t}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-[#d4af37] rounded-full p-0.5 border-2 border-white">
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

          <button 
            disabled={!tieneStock}
            onClick={handleAdd}
            className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all shadow-xl"
          >
            <ShoppingBag size={20} />
            {tieneStock ? 'AÑADIR AL CARRITO' : 'AGOTADO'}
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
      
      // Filtro flexible: Muestra si es active, o si no tiene status, o si el status está vacío.
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

  if (loading) return <div className="py-20 text-center font-black tracking-widest text-zinc-300 animate-pulse">CARGANDO GALERÍA...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-black text-zinc-400 tracking-[0.2em]">NO SE ENCONTRARON PRODUCTOS DISPONIBLES</p>
          </div>
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
