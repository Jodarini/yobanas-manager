<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
  });

  const user = useSupabaseUser();

  // Redirect if already logged in
  if (user.value) {
    await navigateTo('/dashboard');
  }
</script>

<template>
  <!-- No need for a div wrapper if you use a layout, but good for structure -->
  <div class="flex min-h-screen flex-col font-sans antialiased">
    <!-- Navbar is usually in the layout, but if you want it specific to landing: -->
    <LandingNavbar />

    <main class="flex-1">
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingCTA />
    </main>

    <LandingFooter />
  </div>
</template>
