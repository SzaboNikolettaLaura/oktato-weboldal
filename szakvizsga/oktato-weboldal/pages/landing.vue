<template>
  <div>
    <Nav />
    <main class="bg-gray-100 min-h-screen">
      <section class="bg-red-700 text-white py-16 px-8 text-center">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-4xl font-extrabold">Tanulj JavaScriptet magyarul</h1>
          <ul class="mt-6 space-y-2 text-lg">
            <li>✅ Interaktív tanulás</li>
            <li>✅ Önellenőrző tesztek</li>
            <li>✅ Lépésről lépésre útmutatók</li>
          </ul>
          <button class="mt-8 bg-white text-red-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition">Kezdés</button>
        </div>
      </section>
      
      <section class="bg-white py-16 px-8 text-center">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-3xl font-extrabold text-gray-900">Quiz</h2>
          <p class="mt-4 text-lg text-gray-700">Mennyire ismered a JavaScriptet?</p>
          <p class="mb-6 text-gray-600">Teszteld le tudásodat!</p>
          <button class="bg-red-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition">Kezdés</button>
        </div>
      </section>

      <section class="bg-gray-200 py-16 px-8 text-center">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-extrabold text-gray-900">Csatlakozz közösségünkhöz</h2>
          <p class="mt-4 text-lg text-gray-700">Lépj be a tanulói közösségbe, ossz meg tapasztalatokat, és tanulj együtt másokkal!</p>
          <button class="mt-6 bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition">Csatlakozás</button>
        </div>
      </section>
    </main>
    
    <footer class="bg-gray-900 text-white py-6 text-center">
      <div class="flex justify-center space-x-8 text-lg">
        <a href="#" class="hover:underline">Profile</a>
        <a href="#" class="hover:underline">Anyag</a>
        <a href="#" class="hover:underline">Kezdőoldal</a>
      </div>
      <p class="mt-4 text-sm text-gray-400">&copy; 2025 - jsokatatoweboldal.com</p>
    </footer>
  </div>
</template>

<script>
import Nav from "@/components/Nav.vue";

export default {
  components: {
    Nav,
  },
};
</script>

<style scoped>
button {
  transition: background 0.3s, transform 0.2s;
}
button:hover {
  transform: translateY(-2px);
}
</style>
