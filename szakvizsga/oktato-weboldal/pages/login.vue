<template>
    <div class="login-container">
      <div class="login-card">
        <h2 class="title">Bejelentkezés</h2>
        <form>
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Email">
          </div>
  
          <div class="input-group">
            <label for="password">Jelszó</label>
            <input type="password" id="password" placeholder="Jelszó">
          </div>
  
          <div class="checkbox-container">
            <div class="checkbox-label">
              <input type="checkbox" id="remember">
              <label for="remember">Maradjak bejelentkezve</label>
            </div>
            <a href="#" class="forgot-password">Elfelejtetted a jelszavad?</a>
          </div>
  
          <button type="submit" class="login-button">Bejelentkezés</button>
        </form>
        <p class="register-text">Nincs még fiókod? <a href="#">Kattints ide!</a></p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginPage'
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(rgba(9, 18, 44, 0.5), rgba(9, 18, 44, 0.5)), url('/background.png') no-repeat center center/cover;
    font-family: 'Poppins', sans-serif;
  }
  
  .login-card {
    background: #e8dad6;
    padding: 50px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center; 
    max-width: 450px;
    width: 100%;
    height: 550px;
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
  
  label {
    display: block;
    text-align: left;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .checkbox-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin-top: 20px;
    margin-bottom: 30px;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
  
  .forgot-password {
    color: #c00;
    text-decoration: none;
  }
  
  .login-button {
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
  
  .register-text {
    margin-top: 20px;
    font-size: 14px;
  }
  
  .register-text a {
    color: #c00;
    text-decoration: none;
  }
  </style>
  