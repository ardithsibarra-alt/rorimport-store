import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { X, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';

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

    const colorsLabel = selectedColors.length > 0 ? `(${selectedColors.join(', ')})` : '';
    const sizesLabel = selectedSizes.length > 0 ? `- Tallas: ${selectedSizes.join(', ')}` : '';
    const variantName = `${product.nombre} ${colorsLabel} ${sizesLabel}`;
    
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
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-[2rem] md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all">
          <X size={20}/>
        </button>
        
        <div className="md:w-1/2 bg-[#F9F9F9] flex items-center justify-center p-8">
          <img 
            src={product.imagen || product.image} 
            alt={product.nombre} 
            className="w-full h-auto object-contain drop-shadow-xl" 
          />
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">{product.categoria}</span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-bold uppercase border ${tieneStock ? 'border-green-100 text-green-600' : 'border-red-100 text-red-600'}`}>
              <Box size={10} /> {tieneStock ? `Stock: ${product.stock}` : 'Agotado'}
            </span>
          </div>
          
          <h2 className="text-3xl font-serif italic text-black mb-4">{product.nombre}</h2>
          <p className="text-2xl font-bold text-black mb-6">${product.precio}</p>
          <p className="text-gray-500 text-xs mb-8 leading-relaxed font-medium uppercase tracking-wide">
            {product.descripcion || "Exclusividad y calidad garantizada por RORIMPORT."}
          </p>

          {mostrarVariantes && colores.length > 0 && (
            <div className="mb-6">
              <span className="text-[9px] font-bold uppercase text-gray-400 block mb-3 tracking-widest">Colores</span>
              <div className="flex flex-wrap gap-2">
                {colores.map((color: string) => (
                  <button 
                    key={color} 
                    onClick={() => toggleColor(color)} 
                    className={`px-4 py-2 rounded-lg border text-[9px] font-bold uppercase transition-all ${
                      selectedColors.includes(color) ? 'bg-black border-black text-white' : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mostrarVariantes && tallas.length > 0 && (
            <div className="mb-8">
              <span className="text-[9px] font-bold uppercase text-gray-400 block mb-3 tracking-widest">Tallas</span>
              <div className="flex flex-wrap gap-2">
                {tallas.map((talla: string) => (
                  <button 
                    key={talla} 
                    onClick={() => toggleSize(talla)} 
                    className={`min-w-[45px] h-11 px-3 rounded-lg border text-[10px] font-bold transition-all ${
                      selectedSizes.includes(talla) ? 'bg-black border-black text-white' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            disabled={!tieneStock || (mostrarVariantes && tallas.length > 0 && selectedSizes.length === 0)}
            onClick={handleAdd}
            className="w-full mt-auto bg-black text-white py-5 rounded-xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-gray-900 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-lg"
          >
            {!tieneStock ? 'Agotado' : 'Añadir al carrito'}
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
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [categories, setCategories] = useState(['TODOS']);

  useEffect(() => {
    const q = query(collection(db, "productos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods as any);
      
      const uniqueCategories = [
        'TODOS',
        ...new Set(prods.map((p: any) => p.categoria).filter(Boolean))
      ];
      setCategories(uniqueCategories as string[]);
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = activeCategory === 'TODOS' 
    ? products 
    : products.filter((p: any) => p.categoria === activeCategory);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin inline-block"></div>
      </div>
    );
  }

  return (
    <section id="productos" className="py-20 bg-white scroll-mt-24">
      <div className="container mx-auto px-6">
        
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-serif italic text-black mb-4">Colección</h2>
          <div className="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-4 scroll-smooth">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-[9px] uppercase tracking-[0.2em] transition-all border ${
                  activeCategory === cat 
                  ? 'bg-black border-black text-white shadow-lg' 
                  : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {filteredProducts.map((product: any) => {
            const isOutOfStock = Number(product.stock) <= 0;
            return (
              <div 
                key={product.id} 
                onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] mb-6 rounded-2xl">
                  <img 
                    src={product.imagen || product.image} 
                    alt={product.nombre} 
                    className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`} 
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/90 px-4 py-2 rounded-full shadow-sm text-black">Agotado</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">{product.categoria}</p>
                  <h3 className="text-sm font-serif italic text-black mb-2 group-hover:underline transition-all">
                    {product.nombre}
                  </h3>
                  <span className="text-sm font-bold text-black">${product.precio}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center text-gray-300 font-bold uppercase text-[9px] tracking-[0.5em]">
            Próximamente nuevas piezas.
          </div>
        )}
      </div>

      <ProductDetailsModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}