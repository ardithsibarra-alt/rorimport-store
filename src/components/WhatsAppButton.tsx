import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "584224421040";
  const message = encodeURIComponent("Hola Rorimport Store, tengo una consulta.");

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center group">
      <a
        href={`https://wa.me/${phoneNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping"></span>
          <MessageCircle className="w-6 h-6 relative z-10" />
        </div>
        <span className="font-bold text-sm tracking-wide">
          CONTÁCTANOS
        </span>
      </a>
    </div>
  );
}
