import React from 'react';
import { Grid, ShoppingCart, User, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface BottomNavProps {
  onCartClick: () => void;
  isVisible: boolean; 
}

export default function BottomNav({ onCartClick, isVisible }: BottomNavProps) {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-black/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 px-2 py-2 z-[999] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-10 duration-300">
      
      <button 
        onClick={scrollToTop}
        className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 active:text-[#d4af37] transition-all active:scale-90"
      >
        <Home size={22} strokeWidth={1.5} />
      </button>

      <button className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 active:text-[#d4af37] transition-all active:scale-90">
        <Grid size={22} strokeWidth={1.5} />
      </button>

      <button 
        onClick={(e) => {
          e.preventDefault();
          onCartClick();
        }}
        className="relative flex items-center justify-center bg-[#d4af37] text-black w-16 h-12 rounded-[1.5rem] shadow-[0_8px_20px_rgba(212,175,55,0.4)] transform active:scale-95 transition-all"
      >
        <ShoppingCart size={22} strokeWidth={2.5} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-1 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
            {cartCount}
          </span>
        )}
      </button>

      <button className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 active:text-[#d4af37] transition-all active:scale-90">
        <User size={22} strokeWidth={1.5} />
      </button>

      <button 
        onClick={scrollToTop}
        className="flex items-center justify-center w-10 h-10 bg-white/10 border border-white/20 rounded-full transition-all active:scale-90 mr-1"
      >
        <span className="text-white font-serif italic font-bold text-[10px] tracking-tighter">RI</span>
      </button>
      
    </div>
  );
}
