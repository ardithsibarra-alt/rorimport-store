import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { X, Box, ShoppingBag, Ruler, Palette } from 'lucide-react';
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

  const handleAdd = () => {
    if (mostrarVariantes && (tallas.length > 0 && selectedSizes.length === 0)) {
      alert("Selecciona talla"); return;
    }
    const variantName = `${product.nombre} ${selectedColors.join(', ')}`;
    addToCart({
      id: `${product.id}-${selectedColors.join('')}`,
      name: variantName,
      price: product.precio,
      image: product.imagen || product.image,
      quantity: 1,
      selectedSize: selectedSizes.join(', '),
      selectedColor: selectedColors.join(', ')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* CONTENEDOR VERTICAL PARA PC Y MÓVIL */}
      <div className="relative bg-white w-full max-w-[450px] max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in duration-300 scrollbar-hide">
        
        {/* BOTÓN CERRAR: Flotante y arriba para no interferir */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-[100] p-3 bg-white/80 hover:bg-black hover:text-white backdrop-blur-sm rounded-full shadow-lg transition-all"
        >
          <X size={20}/>
        </button>
        
        {/* ÁREA DE IMAGEN: 100% RECTA, SIN ROTACIÓN */}
        <div className="w-full aspect-square bg-[#f3f4f6] flex items-center justify-center p-10">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-full object-contain transform-none block" 
            /* Se usa transform-none para forzar que no haya rotación */
          />
        </div>

        {/* ÁREA DE CONTENIDO: Debajo de la imagen */}
        <div className="p-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{product.categoria}</p>
              <h2 className="text-3xl font-serif italic text-black leading-none uppercase">{product.nombre}</h2>
            </div>
            {/* STOCK: Separado totalmente de la X */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${tieneStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <Box size={10} /> {tieneStock ? `DISPONIBLE: ${product.stock}` : 'SIN STOCK'}
            </div>
          </div>

          <p className="text-4xl font-black text-black" style={robotoStyle}>${product.precio}</p>

          {/* VARIANTES (Colores/Tallas) */}
          <div className="space-y-6">
            {mostrarVariantes && colores.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colores.map(c => (
                  <button key={c} onClick={() => setSelectedColors([c])} className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase ${selectedColors.includes(c) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}>{c}</button>
                ))}
              </div>
            )}
            {mostrarVariantes && tallas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tallas.map(t => (
                  <button key={t} onClick={() => setSelectedSizes([t])} className={`w-12 h-12 rounded-xl border-2 font-black text-xs ${selectedSizes.includes(t) ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-600'}`}>{t}</button>
                ))}
              </div>
            )}
          </div>

          <button 
            disabled={!tieneStock}
            onClick={handleAdd}
            className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-100 transition-all shadow-xl"
          >
            <ShoppingBag size={18} />
            {tieneStock ? 'COMPRAR AHORA' : 'AGOTADO'}
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
    // FILTRO ACTIVO: Solo trae productos con status: 'active'
    const q = query(collection(db, "productos"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-20 text-center font-black">CARGANDO...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="cursor-pointer group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-3xl mb-4">
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h3 className="font-serif italic text-sm uppercase">{p.nombre}</h3>
              <p className="font-black text-xs text-zinc-400">${p.precio}</p>
            </div>
          ))}
        </div>
      </div>
      <ProductDetailsModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
