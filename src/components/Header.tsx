import { ShoppingCart, Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import CartModal from './CartModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasBanner, setHasBanner] = useState(false);
  const { getTotalItems } = useCart();

  const robotoStyle = { fontFamily: "'Roboto Condensed'" };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "configuracion", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setHasBanner(!!data.bannerTexto);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsub();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = isScrolled ? 50 : 65; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <div className={`${isScrolled ? 'h-[50px]' : hasBanner ? 'h-[94px] md:h-[104px]' : 'h-[64px]'}`} />

      <header 
        className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled 
            ? 'top-0 bg-white/95 backdrop-blur-md shadow-sm' 
            : `${hasBanner ? 'top-[44px] md:top-[40px]' : 'top-0'} bg-white`
        } text-black`}
      >
        <div className="container mx-auto px-8 py-2">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-4 cursor-pointer group"
              onClick={() => scrollToSection('inicio')}
            >
              <div className="w-10 h-10 bg-black border-2 border-black rounded-full flex items-center justify-center font-serif italic text-white transform group-hover:scale-105 transition-all shadow-md">
                <span className="text-sm font-black tracking-tighter" style={robotoStyle}>SP</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-serif tracking-tighter italic text-black leading-[0.7] mt-1" style={robotoStyle}>
                  RORIMPORT
                </h1>
                <span className="text-[8px] font-bold tracking-[0.4em] text-gray-400 uppercase mt-1" style={robotoStyle}>Since 2024</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Inicio', id: 'inicio' },
                { name: 'Colección', id: 'productos' },
                { name: 'Importaciones', id: 'encargos' },
                { name: 'Contacto', id: 'contacto' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-gray-400 transition-all relative group py-1"
                  style={robotoStyle}
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full transform hover:scale-105 active:scale-95 transition-all shadow-lg group"
                style={robotoStyle}
              >
                <ShoppingCart size={15} strokeWidth={2.5} />
                <span className="hidden md:inline text-[9px] font-black tracking-widest uppercase">Carrito</span>
                {getTotalItems() > 0 && (
                  <span className="bg-white text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-black">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1.5 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-colors"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}