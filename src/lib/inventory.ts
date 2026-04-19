import { supabase } from './supabase';
import type { Product } from '../types/product';

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return [];
  }
  return data as Product[];
};

export const getStoreConfig = async () => {
  const { data, error } = await supabase
    .from('configuracion_tienda')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return null;
  return data;
};

export const updateStoreConfig = async (updates: any) => {
  const { data, error } = await supabase
    .from('configuracion_tienda')
    .update(updates)
    .eq('id', 1);

  if (error) throw error;
  return data;
};
