export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const errorMessage = ref<string | null>(null);
  const isLoading = ref(false);

  const signInWithPassword = async (email: string, password: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        errorMessage.value = error.message;
        return false;
      }

      await navigateTo('/');
      return true;
    } catch (err) {
      errorMessage.value = 'An unexpected error occurred';
      console.error(err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const signInAnonymous = async () => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const { error } = await supabase.auth.signInAnonymously();

      if (error) {
        errorMessage.value = error.message;
        return false;
      }

      await navigateTo('/');
      return true;
    } catch (err) {
      errorMessage.value = 'An unexpected error occurred';
      console.error(err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const signOut = async () => {
    isLoading.value = true;

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        errorMessage.value = error.message;
        return false;
      }

      await navigateTo('/login');
      return true;
    } catch (err) {
      errorMessage.value = 'Failed to sign out';
      console.error(err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    errorMessage,
    signInWithPassword,
    signInAnonymous,
    signOut,
    isLoading,
  };
};
