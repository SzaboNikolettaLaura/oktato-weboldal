<template>
  <div>
    <Nav />
    <main class="bg-white min-h-screen text-gray-900">
      <section class="relative bg-gradient-to-br from-[#96173C] to-[#7A1230] text-white py-32 px-8 text-center overflow-hidden">
        <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        <div class="max-w-4xl mx-auto relative">
          <h1 class="text-6xl font-extrabold mb-8 animate-fade-in">Tanulj JavaScriptet magyarul</h1>
          <p class="mt-6 text-4xl text-gray-200 font-light">Miért tanulj magyarul?</p>
          <ul class="mt-12 text-xl text-gray-300 space-y-4">
            <li class="flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Részletes magyarázatok és példák magyar nyelven
            </li>
            <li class="flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Helyi szakemberek és tanárok közvetlen támogatása
            </li>
            <li class="flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Számos magyar nyelvű forrás és dokumentáció elérhetősége
            </li>
          </ul>
          <div class="mt-12">
            <NuxtLink to="/register" class="inline-flex items-center gap-2 bg-white text-[#96173C] font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Kezdj el tanulni
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </section>

      <div class="w-full -mt-12">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="w-full h-auto">
          <path fill="#96173C" fill-opacity="1" d="M0,96L48,117.3C96,139,192,181,288,176C384,171,480,117,576,133.3C672,149,768,235,864,245.3C960,256,1056,192,1152,160C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <section class="py-32 px-8 text-left bg-white">
        <div class="max-w-6xl mx-auto flex items-center justify-between gap-12">
          <div class="w-1/2 transform hover:scale-105 transition-transform duration-300">
            <img src="/test.png" alt="Feladat kipróbálása" class="w-full h-auto rounded-2xl shadow-xl" />
          </div>
          <div class="w-1/2 space-y-6">
            <h2 class="text-5xl font-extrabold bg-gradient-to-r from-[#96173C] to-[#09122C] bg-clip-text text-transparent">Fejleszd a tudásod!</h2>
            <p class="text-xl text-gray-700 leading-relaxed">Próbálj ki különböző feladatokat, hogy fejleszd a JavaScript tudásodat! Interaktív gyakorlatok és valós életbeli példák segítségével gyorsan fejlődhetsz.</p>
            <div class="pt-4">
              <NuxtLink to="/register" class="inline-flex items-center gap-2 bg-gradient-to-r from-[#96173C] to-[#09122C] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                Feladatok kipróbálása
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="py-32 px-8 text-left bg-gradient-to-br from-gray-50 to-gray-100">
        <div class="max-w-6xl mx-auto flex items-center justify-between gap-12">
          <div class="w-1/2 space-y-6">
            <h2 class="text-5xl font-extrabold bg-gradient-to-r from-[#96173C] to-[#09122C] bg-clip-text text-transparent">Teszt kitöltése</h2>
            <p class="text-xl text-gray-700 leading-relaxed">Indítsd el a tesztet, hogy ellenőrizd tudásodat JavaScript-ben! Részletes visszajelzést kapsz, és pontosan láthatod, mely területeken kell még fejlődnöd.</p>
            <div class="pt-4">
              <NuxtLink to="/register" class="inline-flex items-center gap-2 bg-gradient-to-r from-[#96173C] to-[#09122C] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                Teszt kitöltése
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </NuxtLink>
            </div>
          </div>
          <div class="w-1/2 transform hover:scale-105 transition-transform duration-300">
            <img src="/laptop-phone.jpg" alt="Laptop and Phone" class="w-full h-auto rounded-2xl shadow-xl" />
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script>
import Nav from '~/components/Nav.vue';
import Footer from '~/components/Footer.vue';

export default {
  components: {
    Nav,
    Footer,
  },
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
