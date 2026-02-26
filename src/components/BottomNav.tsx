import React from 'react';
import { Grid, ShoppingCart, User, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomNav({ onCartClick }: { onCartClick: () => void }) {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 px-2 py-2 z-[100] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      <button 
        onClick={scrollToTop}
        className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 hover:text-white transition-all active:scale-90"
      >
        <Home size={20} strokeWidth={1.5} />
      </button>

      <button className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 hover:text-white transition-all active:scale-90">
        <Grid size={20} strokeWidth={1.5} />
      </button>

      <button 
        onClick={onCartClick}
        className="relative flex items-center justify-center bg-[#d4af37] text-black w-16 h-12 rounded-2xl shadow-[0_8px_20px_rgba(212,175,55,0.3)] transform active:scale-95 transition-all"
      >
        <ShoppingCart size={22} strokeWidth={2.5} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
            {cartCount}
          </span>
        )}
      </button>

      <button className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 hover:text-white transition-all active:scale-90">
        <User size={20} strokeWidth={1.5} />
      </button>

      <button 
        onClick={scrollToTop}
        className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-full transition-all active:scale-90"
      >
        <span className="text-white font-serif italic font-bold text-[10px] tracking-tighter">RI</span>
      </button>
      
    </div>
  );
}