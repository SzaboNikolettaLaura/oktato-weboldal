<template>
  <div class="notification-popup" v-if="isVisible">
    <div class="notification-content">
      <div class="notification-header">
        <h3>Értesítések</h3>
        <button class="close-button" @click="closePopup">&times;</button>
      </div>
      
      <div class="notification-list">
        <div v-if="notifications.length === 0" class="no-notifications">
          Nincsenek értesítések
        </div>
        <div v-else v-for="notification in notifications" :key="notification.id" class="notification-item">
          <div class="notification-header">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-meta">
              <span class="course-name">{{ notification.courseTitle }}</span>
              <span v-if="notification.lectureTitle" class="lecture-name"> - {{ notification.lectureTitle }}</span>
            </div>
          </div>
          <div class="notification-content">
            <p>{{ notification.message }}</p>
            <div class="notification-details">
              <span>Határidő: {{ formatDate(notification.deadline) }}</span>
              <span>Státusz: {{ notification.status }}</span>
            </div>
          </div>
          <div class="notification-actions" v-if="userData.role === 'tanar'">
            <button @click="editNotification(notification)" class="edit-btn">Szerkesztés</button>
            <button @click="deleteNotification(notification.id)" class="delete-btn">Törlés</button>
          </div>
        </div>
      </div>

      <div v-if="userData.role === 'tanar'" class="notification-actions">
        <button class="send-notification-btn" @click="showSendForm = true">
          Új értesítés küldése
        </button>
      </div>
    </div>

    <!-- Send/Edit Notification Form -->
    <div v-if="showSendForm" class="notification-form-overlay">
      <div class="notification-form">
        <h3>{{ isEditing ? 'Értesítés szerkesztése' : 'Új értesítés küldése' }}</h3>
        <form @submit.prevent="submitNotification">
          <div class="form-group">
            <label for="courseSelect">Kurzus</label>
            <select id="courseSelect" v-model="newNotification.courseId" required :disabled="isEditing">
              <option :value="null">Válassz kurzust</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="lectureSelect">Lecke (opcionális)</label>
            <select id="lectureSelect" v-model="newNotification.lectureId" :disabled="isEditing || !newNotification.courseId">
              <option :value="null">Nincs lecke</option>
              <option v-for="lecture in selectedCourseLectures" :key="lecture.id" :value="lecture.id">
                {{ lecture.title }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="title">Cím</label>
            <input type="text" id="title" v-model="newNotification.title" required>
          </div>
          <div class="form-group">
            <label for="message">Üzenet</label>
            <textarea id="message" v-model="newNotification.message" required></textarea>
          </div>
          <div class="form-group">
            <label for="deadline">Határidő</label>
            <input type="datetime-local" id="deadline" v-model="newNotification.deadline" required>
          </div>
          <div class="form-group" v-if="isEditing">
            <label for="status">Státusz</label>
            <select id="status" v-model="newNotification.status">
              <option value="active">Aktív</option>
              <option value="completed">Befejezett</option>
              <option value="cancelled">Törölt</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeForm">Mégse</button>
            <button type="submit">{{ isEditing ? 'Mentés' : 'Küldés' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  isVisible: Boolean
});

const emit = defineEmits(['close']);
const router = useRouter();

const { userData } = useUserData();
const { courseData: courses } = await useCourses(userData.value.token);
const notifications = ref([]);
const showSendForm = ref(false);
const isEditing = ref(false);

const newNotification = ref({
  id: null,
  courseId: null,
  lectureId: null,
  title: '',
  message: '',
  deadline: '',
  status: 'active'
});

const selectedCourseLectures = computed(() => {
  if (!newNotification.value.courseId) return [];
  const course = courses.value.find(c => c.id === newNotification.value.courseId);
  console.log('Selected course in computed:', course);
  if (!course) return [];
  console.log('Course lectures:', course.lectures);
  return course.lectures || [];
});

// Watch for courseId changes
watch(() => newNotification.value.courseId, (newCourseId) => {
  console.log('Course ID changed:', newCourseId);
  console.log('Available courses:', courses.value);
  if (newCourseId) {
    const course = courses.value.find(c => c.id === newCourseId);
    console.log('Selected course:', course);
    console.log('Available lectures:', course?.lectures);
  }
  // Reset lectureId when course changes
  newNotification.value.lectureId = null;
});

const closePopup = () => {
  emit('close');
};

const closeForm = () => {
  showSendForm.value = false;
  isEditing.value = false;
  resetForm();
};

const resetForm = () => {
  newNotification.value = {
    id: null,
    courseId: null,
    lectureId: null,
    title: '',
    message: '',
    deadline: '',
    status: 'active'
  };
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('hu-HU');
};

const fetchNotifications = async () => {
  try {
    const response = await axios.get('/api/notifications', {
      params: {
        token: userData.value.token
      }
    });
    notifications.value = response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data?.error || error.message);
  }
};

const submitNotification = async () => {
  try {
    const url = isEditing.value 
      ? `/api/notifications/${newNotification.value.id}`
      : '/api/notifications';
    
    const method = isEditing.value ? 'put' : 'post';
    
    const notificationData = {
      ...newNotification.value,
      lectureId: newNotification.value.lectureId || null
    };
    
    console.log('Submitting notification:', notificationData);
    
    const response = await axios[method](url, notificationData, {
      headers: {
        'Authorization': `Bearer ${userData.value.token}`
      }
    });

    closeForm();
    await fetchNotifications();
  } catch (error) {
    console.error('Error submitting notification:', error);
    alert(error.response?.data?.error || (isEditing.value ? 'Nem sikerült módosítani az értesítést.' : 'Nem sikerült elküldeni az értesítést.'));
  }
};

const editNotification = (notification) => {
  isEditing.value = true;
  newNotification.value = { ...notification };
  showSendForm.value = true;
};

const deleteNotification = async (id) => {
  if (!confirm('Biztosan törölni szeretnéd ezt az értesítést?')) return;
  
  try {
    await axios.delete(`/api/notifications/${id}`, {
      headers: {
        'Authorization': `Bearer ${userData.value.token}`
      }
    });
    await fetchNotifications();
  } catch (error) {
    console.error('Error deleting notification:', error);
    alert(error.response?.data?.error || 'Nem sikerült törölni az értesítést.');
  }
};


onMounted(async () => {
  await fetchNotifications();
});
</script>

<style scoped>
.notification-popup {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.notification-content {
  padding: 20px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.notification-message {
  color: #666;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.no-notifications {
  text-align: center;
  color: #666;
  padding: 20px;
}

.notification-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.send-notification-btn {
  width: 100%;
  padding: 10px;
  background: #c00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.notification-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.notification-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background: #c00;
  color: white;
}

.form-actions button[type="button"] {
  background: #eee;
  color: #666;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.filter-group {
  margin-bottom: 10px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.notification-meta {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.course-name, .lecture-name {
  color: #09122C;
}

.notification-content {
  margin: 10px 0;
}

.notification-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 10px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background: #4CAF50;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}
</style> 