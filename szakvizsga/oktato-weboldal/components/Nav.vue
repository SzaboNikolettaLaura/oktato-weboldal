<template>
  <nav class="navbar">
    <div class="logo">
      <NuxtLink to="/landing">
        <img src="/logo.png" alt="Logo" />
      </NuxtLink>
    </div>

    <div class="menu-icon" v-if="isMobile" @click="toggleMenu" :class="{ 'open': menuVisible }">
      <span class="hamburger"></span>
    </div>

    <ul class="nav-links" :class="{ 'show-menu': menuVisible }">
      <li v-if="isMobile" class="close-button">
        <span class="close-icon" @click="toggleMenu">×</span>
      </li>
      <li v-if="!isLoggedIn">
        <NuxtLink to="/login" class="login-text">Bejelentkezés</NuxtLink>
      </li>

      <li v-if="isLoggedIn"><NuxtLink to="/course">Lecke</NuxtLink></li>
      <li v-if="isLoggedIn">
        <span class="nav-link" @click="toggleNotifications">
          Értesítések
          <span v-if="unreadCount" class="notification-badge">{{ unreadCount }}</span>
        </span>
      </li>
      <li v-if="isLoggedIn"><NuxtLink :to="`/users/${userData.id}`">Profil</NuxtLink></li>
      <li v-if="isLoggedIn && userData.role !== 'diak'"><NuxtLink to="/students">Diákok</NuxtLink></li>
      <li v-if="isLoggedIn">
        <span class="login-text" @click="logout">Kijelentkezés</span>
      </li>
    </ul>

    <NotificationPopup 
      v-if="isLoggedIn"
      :is-visible="showNotifications"
      @close="showNotifications = false"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import useUserData from '~/composables/useUserData';

const { userData, logout: logoutUser } = useUserData();

const isLoggedIn = ref(false);
const menuVisible = ref(false);
const isMobile = ref(false);
const showNotifications = ref(false);
const unreadCount = ref(0);

const checkLoginStatus = () => {
  isLoggedIn.value = userData.value.role !== 'guest';
};

const logout = () => {
  logoutUser();
  isLoggedIn.value = false;
  navigateTo('/login');
};

const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;
  if (menuVisible.value) {
    document.body.classList.add('menu-open');
  } else {
    document.body.classList.remove('menu-open');
  }
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkLoginStatus();
  checkMobile();

  window.addEventListener('resize', checkMobile);
});
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #09122C;
  padding: 10px 20px;
  position: relative;
}

.logo img {
  width: 70px;
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
    display: none;
    flex-direction: column;
    gap: 0;
    padding: 10px 20px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: #09122C;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  .nav-links.show-menu {
    display: flex;
    margin-top: 0;
  }

  .nav-links li {
    display: block;
    text-align: center;
    width: 100%;
    padding: 15px 0;
    border-bottom: 1px solid #ddd;
    margin-top: 15px;
  }

  .menu-icon {
    display: block;
    cursor: pointer;
  }

  .hamburger {
    display: block;
    width: 30px;
    height: 3px;
    background-color: #ECF0F1;
    border-radius: 5px;
    position: relative;
    transition: transform 0.3s ease;
  }

  .hamburger:before,
  .hamburger:after {
    content: '';
    width: 30px;
    height: 3px;
    background-color: #ECF0F1;
    border-radius: 5px;
    position: absolute;
    left: 0;
    transition: transform 0.3s ease;
  }

  .hamburger:before {
    top: -10px;
  }

  .hamburger:after {
    top: 10px;
  }

  .menu-icon.open .hamburger {
    transform: rotate(45deg);
  }

  .menu-icon.open .hamburger:before {
    transform: translateY(10px) rotate(90deg);
  }

  .menu-icon.open .hamburger:after {
    transform: translateY(-10px) rotate(90deg);
  }

  body.menu-open {
    overflow: hidden;
  }

  .close-button {
    text-align: right;
    padding: 20px;
    border-bottom: none !important;
  }

  .close-icon {
    font-size: 32px;
    color: #ECF0F1;
    cursor: pointer;
    line-height: 1;
  }

  .close-icon:hover {
    color: #FFFFFF;
  }
}

.notification-icon {
  position: relative;
  cursor: pointer;
  font-size: 20px;
  color: #ECF0F1;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #c00;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

@media (max-width: 768px) {
  .notification-icon {
    display: block;
    text-align: center;
    padding: 15px 0;
  }
}

.nav-link {
  text-decoration: none;
  color: #ECF0F1;
  font-weight: bold;
  cursor: pointer;
  position: relative;
}

.nav-link:hover {
  color: #FFFFFF;
}
</style>
