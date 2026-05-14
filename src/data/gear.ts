import { supabase } from '../lib/supabase';

export type GearItemRow = {
  id: string;
  user_id: string;
  name: string;
  category: 'racket' | 'shoes' | 'string' | 'bag' | 'accessory' | 'other';
  brand: string | null;
  quantity: number;
  unit: string | null;
  purchase_date: string | null;
  cost: number | null;
  status: 'active' | 'retired';
  notes: string | null;
};

export async function listMyGear() {
  const { data, error } = await supabase
    .from('gear_items')
    .select('id,user_id,name,category,brand,quantity,unit,purchase_date,cost,status,notes')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as GearItemRow[];
}

export async function createGearItem(input: Omit<GearItemRow, 'id' | 'user_id'>) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('gear_items')
    .insert({
      user_id: userId,
      ...input,
    })
    .select('id,user_id,name,category,brand,quantity,unit,purchase_date,cost,status,notes')
    .single();
  if (error) throw error;
  return data as GearItemRow;
}
