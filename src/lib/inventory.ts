import { supabase } from './supabase';
import type { Product } from '../types/product';

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    // Cambié fecha_creacion por created_at que es el estándar de Supabase
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
};

export const getStoreConfig = async () => {
  const { data, error } = await supabase
    .from('configuracion') // Consistente con TopBanner y Header
    .select('*')
    .eq('id', 'tienda')    // Consistente con el ID usado en otros componentes
    .single();

  if (error) {
    console.error('Error fetching config:', error);
    return null;
  }
  return data;
};

export const updateStoreConfig = async (updates: any) => {
  const { data, error } = await supabase
    .from('configuracion')
    .update(updates)
    .eq('id', 'tienda');

  if (error) throw error;
  return data;
};
