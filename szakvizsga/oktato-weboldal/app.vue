<template>
  <div class="h-full">
    <NuxtRouteAnnouncer />

    <div class="bg-white min-h-screen flex flex-col h-full">
        <!-- Navbar -->
         <Navbar/>
         <div class="flex-1 justify-between">
           <NuxtPage />
         </div>
    </div>
  </div>
</template>

<style>
body, html {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}
#__nuxt {
  @apply h-full;
}
</style>

<script>

</script>