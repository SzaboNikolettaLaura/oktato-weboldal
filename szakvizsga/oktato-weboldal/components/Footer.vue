<template>
    <footer class="bg-gray-900 text-white py-6 text-center">
      <div class="flex justify-center space-x-8 text-lg">
        <a href="#" class="hover:underline">Profile</a>
        <a href="#" class="hover:underline">Anyag</a>
        <a href="#" class="hover:underline">Kezdőoldal</a>
      </div>
      <p class="mt-4 text-sm text-gray-400">&copy; 2025 - jsokatatoweboldal.com</p>
    </footer>
  </template>
  
  <script>
  export default {
    name: "FooterComponent",
  };
  </script>
  
  <style scoped>
  a {
    transition: color 0.3s;
  }
  a:hover {
    color: #f87171;
  }
  </style>
  