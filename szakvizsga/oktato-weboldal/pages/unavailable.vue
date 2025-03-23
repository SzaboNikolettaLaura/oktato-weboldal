<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h2 class="text-4xl font-bold text-gray-900">Hozzáférés megtagadva</h2>
      <p class="text-gray-500 mt-4">Nincs jogosultsága az oldal megtekintéséhez.</p>
      <NuxtLink
        to="/"
        class="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Vissza a kezdőoldalra
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script> 