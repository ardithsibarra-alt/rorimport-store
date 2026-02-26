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
    if (mostrarVariantes) {
      if (tallas.length > 0 && selectedSizes.length === 0) {
        alert("Selecciona talla"); return;
      }
      if (colores.length > 0 && selectedColors.length === 0) {
        alert("Selecciona color"); return;
      }
    }

    const variantName = `${product.nombre} ${selectedColors.join(', ')}`;
    addToCart({
      id: `${product.id}-${selectedColors.join('')}-${selectedSizes.join('')}`,
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* BOTÓN CERRAR: Ajustado para no solapar */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all"
        >
          <X size={20}/>
        </button>
        
        {/* COLUMNA IZQUIERDA: IMAGEN (RECTA) */}
        <div className="w-full md:w-1/2 bg-[#F9F9F9] flex items-center justify-center p-8">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-full object-contain transform-none ${!tieneStock ? 'grayscale opacity-40' : ''}`} 
          />
        </div>

        {/* COLUMNA DERECHA: DETALLES */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">{product.categoria}</span>
            
            {/* STOCK: Movido ligeramente a la izquierda para no quedar bajo la X */}
            <div className="mr-10"> 
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'border-green-100 text-green-600' : 'border-red-100 text-red-600'}`}>
                <Box size={10} /> {tieneStock ? `Stock: ${product.stock}` : 'Agotado'}
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-serif italic text-black mb-4 uppercase">{product.nombre}</h2>
          <p className="text-4xl font-bold text-black mb-8">${product.precio}</p>

          <div className="flex-grow space-y-6">
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Palette size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button key={c} onClick={() => setSelectedColors([c])} className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase ${selectedColors.includes(c) ? 'bg-black border-black text-white' : 'border-zinc-100 text-zinc-400'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Ruler size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map(t => (
                    <button key={t} onClick={() => setSelectedSizes([t])} className={`w-12 h-12 rounded-xl border-2 font-black text-xs flex items-center justify-center ${selectedSizes.includes(t) ? 'bg-black border-black text-white' : 'border-zinc-100 text-zinc-600'}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={!tieneStock}
            onClick={handleAdd}
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] mt-8 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-zinc-100"
          >
            <ShoppingBag size={18} />
            {tieneStock ? 'Añadir al carrito' : 'Agotado'}
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
    // FILTRO: Solo productos con status 'active'
    const q = query(collection(db, "productos"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods as any);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-20 text-center uppercase font-black">Cargando...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] mb-4 rounded-3xl shadow-sm">
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-serif italic text-sm uppercase">{p.nombre}</h3>
              <p className="font-black text-xs">${p.precio}</p>
            </div>
          ))}
        </div>
      </div>
      <ProductDetailsModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
