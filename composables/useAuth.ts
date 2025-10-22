export const useAuth = () => {
  const supabase = useSupabaseClient();
  const { path } = useSupabaseCookieRedirect();
  const userId = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const isLoading = ref(false);

  const initAuth = async () => {
    isLoading.value = true;
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      errorMessage.value = error.message;
    } else if (session?.user) {
      userId.value = session.user.id;
    }
    supabase.auth.onAuthStateChange((_event, session) => {
      userId.value = session?.user ?? null;
    });
    isLoading.value = false;
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Sign in error:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      errorMessage.value = error.message;
    } else {
      await navigateTo('/');
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
