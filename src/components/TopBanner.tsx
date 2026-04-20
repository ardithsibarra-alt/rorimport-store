import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Megaphone } from 'lucide-react';

export default function TopBanner() {
  const [config, setConfig] = useState({
    bannerTexto: "",
    modoMantenimiento: false
  });

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('configuracion')
      .select('bannerTexto, modoMantenimiento')
      .eq('id', 'tienda')
      .single();

    if (!error && data) {
      setConfig(data);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Escuchar cambios en tiempo real en la tabla de configuración
    const channel = supabase
      .channel('public:configuracion')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'configuracion',
        filter: "id=eq.tienda" 
      }, (payload) => {
        setConfig(payload.new as any);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (config.modoMantenimiento || !config.bannerTexto) return null;

  return (
    <div className="relative z-[70] bg-[#12263f] border-b border-white/5">
      <div className="container mx-auto px-4 py-2.5 flex justify-center items-center">
        
        <div className="flex items-center gap-3 group cursor-default">
          <div className="bg-[#d4af37]/10 p-1.5 rounded-lg">
            <Megaphone size={14} className="text-[#d4af37] animate-bounce" />
          </div>
          <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/90 text-center">
            {config.bannerTexto}
          </p>
        </div>
        
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
    </div>
  );
}
