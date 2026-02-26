import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Phone, MapPin, CheckCircle, Lock, Trash2, DollarSign, AlertTriangle, Save, 
  Plus, X, Upload, Loader2, Edit2, Globe, Truck, Package, Tag, Clock, ChevronDown, LogOut, Eye, EyeOff
} from 'lucide-react';

const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

function EditableAmount({ orderId, currentAmount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentAmount);

  const save = async () => {
    try {
      const numericValue = parseFloat(value) || 0;
      await updateDoc(doc(db, "pedidos", orderId), {
        total: numericValue
      });
      setIsEditing(false);
    } catch (e) {
      alert("Error al actualizar monto");
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 bg-zinc-100 p-2 rounded-lg">
        <span className="font-bold text-zinc-900">$</span>
        <input
          type="number"
          className="w-24 bg-transparent border-b-2 border-black text-lg font-black text-zinc-900 outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button onClick={save} className="text-black hover:bg-zinc-200 p-1 rounded-md">
          <CheckCircle size={20}/>
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
      <span className="text-2xl font-black text-zinc-900 tracking-tighter italic" style={robotoStyle}>
        ${Number(currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
      <Edit2 size={14} className="text-zinc-300 group-hover:text-black transition-colors" />
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [categories, setCategories] = useState(["ROPA", "CALZADO", "GYM", "HOGAR", "ACCESORIOS"]);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('pedidos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const IMGBB_API_KEY = "1669faef131ea5deed75fcd400c486ec"; 

  const [config, setConfig] = useState({ tasaDolar: 0, modoMantenimiento: false, bannerTexto: "" });
  const [newProduct, setNewProduct] = useState({ 
    nombre: '', precio: '', imagen: '', categoria: '', 
    stock: '', descripcion: '', aplicaVariantes: false, tallas: [], colores: [], inhabilitado: false
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubOrders = onSnapshot(query(collection(db, "pedidos"), orderBy("fecha", "desc")), (snapshot) => {
      setOrders(snapshot.docs.map(doc => {
        const data = doc.data();
        let totalCalculado = data.total || 0;
        
        if (!totalCalculado && data.items) {
          totalCalculado = data.items.reduce((acc, item) => acc + (Number(item.precio || 0) * (item.cantidad || 1)), 0);
        }

        return { id: doc.id, ...data, total: totalCalculado };
      }));
    });

    const unsubProducts = onSnapshot(collection(db, "productos"), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);

      const uniqueCats = [...new Set(prods.map(p => p.categoria))].filter(Boolean);
      const baseCats = ["ROPA", "CALZADO", "GYM", "HOGAR", "ACCESORIOS"];
      setCategories([...new Set([...baseCats, ...uniqueCats])]);
    });

    const unsubConfig = onSnapshot(doc(db, "configuracion", "tienda"), (snapshot) => {
      if (snapshot.exists()) setConfig(snapshot.data());
    });

    return () => { unsubOrders(); unsubProducts(); unsubConfig(); };
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Credenciales incorrectas o usuario no autorizado");
    }
  };

  const handleLogout = () => signOut(auth);

  const stats = orders.reduce((acc, order) => {
    const monto = Number(order.total || 0);
    const orderIdStr = String(order.id || "").toUpperCase();
    if (orderIdStr.includes('-I')) acc.internacional += monto;
    else acc.nacional += monto;
    acc.totalRecaudado += monto;
    return acc;
  }, { totalRecaudado: 0, internacional: 0, nacional: 0 });

  const handleCompletarPedido = async (orderId) => {
    try {
      await updateDoc(doc(db, "pedidos", orderId), { 
        estado: 'completado',
        fechaEntrega: serverTimestamp()
      });
    } catch (e) {
      alert("Error al actualizar");
    }
  };

  const toggleInhabilitar = async (prod) => {
    try {
      await updateDoc(doc(db, "productos", prod.id), {
        inhabilitado: !prod.inhabilitado
      });
    } catch (e) {
      alert("Error al cambiar estado");
    }
  };

  const filteredProducts = products.filter(prod => {
    if (filterStatus === "ACTIVO") return prod.stock > 0 && !prod.inhabilitado;
    if (filterStatus === "AGOTADO") return prod.stock <= 0;
    if (filterStatus === "INHABILITADO") return prod.inhabilitado === true;
    return true;
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) setNewProduct({ ...newProduct, imagen: data.data.url });
    } catch (error) {
      alert("Error en carga de imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.imagen) return alert("Sube una imagen");
    if (!newProduct.categoria) return alert("Escribe o selecciona una categoría");
    
    try {
      await addDoc(collection(db, "productos"), {
        ...newProduct,
        precio: Number(newProduct.precio),
        stock: Number(newProduct.stock),
        fechaCreacion: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewProduct({ nombre: '', precio: '', imagen: '', categoria: '', stock: '', descripcion: '', aplicaVariantes: false, tallas: [], colores: [], inhabilitado: false });
    } catch (error) {
      alert("Error al guardar");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} 
              className="bg-white p-8 rounded-[2rem] w-full max-w-[320px]">
          <h2 className="text-center font-black italic mb-6 text-xl" style={robotoStyle}>ROR ADMIN</h2>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="CORREO" 
                 className="w-full p-4 bg-zinc-100 rounded-xl mb-3 text-sm font-bold outline-none" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="CONTRASEÑA" 
                 className="w-full p-4 bg-zinc-100 rounded-xl mb-6 text-sm font-bold outline-none" required />
          <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-800 transition-colors" style={robotoStyle}>Entrar con Seguridad</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-20">
      <header className="bg-white border-b p-6 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
            <h1 className="font-black italic text-2xl tracking-tighter" style={robotoStyle}>ROR CONSOLE</h1>
            <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={8}/> Conexión Segura</span>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-zinc-100 p-1 rounded-xl">
            {['pedidos', 'inventario', 'config'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${activeTab === t ? 'bg-black text-white' : 'text-zinc-400'}`} style={robotoStyle}>{t}</button>
            ))}
            </div>
            <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                <LogOut size={20}/>
            </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black text-white p-6 rounded-3xl">
            <p className="text-[9px] font-bold uppercase opacity-50 tracking-widest" style={robotoStyle}>Global Revenue</p>
            <h3 className="text-3xl font-black italic" style={robotoStyle}>${stats.totalRecaudado.toLocaleString()}</h3>
          </div>
          <div className="bg-white border p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest italic" style={robotoStyle}>International</p>
              <Globe size={14} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-black italic text-blue-600" style={robotoStyle}>${stats.internacional.toLocaleString()}</h3>
          </div>
          <div className="bg-white border p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest italic" style={robotoStyle}>Nacional</p>
              <Truck size={14} />
            </div>
            <h3 className="text-2xl font-black italic" style={robotoStyle}>${stats.nacional.toLocaleString()}</h3>
          </div>
        </div>

        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black bg-zinc-100 px-2 py-1 rounded" style={robotoStyle}>ID: {order.id.toUpperCase()}</span>
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase italic ${order.id.includes('-I') ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-800'}`} style={robotoStyle}>
                        {order.id.includes('-I') ? 'Internacional' : 'Nacional'}
                      </span>
                    </div>

                    <div className="flex gap-6 items-center">
                      <div className="text-right">
                        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest" style={robotoStyle}>Ingreso</p>
                        <p className="text-[10px] font-black text-zinc-900" style={robotoStyle}>
                          {order.fecha?.toDate ? order.fecha.toDate().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : '...'}
                        </p>
                      </div>
                      {order.fechaEntrega && (
                        <div className="text-right border-l pl-6 border-zinc-100">
                          <p className="text-[7px] font-black text-green-500 uppercase tracking-widest" style={robotoStyle}>Entregado</p>
                          <p className="text-[10px] font-black text-green-600" style={robotoStyle}>
                            {order.fechaEntrega?.toDate ? order.fechaEntrega.toDate().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : '...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 className="text-4xl font-serif italic mb-4">{order.cliente?.nombre}</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase text-zinc-400 border-b pb-4 mb-4">
                    <p className="flex items-center gap-2" style={robotoStyle}><Phone size={12}/> {order.cliente?.telefono}</p>
                    <p className="flex items-center gap-2" style={robotoStyle}><MapPin size={12}/> {order.cliente?.direccion}</p>
                  </div>

                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-[11px] font-black py-1" style={robotoStyle}>
                      <span>{item.nombre} (x{item.cantidad || 1})</span>
                      <span>${((item.precio || 0) * (item.cantidad || 1)).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t-2 border-black flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={robotoStyle}>Total de la Orden</span>
                    <EditableAmount orderId={order.id} currentAmount={order.total} />
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button onClick={() => confirm("Eliminar?") && deleteDoc(doc(db, "pedidos", order.id))} className="p-4 bg-zinc-50 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20}/></button>
                  
                  {order.estado !== 'completado' ? (
                    <button 
                      onClick={() => handleCompletarPedido(order.id)} 
                      className="p-4 bg-zinc-900 text-white hover:bg-green-600 rounded-2xl transition-all flex items-center justify-center"
                    >
                      <CheckCircle size={20}/>
                    </button>
                  ) : (
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                      <Package size={20}/>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inventario' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl w-fit">
                {["TODOS", "ACTIVO", "AGOTADO", "INHABILITADO"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${filterStatus === status ? 'bg-black text-white shadow-md' : 'text-zinc-400 hover:text-black'}`}
                    style={robotoStyle}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2" style={robotoStyle}>
                <Plus size={16}/> New Entry
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map(prod => (
                <div key={prod.id} className={`bg-white border rounded-3xl overflow-hidden group transition-all ${prod.inhabilitado ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                  <div className="h-40 bg-zinc-100 relative">
                    <img src={prod.imagen} className="w-full h-full object-cover" alt={prod.nombre} />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button 
                        onClick={() => toggleInhabilitar(prod)} 
                        className="p-2 bg-white/90 rounded-lg text-zinc-600 hover:text-blue-500 transition-colors shadow-sm"
                      >
                        {prod.inhabilitado ? <Eye size={14}/> : <EyeOff size={14}/>}
                      </button>
                      <button 
                        onClick={() => confirm("Eliminar?") && deleteDoc(doc(db, "productos", prod.id))} 
                        className="p-2 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    {prod.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-black italic text-[10px] uppercase tracking-tighter" style={robotoStyle}>Sin Existencias</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[9px] font-black text-zinc-400 uppercase" style={robotoStyle}>{prod.categoria}</p>
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${prod.inhabilitado ? 'bg-red-100 text-red-600' : (prod.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500')}`}>
                        {prod.inhabilitado ? 'OFF' : (prod.stock > 0 ? 'ON' : 'OUT')}
                      </span>
                    </div>
                    <h5 className="font-black text-xs uppercase mb-3 truncate" style={robotoStyle}>{prod.nombre}</h5>
                    <div className="flex justify-between items-center">
                      <span className="font-black italic text-lg" style={robotoStyle}>${prod.precio}</span>
                      <div className="flex items-center gap-2 bg-zinc-50 px-2 py-1 rounded-lg">
                        <span className="text-[9px] font-black opacity-40" style={robotoStyle}>STK:</span>
                        <input 
                          type="number" 
                          defaultValue={prod.stock} 
                          onBlur={(e) => updateDoc(doc(db, "productos", prod.id), { stock: parseInt(e.target.value) })} 
                          className="w-10 text-right font-black text-xs focus:text-blue-600 outline-none bg-transparent" 
                          style={robotoStyle} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-xl mx-auto bg-white border rounded-[2rem] p-8 shadow-sm">
            <h2 className="font-black italic text-lg mb-6 uppercase tracking-tight" style={robotoStyle}>Global Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 block ml-1" style={robotoStyle}>Tasa del Día (BCV)</label>
                <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-2xl">
                  <span className="text-lg font-black italic opacity-30">Bs.</span>
                  <input type="number" value={config.tasaDolar} onChange={(e) => setConfig({...config, tasaDolar: parseFloat(e.target.value)})} className="text-4xl font-black w-full bg-transparent outline-none focus:text-black" style={robotoStyle} />
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 block ml-1" style={robotoStyle}>Banner de Anuncio</label>
                <input type="text" value={config.bannerTexto} onChange={(e) => setConfig({...config, bannerTexto: e.target.value})} className="w-full text-sm font-bold bg-zinc-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black" style={robotoStyle} />
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase italic" style={robotoStyle}>Modo Mantenimiento</span>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase">Congelar Tienda</span>
                </div>
                <button onClick={() => setConfig({...config, modoMantenimiento: !config.modoMantenimiento})} className={`w-10 h-5 rounded-full relative transition-colors ${config.modoMantenimiento ? 'bg-red-500' : 'bg-zinc-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${config.modoMantenimiento ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
              <button onClick={async () => { await updateDoc(doc(db, "configuracion", "tienda"), config); alert("Sincronizado"); }} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-zinc-800 transition-all" style={robotoStyle}>
                <Save size={16}/> Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center px-8 py-4 border-b border-zinc-100">
              <h3 className="font-black italic text-lg uppercase tracking-tighter" style={robotoStyle}>New Product Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="px-8 py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] font-black text-zinc-400 uppercase ml-2" style={robotoStyle}>Nombre del Producto</label>
                    <input type="text" placeholder="EJ: NIKE AIR JORDAN" required value={newProduct.nombre} onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value.toUpperCase()})} className="w-full p-3 bg-zinc-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-black transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-zinc-400 uppercase ml-2" style={robotoStyle}>Precio $</label>
                      <input type="number" placeholder="0.00" required value={newProduct.precio} onChange={(e) => setNewProduct({...newProduct, precio: e.target.value})} className="w-full p-3 bg-zinc-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-zinc-400 uppercase ml-2" style={robotoStyle}>Stock Inicial</label>
                      <input type="number" placeholder="0" required value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-3 bg-zinc-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-black" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-zinc-400 uppercase ml-2" style={robotoStyle}>Categoría</label>
                      <div className="relative">
                        <input 
                          list="category-list"
                          value={newProduct.categoria} 
                          onChange={(e) => setNewProduct({...newProduct, categoria: e.target.value.toUpperCase()})} 
                          placeholder="BUSCAR O CREAR..."
                          className="w-full p-3 bg-zinc-50 border-none rounded-xl font-black text-[10px] uppercase focus:ring-2 focus:ring-black"
                        />
                        <datalist id="category-list">
                          {categories.map(c => <option key={c} value={c} />)}
                        </datalist>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-zinc-400 uppercase ml-2" style={robotoStyle}>Descripción</label>
                      <textarea 
                        placeholder="DETALLES..." 
                        value={newProduct.descripcion} 
                        onChange={(e) => setNewProduct({...newProduct, descripcion: e.target.value})}
                        className="w-full p-3 bg-zinc-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-black h-[42px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-zinc-200 rounded-[1.5rem] flex flex-col items-center justify-center p-2 relative bg-zinc-50 group hover:bg-zinc-100 transition-colors min-h-[160px]">
                  {isUploading ? <Loader2 className="animate-spin text-black" /> : (
                    newProduct.imagen ? (
                      <div className="relative w-full h-full">
                        <img src={newProduct.imagen} className="w-full h-full max-h-[180px] object-contain rounded-[1rem]" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1rem] flex items-center justify-center">
                          <Upload className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-zinc-300 mb-1" size={28} />
                        <span className="text-[9px] font-black text-zinc-400 uppercase" style={robotoStyle}>Subir Imagen</span>
                      </>
                    )
                  )}
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-[1.5rem] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase" style={robotoStyle}>Habilitar Variantes</span>
                    <span className="text-[8px] text-zinc-400 uppercase font-bold" style={robotoStyle}>Tallas y Colores</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNewProduct({...newProduct, aplicaVariantes: !newProduct.aplicaVariantes})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${newProduct.aplicaVariantes ? 'bg-black' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${newProduct.aplicaVariantes ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {newProduct.aplicaVariantes && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200">
                    <div>
                      <label className="text-[8px] font-black text-zinc-400 uppercase ml-1" style={robotoStyle}>Tallas</label>
                      <input 
                        type="text" 
                        placeholder="S, M, L..."
                        className="w-full bg-white border-none rounded-lg px-3 py-2 mt-1 text-[10px] font-bold focus:ring-1 focus:ring-black"
                        onChange={(e) => setNewProduct({...newProduct, tallas: e.target.value.split(',').map(t => t.trim().toUpperCase()).filter(t => t !== "")})}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-zinc-400 uppercase ml-1" style={robotoStyle}>Colores</label>
                      <input 
                        type="text" 
                        placeholder="Rojo, Azul..."
                        className="w-full bg-white border-none rounded-lg px-3 py-2 mt-1 text-[10px] font-bold focus:ring-1 focus:ring-black"
                        onChange={(e) => setNewProduct({...newProduct, colores: e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c !== "")})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50" style={robotoStyle}>
                Ingresar al Sistema
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
