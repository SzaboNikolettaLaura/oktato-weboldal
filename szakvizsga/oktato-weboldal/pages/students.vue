<template>
    <div>
      <!-- Navbar -->
      <Nav />
  
      <!-- Header Section -->
      <div class="header">
        <h1 style="color: #09122C;font-weight: 600;font-size: 2rem;">Diákok</h1>
        <div class="filters">
          <select v-model="filters.year" class="filter-input">
            <option value="">Évfolyam</option>
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
  
          <select v-model="filters.specialization" class="filter-input">
            <option value="">Szak</option>
            <option v-for="specialization in specializations" :key="specialization" :value="specialization">
              {{ specialization }}
            </option>
          </select>
  
          <select v-model="filters.group" class="filter-input">
            <option value="">Csoport</option>
            <option v-for="group in groups" :key="group" :value="group">{{ group }}</option>
          </select>
  
          <input 
            v-model="filters.name" 
            type="text" 
            placeholder="Keresés" 
            class="filter-input"
          />
        </div>
      </div>
  
      <!-- Loading/Error States -->
      <div v-if="!userData.loaded" class="loading-state">
        Felhasználói adatok betöltése...
      </div>
      <div v-else-if="!userData.token" class="error-state">
        Nincs érvényes tokened. Kérlek jelentkezz be újra.
      </div>
      <div v-else-if="!studentData || studentData.length === 0" class="no-data-state">
        Nincsenek diákok betöltve. (Token: {{ userData.token ? 'Van' : 'Nincs' }})
      </div>
  
      <!-- Student Table -->
      <table v-else class="student-table">
        <thead>
          <tr>
            <th>Név</th>
            <th>Évfolyam</th>
            <th>Csoport</th>
            <th>Szak</th>
            <th>Utolsó lecke</th>
            <th>Szint felmérő</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.id">
            <td class="bold flex flex-row" style="gap: 8px;">
                <div class="profile-icon"></div>
                <div>
                    {{ student.first_name }} {{ student.last_name }} <br> <span class="email">{{ student.email }}</span>
                </div>
            </td>
            <td>{{ student.year }}</td>
            <td>{{ student.group }}</td>
            <td>{{ student.specialization }}</td>
            <td>
              <span :class="getLectureClass(student.lastLecture)">
                {{ getLastLectureTitle(student.lastLecture) }}
              </span>
            </td>
            <td>{{ student.initialScore }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import Nav from '@/components/Nav.vue';
  
  const { userData } = useUserData();
  
  // Wait for user data to be loaded and ensure we have a token
  let studentData;
  if (userData.value.loaded && userData.value.token) {
    const { studentData: data } = await useStudents(userData.value.token);
    studentData = data;
  } else {
    // If user is not loaded or no token, create empty ref
    studentData = ref([]);
  }
  
  const { courseData } = await useCourses();
  
  const filters = ref({
    name: '',
    year: '',
    specialization: '',
    group: ''
  });
  
  const filteredStudents = computed(() => {
    if (!studentData || !studentData.value || studentData.value.length === 0) {
      return [];
    }
    return studentData.value.filter(student => {
      const matchesName = `${student.first_name} ${student.last_name}`.toLowerCase().includes(filters.value.name.toLowerCase());
      const matchesYear = !filters.value.year || student.year === filters.value.year;
      const matchesSpecialization = !filters.value.specialization || student.specialization === filters.value.specialization;
      const matchesGroup = !filters.value.group || student.group === filters.value.group;
  
      return matchesName && matchesYear && matchesSpecialization && matchesGroup;
    });
  });
  
  const years = computed(() => {
    if (!studentData || !studentData.value) return [];
    return [...new Set(studentData.value.map(student => student.year).filter(Boolean))];
  });
  const specializations = computed(() => {
    if (!studentData || !studentData.value) return [];
    return [...new Set(studentData.value.map(student => student.specialization).filter(Boolean))];
  });
  const groups = computed(() => {
    if (!studentData || !studentData.value) return [];
    return [...new Set(studentData.value.map(student => student.group).filter(Boolean))];
  });
  
  const getLastLectureTitle = (lastLectureId) => {
    const course = courseData.value.find(course => course.lectures.some(lecture => lecture.id === lastLectureId));
    if (!course) return 'N/A';
    const lecture = course.lectures.find(lecture => lecture.id === lastLectureId);
    return lecture ? lecture.title : 'N/A';
  };
  
  const getLectureClass = (lastLectureId) => {
    return lastLectureId === 'Console objektum' ? 'text-red' : 'text-green';
  };
  </script>
  
  <style scoped>
  .header {
    background: #e5e5e5;
    padding: 20px;
    text-align: center;
  }
  
  .filters {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 10px;
  }
  
  .filter-input {
    padding: 8px;
    font-size: 14px;
    background-color: white;
    border-radius: 8px;
    min-width: 150px;
  }
  
  .student-table {
    width: 100%;
    max-width: 1200px;
    padding: 16px;
    margin-left: auto;
    margin-right: auto;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 10px;
    text-align: left;
  }
  th {
    border-bottom: 1px solid #ddd;
  }
  
  .profile-icon {
    width: 40px;
    height: 40px;
    background-color: #555;
    border-radius: 50%;
  }
  
  .bold {
    font-weight: bold;
  }
  
  .email {
    font-size: 12px;
    color: gray;
  }
  
  .text-red {
    color: red;
  }
  
  .text-green {
    color: green;
  }

  .loading-state,
  .error-state,
  .no-data-state {
    text-align: center;
    padding: 40px 20px;
    margin: 20px;
    border-radius: 8px;
    font-size: 16px;
  }

  .loading-state {
    background-color: #e7f3ff;
    color: #0066cc;
    border: 1px solid #b8d4f0;
  }

  .error-state {
    background-color: #ffe6e6;
    color: #cc0000;
    border: 1px solid #ffb3b3;
  }

  .no-data-state {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
  </style>