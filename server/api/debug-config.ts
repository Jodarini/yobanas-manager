export default defineEventHandler(() => {
  const config = useRuntimeConfig();

  return {
    allKeys: Object.keys(config),
    supabaseUrl: config.supabaseUrl ? 'EXISTS' : 'MISSING',
    supabaseUrlLength: config.supabaseUrl?.length || 0,
  };
});
