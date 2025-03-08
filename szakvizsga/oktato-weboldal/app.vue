<template>
  <div class="h-full">
    <NuxtRouteAnnouncer />

    <div class="bg-white min-h-screen flex flex-col h-full">
        <!-- Navbar -->
         <Navbar/>
         <div class="flex-1 justify-between h-full bg-[#f8f8f8]">
           <NuxtPage />
         </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
body, html {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}

body *:not(.monaco-editor *) {
  font-family: 'Poppins', sans-serif;
}
#__nuxt {
  height: 100%;
}
.h-full {
  height: 100%;
}
</style>

<script>

</script>