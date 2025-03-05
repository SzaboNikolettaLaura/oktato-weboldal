<template>
  <div class="signup-container">
    <div class="signup-card">
      <h2 class="title">Regisztráció</h2>
      <form @submit.prevent="handleSubmit">
        <div class="input-group name-group">
          <div class="name-input">
            <label for="csaladnev">Családnév</label>
            <input type="text" id="csaladnev" v-model="form.lastName" placeholder="Családnév">
          </div>
          <div class="name-input">
            <label for="keresztnev">Keresztnév</label>
            <input type="text" id="keresztnev" v-model="form.firstName" placeholder="Keresztnév">
          </div>
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" placeholder="Email">
        </div>

        <div class="input-group">
          <label for="szerep">Szerep</label>
          <select id="szerep" v-model="form.role">
            <option value="tanar">Tanár</option>
            <option value="diak">Diák</option>
          </select>
        </div>

        <div class="input-group">
          <label for="password">Jelszó</label>
          <input type="password" id="password" v-model="form.password" placeholder="Jelszó">
        </div>

        <button type="submit" class="signup-button">Regisztrálás</button>
      </form>
      <p class="login-text">Már van fiókod? <NuxtLink to="/login">Kattints ide!</NuxtLink></p>
    </div>
  </div>
</template>

<script>
 import axios from 'axios';

export default {
  name: 'SignupPage',
  data() {
    return {
      form: {
        lastName: '',
        firstName: '',
        email: '',
        role: 'diak',
        password: '',
      },
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axios.post('/api/signup', this.form);
        if (response.status === 200) {
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error during registration:', error);
      }
    },
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(rgba(9, 18, 44, 0.5), rgba(9, 18, 44, 0.5)), url('/background.png') no-repeat center center/cover;
  font-family: 'Poppins', sans-serif;
}

.signup-card {
  background: #e8dad6;
  padding: 50px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 450px;
  width: 100%;
  height: 550px; /* Same height as login card */
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #09122C;
  margin-bottom: 40px;
}

.input-group {
  margin-bottom: 25px;
}

.name-group {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.name-input {
  width: 45%;
}

label {
  display: block;
  text-align: left;
  font-size: 14px;
  margin-bottom: 5px;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

select {
  font-size: 14px;
}

.signup-button {
  width: 100%;
  padding: 10px;
  background: #c00;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 50px;
}

.login-text {
  margin-top: 20px;
  font-size: 14px;
}

.login-text a {
  color: #c00;
  text-decoration: none;
}
</style>
