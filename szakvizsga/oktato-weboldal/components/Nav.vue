<!-- components/Navbar.vue -->
<template>
    <nav class="navbar">
      <div class="logo">
        <NuxtLink to="/landing">
          <img src="/logo.png" alt="Logo" />
        </NuxtLink>
      </div>
      <ul class="nav-links">
        <li v-if="!isLoggedIn"><span class="login-text" @click="login">Login</span></li>
        <li v-if="isLoggedIn"><NuxtLink to="/profile">Profile</NuxtLink></li>
        <li v-if="isLoggedIn"><span class="login-text" @click="logout">Logout</span></li>
        <li v-if="isLoggedIn"><NuxtLink to="/about">About</NuxtLink></li>
        <li v-if="isLoggedIn"><NuxtLink to="/services">Services</NuxtLink></li>
        <li v-if="isLoggedIn"><NuxtLink to="/contact">Contact</NuxtLink></li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isLoggedIn: false, // Change this flag based on your auth state
      }
    },
    methods: {
      login() {
        // Add login logic here (e.g., set `isLoggedIn` to true)
        this.isLoggedIn = true
      },
      logout() {
        // Add logout logic here (e.g., set `isLoggedIn` to false)
        this.isLoggedIn = false
      }
    }
  }
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
    font-weight: bold; /* Made font bold */
  }
  
  .nav-links a:hover {
    color: #FFFFFF;
  }
  
  .login-text {
    color: #ECF0F1;
    cursor: pointer;
    font-family: 'Arial', sans-serif;
    font-size: 18px; /* Increased font size */
    font-weight: bold; /* Made font bold */
    transition: color 0.3s ease;
  }
  
  .login-text:hover {
    color: #FFFFFF; /* White on hover */
  }
  
  .login-text:not(:hover) {
    color: rgba(236, 240, 241, 0.8); /* Slightly more gray when not hovered */
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
  