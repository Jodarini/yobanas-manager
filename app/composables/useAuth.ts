export const useAuth = () => {
  const supabase = useSupabaseClient();
  const userId = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const isLoading = ref(false);

  const initAuth = async () => {
    isLoading.value = true;

    // Get initial session without network call
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      userId.value = session.user.id;
    }

    // Fix the callback to use session parameter
    supabase.auth.onAuthStateChange((_event, session) => {
      userId.value = session?.user?.id ?? null;
    });

    isLoading.value = false;
  };

  const signInWithPassword = async (email: string, password: string) => {
    isLoading.value = true;
    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.error('Sign in error:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        errorMessage.value = error.message;
      } else {
        return navigateTo('/');
      }
    } catch (err) {
      console.error(err)
    } finally {

      isLoading.value = false;
    }
  };

  const signInAnonymous = async () => {
    isLoading.value = true;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      errorMessage.value = error.message;
    } else {
      userId.value = data.user!.id;
      await navigateTo('/');
      return data;
    }
    isLoading.value = false;
  };

  const signOut = async () => {
    isLoading.value = true;
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    userId.value = null;
    await refreshNuxtData();
    await navigateTo('/');
    isLoading.value = false;
  };

  return {
    initAuth,
    userId,
    errorMessage,
    signInWithPassword,
    signInAnonymous,
    signOut,
    isLoading,
  };
};
