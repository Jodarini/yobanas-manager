export const useAuth = () => {
  const supabase = useSupabaseClient();
  const { path } = useSupabaseCookieRedirect();
  const userId = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);

  const initAuth = async () => {
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
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Sign in error:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      await navigateTo('/');
    }
  };

  const signInAnonymous = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      errorMessage.value = error.message;
    } else {
      userId.value = data.user!.id;
      await navigateTo('/');
      return data;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    userId.value = null;
    await refreshNuxtData();
    await navigateTo('/');
  };

  return {
    initAuth,
    userId,
    errorMessage,
    signInWithPassword,
    signInAnonymous,
    signOut,
  };
};
