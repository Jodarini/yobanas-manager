import { serverSupabaseClient } from '#supabase/server';
import { productsTable } from '~/db/schema';
import { useAuthDB } from '../utils/db';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return await useAuthDB(session, (tx) => tx.select().from(productsTable));
  }

  return [];
});
