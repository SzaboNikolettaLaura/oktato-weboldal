<template>
  <div class="page-container">
    <Nav />
    <div class="profile-container">
      <div class="sidebar">
        <div class="sidebar-content">
          <img :src="user.image" alt="Profile Picture" class="profile-image" />
          <button class="edit-btn">Szerkesztés</button>
          <button class="delete-btn">Törlés</button>
        </div>
      </div>

      <div class="profile-info">
        <h2>Személyes információk</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Családnév</label>
            <input v-model="user.last_name" type="text" disabled />
          </div>
          <div class="form-group">
            <label>Keresztnév</label>
            <input v-model="user.first_name" type="text" disabled />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input v-model="user.email" type="email" disabled />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Szak</label>
            <select v-model="user.specialization" disabled>
              <option>Informatika</option>
            </select>
          </div>
          <div class="form-group">
            <label>Évfolyam</label>
            <select v-model="user.year" disabled>
              <option>II</option>
            </select>
          </div>
          <div class="form-group">
            <label>Csoport</label>
            <select v-model="user.group" disabled>
              <option>A</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Nav from '@/components/Nav.vue';

const {userData} = useUserData();
const {profileData} = await useProfileData();
const user = userData.value;
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.profile-container {
  flex-grow: 1;
  display: flex;
  width: 100vw;
}

.sidebar {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  padding: 60px;
  width: 420px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 25px;
}

.edit-btn, .delete-btn {
  width: 100%;
  padding: 18px;
  margin-top: 15px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

.edit-btn {
  background: #001f3f;
  color: white;
}

.delete-btn {
  background: #d9534f;
  color: white;
}

.profile-info {
  flex-grow: 1;
  background: #d9d9d9;
  padding: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
  flex-grow: 1;
}

input, select {
  width:100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f8f8f8;
  font-size: 16px;
  box-sizing: border-box;
}

.form-row {
  display: flex;
  gap: 20px;
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    box-shadow: none;
    border-bottom: 2px solid #ccc;
  }
}
</style>
