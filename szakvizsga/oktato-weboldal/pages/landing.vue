<template>
  <div>
    <Nav />
    <main class="bg-white min-h-screen text-gray-900">
      <section class="relative bg-[#96173C] text-white py-20 px-8 text-center">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-5xl font-extrabold">Tanulj JavaScriptet magyarul</h1>
          <p class="mt-6 text-4xl text-gray-200">Miért tanulj magyarul?</p>
          <ul class="mt-6 text-lg text-gray-300 list-disc list-inside">
            <li>Részletes magyarázatok és példák magyar nyelven.</li>
            <li>Helyi szakemberek és tanárok közvetlen támogatása.</li>
            <li>Számos magyar nyelvű forrás és dokumentáció elérhetősége.</li>
          </ul>
        </div>
      </section>

      <div class="w-full -mt-12">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#96173C" fill-opacity="1" d="M0,96L48,117.3C96,139,192,181,288,176C384,171,480,117,576,133.3C672,149,768,235,864,245.3C960,256,1056,192,1152,160C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <section class="py-32 px-8 text-left bg-white">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <div class="w-1/2">
            <img src="/test.png" alt="Feladat kipróbálása" class="w-[110%] h-auto rounded-lg shadow-lg" />
          </div>
          <div class="w-1/2 pl-8">
            <h2 class="text-4xl font-extrabold">Fejleszd a tudásod!</h2>
            <p class="mt-6 text-lg text-gray-700">Próbálj ki különböző feladatokat, hogy fejleszd a JavaScript tudásodat!</p>
            <div class="mt-6">
              <NuxtLink to="/register" class="bg-[#09122C] text-white font-semibold px-3 py-5 rounded-full shadow-md hover:bg-[#0a1a2b] transition w-auto text-center block">Feladatok kipróbálása</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="py-32 px-8 text-left bg-gray-100">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <div class="w-1/2 pr-8">
            <h2 class="text-4xl font-extrabold">Teszt kitöltése</h2>
            <p class="mt-6 text-lg text-gray-700">Indítsd el a tesztet, hogy ellenőrizd tudásodat JavaScript-ben!</p>
            <div class="mt-6">
              <NuxtLink to="/register" class="bg-[#09122C] text-white font-semibold px-3 py-5 rounded-full shadow-md hover:bg-[#0a1a2b] transition w-auto text-center block">Teszt kitöltése</NuxtLink>
            </div>
          </div>
          <div class="w-1/2">
            <img src="/laptop-phone.jpg" alt="Laptop and Phone" class="w-full h-auto rounded-lg shadow-lg" />
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
button {
  transition: background 0.3s, transform 0.2s;
}
button:hover {
  transform: translateY(-2px);
}

section.bg {
  background-color: #96173C;
  color: white;
  padding: 50px 0;
  text-align: center;
}

section.bgh1 {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
}

section.bg p {
  font-size: 1.5rem;
  margin-top: 10px;
}

section.bg ul {
  margin-top: 20px;
  list-style: disc;
  padding-left: 20px;
}

section.py-32 img {
  width: 110%;
  height: auto;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

footer {
  background-color: #09122C;
  color: white;
  padding: 20px 0;
  text-align: center;
}

footer p {
  font-size: 1rem;
}
</style>
