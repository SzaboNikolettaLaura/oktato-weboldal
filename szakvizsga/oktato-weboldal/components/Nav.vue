<template>
  <nav class="navbar">
    <div class="logo">
      <NuxtLink to="/landing">
        <img src="/logo.png" alt="Logo" />
      </NuxtLink>
    </div>
    <ul class="nav-links">
      <!-- Ha a felhasználó nincs bejelentkezve, csak a Bejelentkezés gomb jelenjen meg -->
      <li v-if="!isLoggedIn">
        <NuxtLink to="/login" class="login-text">Bejelentkezés</NuxtLink>
      </li>

      <!-- Ha a felhasználó be van jelentkezve, jelenjenek meg a következő menüpontok -->
      <li v-if="isLoggedIn"><NuxtLink to="/course">Lecke</NuxtLink></li>
      <li v-if="isLoggedIn"><NuxtLink to="/messages">Üzenetek</NuxtLink></li>
      <li v-if="isLoggedIn"><NuxtLink to="/users">Felhasználók</NuxtLink></li>
      <li v-if="isLoggedIn">
        <span class="login-text" @click="logout">Kijelentkezés</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
const { userData, logout: logoutUser } = useUserData();

const isLoggedIn = ref(false);

const checkLoginStatus = () => {
  isLoggedIn.value = userData.value.role !== 'guest';
};

const logout = () => {
  logoutUser();
  isLoggedIn.value = false;
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
/* A stílusok nem változnak */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #09122C;
  padding: 10px 20px;
  position: relative;
}

.logo img {
  width: 70px; /* Increased logo size */
  height: auto;
}

.nav-links {
  list-style-type: none;
  display: flex;
  gap: 20px;
}

.nav-links li {
  padding: 10px;
}

.nav-links a {
  text-decoration: none;
  color: #ECF0F1;
  font-weight: bold;
}

.nav-links a:hover {
  color: #FFFFFF;
}

.login-text {
  color: #ECF0F1;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s ease;
}

.login-text:hover {
  color: #FFFFFF;
}

.login-text:not(:hover) {
  color: rgba(236, 240, 241, 0.8);
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 10px 20px;
  }
  .nav-links li {
    display: block;
    text-align: center;
  }
}
</style>
