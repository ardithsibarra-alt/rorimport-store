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

  const toggleSize = (talla: string) => {
    setSelectedSizes(prev => 
      prev.includes(talla) ? prev.filter(t => t !== talla) : [...prev, talla]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleAdd = () => {
    if (mostrarVariantes) {
      if (tallas.length > 0 && selectedSizes.length === 0) {
        alert("Selecciona al menos una talla");
        return;
      }
      if (colores.length > 0 && selectedColors.length === 0) {
        alert("Selecciona al menos un color");
        return;
      }
    }

    const variantName = `${product.nombre} ${selectedColors.length > 0 ? `(${selectedColors.join(', ')})` : ''} ${selectedSizes.length > 0 ? `- Tallas: ${selectedSizes.join(', ')}` : ''}`;
    
    addToCart({
      id: `${product.id}-${selectedColors.sort().join('')}-${selectedSizes.sort().join('')}`,
      name: variantName,
      price: product.precio,
      image: product.imagen || product.image,
      quantity: 1,
      selectedSize: mostrarVariantes ? selectedSizes.join(', ') : 'N/A',
      selectedColor: mostrarVariantes ? selectedColors.join(', ') : 'N/A'
    });
    
    setSelectedSizes([]);
    setSelectedColors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* BOTÓN CERRAR: Reubicado para no estorbar en PC */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[100] p-3 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all shadow-sm"
        >
          <X size={20}/>
        </button>
        
        {/* LADO IMAGEN: Eliminada la inclinación md:-rotate-12 */}
        <div className="w-full md:w-1/2 bg-[#F9F9F9] flex items-center justify-center p-12 min-h-[350px]">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className={`w-full h-auto max-h-[400px] md:max-h-none object-contain drop-shadow-2xl transition-all ${!tieneStock ? 'grayscale opacity-40' : ''}`} 
          />
        </div>

        {/* LADO DETALLES */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col">
          <div className="flex flex-col mb-4">
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-2">{product.categoria}</span>
            {/* STOCK: Debajo de la categoría para evitar el botón X */}
            <div className="flex items-center">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tieneStock ? 'border-green-100 bg-green-50 text-green-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                <Box size={10} /> {tieneStock ? `Stock: ${product.stock} unidades` : 'Agotado'}
              </span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif italic text-black mb-4 uppercase leading-tight">{product.nombre}</h2>
          <p className="text-4xl font-bold text-black mb-8">${product.precio}</p>

          <div className="space-y-8 mb-10">
            {mostrarVariantes && colores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Palette size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Colores</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color: string) => (
                    <button 
                      key={color} 
                      onClick={() => toggleColor(color)} 
                      className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                        selectedColors.includes(color) ? 'bg-black border-black text-white' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarVariantes && tallas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Ruler size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Tallas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla: string) => (
                    <button 
                      key={talla} 
                      onClick={() => toggleSize(talla)} 
                      className={`w-14 h-14 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center ${
                        selectedSizes.includes(talla) ? 'bg-black border-black text-white' : 'border-zinc-100 text-zinc-600 hover:border-zinc-200'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <button 
              disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
              onClick={handleAdd}
              className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <ShoppingBag size={20} />
              {!tieneStock ? 'Agotado' : 'Añadir al carrito'}
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
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [categories, setCategories] = useState(['TODOS']);

  useEffect(() => {
    // MODIFICACIÓN: Ahora filtra por status 'active'
    const q = query(
      collection(db, "productos"), 
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods as any);
      const uniqueCategories = ['TODOS', ...new Set(prods.map((p: any) => p.categoria).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = activeCategory === 'TODOS' ? products : products.filter((p: any) => p.categoria === activeCategory);

  if (loading) return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin inline-block"></div>
    </div>
  );

  return (
    <section id="productos" className="py-20 bg-white scroll-mt-24 pb-40">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-6xl font-serif italic text-black mb-6 uppercase tracking-tighter">Colección</h2>
          <div className="flex justify-center items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all border ${
                  activeCategory === cat ? 'bg-black border-black text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-black hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
          {filteredProducts.map((product: any) => {
            const isOutOfStock = Number(product.stock) <= 0;
            return (
              <div 
                key={product.id} 
                onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] mb-4 rounded-[1.5rem] md:rounded-3xl shadow-sm">
                  <img 
                    src={product.imagen || product.image} 
                    alt={product.nombre} 
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-30 grayscale' : ''}`} 
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/90 px-4 py-2 rounded-full shadow-md text-black">Agotado</span>
                    </div>
                  )}
                </div>

                <div className="px-2">
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">{product.categoria}</p>
                  <h3 className="text-xs md:text-sm font-serif italic text-black mb-1 line-clamp-1 uppercase">
                    {product.nombre}
                  </h3>
                  <span className="text-sm font-black text-black">${product.precio}</span>
                </div>
              </div>
            );
          })}
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
