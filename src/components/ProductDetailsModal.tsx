import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, Box, ShoppingBag, Ruler, Palette } from 'lucide-react';
import { useCart } from '../context/CartContext';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

// --- COMPONENTE DEL MODAL (DETALLE) ---
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
      if (tallas.length > 0 && selectedSizes.length === 0) { alert("Selecciona talla"); return; }
      if (colores.length > 0 && selectedColors.length === 0) { alert("Selecciona color"); return; }
    }
    addToCart({
      id: `${product.id}-${selectedColors.join('')}-${selectedSizes.join('')}`,
      name: product.nombre,
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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* BOTÓN CERRAR: Posicionado para no estorbar */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[100] p-3 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all shadow-md"
        >
          <X size={20}/>
        </button>
        
        {/* IMAGEN: Totalmente RECTA sin inclinaciones */}
        <div className="w-full md:w-1/2 bg-[#F9F9F9] flex items-center justify-center p-10">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-auto max-h-[500px] object-contain transform-none" 
          />
        </div>

        {/* DETALLES */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 pr-10"> {/* pr-10 para alejar del área de la X */}
              <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">{product.categoria}</span>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <Box size={10} /> Stock: {product.stock}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif italic text-black uppercase mb-2">{product.nombre}</h2>
            <p className="text-4xl font-black text-black" style={robotoStyle}>${product.precio}</p>
          </div>

          <div className="space-y-8 mb-10">
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-zinc-400">Colores</span>
                <div className="flex flex-wrap gap-2">
                  {colores.map(c => (
                    <button key={c} onClick={() => setSelectedColors([c])} className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase ${selectedColors.includes(c) ? 'bg-black border-black text-white' : 'border-zinc-100 text-zinc-400'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-zinc-400">Tallas</span>
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
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] mt-auto flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-100"
          >
            <ShoppingBag size={18} />
            {tieneStock ? 'Añadir al carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE DE GALERÍA (PRINCIPAL) ---
export default function ProductGallery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "productos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FILTRO MANUAL: Mostramos solo si status es 'active' o si NO TIENE el campo status aún
      const activeProds = prods.filter((p: any) => p.status === 'active' || p.status === undefined);
      
      setProducts(activeProds as any);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-20 text-center font-black">CARGANDO GALERÍA...</div>;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] mb-4 rounded-3xl">
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-serif italic text-sm uppercase">{p.nombre}</h3>
              <p className="font-black text-xs text-zinc-500">${p.precio}</p>
            </div>
          ))}
        </div>
      </div>

      <ProductDetailsModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
