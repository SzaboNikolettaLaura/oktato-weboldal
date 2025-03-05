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

<script>
export default {
  data() {
    return {
      isLoggedIn: false, // Flag, hogy a felhasználó be van-e jelentkezve
    }
  },
  created() {
    this.checkLoginStatus(); // Ellenőrizzük a bejelentkezett státuszt az oldal betöltésekor
  },
  methods: {
    // Ellenőrizzük, hogy van-e érvényes token a localStorage-ban
    checkLoginStatus() {
      const token = localStorage.getItem('userToken');
      if (token) {
        const user = this.decodeToken(token);
        if (user) {
          this.isLoggedIn = true; // Ha van érvényes token, a felhasználó be van jelentkezve
        }
      }
    },

    // Token dekódolása (JWT dekódolás)
    decodeToken(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
      } catch (e) {
        return null; // Ha hibás a token, visszaadjuk a null-t
      }
    },

    // Kijelentkezés
    logout() {
      localStorage.removeItem('userToken'); // Töröljük a token-t a localStorage-ból
      this.isLoggedIn = false; // Állítsuk vissza a bejelentkezett státuszt
    }
  }
}
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
  font-family: 'Arial', sans-serif;
  font-weight: bold;
}

.nav-links a:hover {
  color: #FFFFFF;
}

.login-text {
  color: #ECF0F1;
  cursor: pointer;
  font-family: 'Arial', sans-serif;
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
