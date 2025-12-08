export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  // If user is already logged in, redirect to dashboard
  if (user.value) {
    return navigateTo('/');
  }
});
