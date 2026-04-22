import { createClient } from '@supabase/supabase-js';

// Hemos reemplazado las variables VITE_ por los datos reales
const supabaseUrl = 'https://lqpxqhsgiromaliybodv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHhxaHNnaXJvbWFsaXlib2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjI3MjgsImV4cCI6MjA5MjE5ODcyOH0.f7jUaJ8zPxYaDnrtpSMXGW_u1HKMwTP8yohF3T8ruYg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
