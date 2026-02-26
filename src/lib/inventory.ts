import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';

export const processStockUpdate = async (cartItems: any[]) => {
  try {
    await runTransaction(db, async (transaction) => {
      // 1. Preparamos las referencias y validamos datos
      const updates = cartItems.map(item => {
        // Extraemos el ID base (eliminando tallas/colores del ID del carrito)
        const baseId = item.id.split('-')[0];
        return {
          ref: doc(db, "productos", baseId),
          qty: item.quantity,
          name: item.name
        };
      });

      // 2. Leemos el estado actual de TODOS los productos antes de escribir
      const snapshots = await Promise.all(updates.map(u => transaction.get(u.ref)));

      // 3. Aplicamos las restas
      snapshots.forEach((snap, index) => {
        if (!snap.exists()) {
          throw new Error(`El producto ${updates[index].name} ya no existe.`);
        }

        const data = snap.data();
        const stockActual = Number(data.stock) || 0;
        const cantidadPedida = updates[index].qty;

        if (stockActual < cantidadPedida) {
          throw new Error(`¡Ups! Solo quedan ${stockActual} unidades de ${data.nombre}.`);
        }

        // Ejecutamos la resta en la base de datos
        transaction.update(updates[index].ref, {
          stock: stockActual - cantidadPedida
        });
      });
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error en transacción:", error);
    return { success: false, message: error.message };
  }
};