<template>
    <div>
      <Nav />
      <div class="profile-container">
        <div class="profile-card">
          <img :src="user.image" alt="Profile Picture" class="profile-image" />
          <button class="edit-btn">Szerkesztés</button>
          <button class="delete-btn">Törlés</button>
        </div>
        <div class="profile-info">
          <h2>Személyes információk</h2>
          <label>Családnév</label>
          <input v-model="user.lastName" type="text" disabled />
          <label>Keresztnév</label>
          <input v-model="user.firstName" type="text" disabled />
          <label>Email</label>
          <input v-model="user.email" type="email" disabled />
          <div v-if="isStudent" class="profile-selects">
            <label>Szak</label>
            <select v-model="user.major" disabled>
              <option>Informatika</option>
            </select>
            <label>Évfolyam</label>
            <select v-model="user.year" disabled>
              <option>II</option>
            </select>
            <label>Csoport</label>
            <select v-model="user.group" disabled>
              <option>A</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import Nav from '@/components/Nav.vue';

  const { userData } = useUserData();
  const router = useRouter();

  const isStudent = computed(() => userData.value.role === 'diak');
  const isTeacher = computed(() => userData.value.role === 'tanar');
  const user = {
          image: 'https://via.placeholder.com/150',
          lastName: 'Csaladnev',
          firstName: 'Keresztnev',
          email: 'csaladnevkeresztnev@gmail.com',
          major: 'Informatika',
          year: 'II',
          group: 'A'
        };
  if (userData.value.loaded && !['diak', 'tanar'].includes(userData.value.role)) {
    router.push('/');
  }
</script>

  <style scoped>
  .profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: #f3f3f3;
  }
  .profile-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  .profile-image {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-bottom: 10px;
  }
  .edit-btn, .delete-btn {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
  .edit-btn {
    background: navy;
    color: white;
  }
  .delete-btn {
    background: red;
    color: white;
  }
  .profile-info {
    width: 100%;
    max-width: 400px;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
  }
  .profile-selects {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  @media (min-width: 768px) {
    .profile-container {
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
    }
    .profile-card {
      margin-right: 20px;
    }
    .profile-info {
      margin-top: 0;
    }
  }
  </style>
  