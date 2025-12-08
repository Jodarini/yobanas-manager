import { translateErrorCode, setLanguage } from 'supabase-error-translator-js';
export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const errorMessage = ref<string | null>(null);
  const isLoading = ref(false);
  setLanguage('es');

  const signUp = async (email: string, password: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        errorMessage.value = translateErrorCode(error?.code || null, 'auth');
      }
      const res = await useFetch('/api/auth/signup', {
        method: 'POST',
        body: {
          user_id: data.user?.id,
          plan: 'gratis',
          status: 'active',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: 0,
        },
      });
      await navigateTo('/dashboard?welcome=true');
      return data;
    } catch (err) {
      errorMessage.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        switch (error.code) {
          case 'invalid_credentials':
            errorMessage.value = 'Usuario o contraseña incorrectos';
            break;
          case 'user_banned':
            errorMessage.value = 'Usuario baneado';
            break;
          case 'email_not_confirmed':
            errorMessage.value = 'Email no confirmado';
            break;
          default:
            errorMessage.value = error.message;
        }
        return false;
      }

      await navigateTo('/dashboard');
      return true;
    } catch (err) {
      errorMessage.value = 'Ocurrió un error inesperado';
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

      await navigateTo('/dashboard');
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
    signUp,
    isLoading,
  };
};
