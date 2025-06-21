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
          <div class="notification-header" @click="toggleNotification(notification.id)">
            <div class="notification-title-row">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="dropdown-arrow" :class="{ 'expanded': expandedNotifications.includes(notification.id) }">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4H4z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div v-if="expandedNotifications.includes(notification.id)" class="notification-details-content">
            <div class="notification-meta">
              <div class="course-lecture-info">
                <span class="course-name">📚 {{ notification.course_title }}</span>
                <span v-if="notification.lecture_title" class="lecture-name">📖 {{ notification.lecture_title }}</span>
                <span v-else class="general-notification">🌐 Általános értesítés</span>
              </div>
            </div>
            <div class="notification-content">
              <p>{{ notification.message }}</p>
              <div class="notification-details">
                <span class="deadline-info">⏰ {{ formatDate(notification.deadline) }}</span>
                <span class="status-info" :class="`status-${notification.status}`">
                  {{ getStatusIcon(notification.status) }} {{ getStatusText(notification.status) }}
                </span>
              </div>
            </div>
            <div class="notification-actions" v-if="userData.role === 'tanar'">
              <button @click.stop="editNotification(notification)" class="edit-btn">✏️ Szerkesztés</button>
              <button @click.stop="deleteNotification(notification.id)" class="delete-btn">🗑️ Törlés</button>
            </div>
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
        
        <!-- Debug info for development -->
        <div v-if="false" style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-size: 12px;">
          <strong>Debug Info:</strong><br>
          Courses loaded: {{ courses?.length || 0 }}<br>
          Selected courseId: {{ newNotification.courseId }}<br>
          Selected lectureId: {{ newNotification.lectureId }}<br>
          Available lectures: {{ selectedCourseLectures.length }}<br>
          Is editing: {{ isEditing }}
        </div>
        
        <form @submit.prevent="submitNotification">
          <div class="form-group">
            <label for="courseSelect">
              <span class="label-text">Kurzus</span>
              <span class="required-asterisk">*</span>
            </label>
            <select id="courseSelect" v-model="newNotification.courseId" required>
              <option :value="null">🎓 Válassz kurzust...</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
            <small class="form-help">A kurzus, amelyhez az értesítés tartozik</small>
          </div>
          <div class="form-group">
            <label for="lectureSelect">
              <span class="label-text">Lecke</span>
              <span class="optional-text">(opcionális)</span>
            </label>
            <select id="lectureSelect" v-model="newNotification.lectureId" :disabled="!newNotification.courseId">
              <option :value="null">📖 Nincs specifikus lecke</option>
              <option v-for="lecture in selectedCourseLectures" :key="lecture.id" :value="lecture.id">
                {{ lecture.title }}
              </option>
            </select>
            <small class="form-help">
              {{ newNotification.courseId 
                ? 'Válassz leckét, ha az értesítés egy konkrét leckéhez kapcsolódik' 
                : 'Először válassz kurzust a leckék betöltéséhez' }}
            </small>
          </div>
          <div class="form-group">
            <label for="title">
              <span class="label-text">Cím</span>
              <span class="required-asterisk">*</span>
            </label>
            <input type="text" id="title" v-model="newNotification.title" required placeholder="Például: Új feladat érkezett">
          </div>
          <div class="form-group">
            <label for="message">
              <span class="label-text">Üzenet</span>
              <span class="required-asterisk">*</span>
            </label>
            <textarea id="message" v-model="newNotification.message" required placeholder="Írd le az értesítés részleteit..."></textarea>
          </div>
          <div class="form-group">
            <label for="deadline">
              <span class="label-text">Határidő</span>
              <span class="required-asterisk">*</span>
            </label>
            <input 
              type="datetime-local" 
              id="deadline" 
              v-model="newNotification.deadline" 
              :min="minDeadlineDate"
              required
            >
            <small class="form-help">Az értesítés lejárati dátuma és ideje (minimum 24 óra múlva)</small>
          </div>
          <div class="form-group" v-if="isEditing">
            <label for="status">
              <span class="label-text">Státusz</span>
            </label>
            <select id="status" v-model="newNotification.status">
              <option value="active">✅ Aktív</option>
              <option value="completed">🎯 Befejezett</option>
              <option value="cancelled">❌ Törölt</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeForm" class="btn-cancel">Mégse</button>
            <button type="submit" class="btn-submit">{{ isEditing ? '💾 Mentés' : '📤 Küldés' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
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
const expandedNotifications = ref([]);

const newNotification = ref({
  id: null,
  courseId: null,
  lectureId: null,
  title: '',
  message: '',
  deadline: '',
  status: 'active'
});

// Calculate minimum date (24 hours from now)
const minDeadlineDate = computed(() => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Add 24 hours
  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  return tomorrow.toISOString().slice(0, 16);
});

const selectedCourseLectures = computed(() => {
  if (!newNotification.value.courseId) {
    console.log('No course selected');
    return [];
  }
  const course = courses.value.find(c => c.id === newNotification.value.courseId);
  console.log('Selected course in computed:', course);
  if (!course) {
    console.log('Course not found in courses list');
    return [];
  }
  console.log('Course lectures:', course.lectures);
  return course.lectures || [];
});

// Watch for courseId changes
watch(() => newNotification.value.courseId, (newCourseId, oldCourseId) => {
  console.log('Course ID changed from', oldCourseId, 'to', newCourseId);
  console.log('Available courses:', courses.value);
  
  if (newCourseId) {
    const course = courses.value.find(c => c.id === newCourseId);
    console.log('Selected course:', course);
    console.log('Available lectures:', course?.lectures);
    
    // Only reset lectureId if the course actually changed (not on initial load)
    if (oldCourseId !== undefined && oldCourseId !== newCourseId) {
      console.log('Resetting lecture selection due to course change');
      newNotification.value.lectureId = null;
    }
  } else {
    // No course selected, always reset lecture
    newNotification.value.lectureId = null;
  }
});

// Watch for when courses are loaded to ensure proper initialization
watch(() => courses.value, (newCourses) => {
  console.log('Courses updated:', newCourses);
  if (newCourses && newCourses.length > 0) {
    console.log('Courses loaded successfully, count:', newCourses.length);
  }
}, { immediate: true });

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

const getStatusIcon = (status) => {
  switch (status) {
    case 'active': return '✅';
    case 'completed': return '🎯';
    case 'cancelled': return '❌';
    default: return '❓';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Aktív';
    case 'completed': return 'Befejezett';
    case 'cancelled': return 'Törölt';
    default: return 'Ismeretlen';
  }
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
    // Validate deadline is at least 24 hours from now
    const now = new Date();
    const selectedDeadline = new Date(newNotification.value.deadline);
    const minDeadline = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    
    if (selectedDeadline < minDeadline) {
      alert('A határidő legalább 24 órával a jelenlegi időpont után kell, hogy legyen.');
      return;
    }
    
    const url = isEditing.value 
      ? `/api/notifications/${newNotification.value.id}`
      : '/api/notifications';
    
    const method = isEditing.value ? 'put' : 'post';
    
    const notificationData = {
      ...newNotification.value,
      lectureId: newNotification.value.lectureId || null,
      token: userData.value.token
    };
    
    console.log('Submitting notification:', notificationData);
    
    const response = await axios[method](url, notificationData);

    closeForm();
    await fetchNotifications();
  } catch (error) {
    console.error('Error submitting notification:', error);
    alert(error.response?.data?.error || (isEditing.value ? 'Nem sikerült módosítani az értesítést.' : 'Nem sikerült elküldeni az értesítést.'));
  }
};

const editNotification = (notification) => {
  isEditing.value = true;
  
  // Map the notification data properly, handling different field names
  newNotification.value = {
    id: notification.id,
    courseId: notification.courseId || notification.course_id,
    lectureId: notification.lectureId || notification.lecture_id,
    title: notification.title,
    message: notification.message,
    deadline: notification.deadline,
    status: notification.status || 'active'
  };
  
  console.log('Editing notification:', notification);
  console.log('Mapped notification data:', newNotification.value);
  
  showSendForm.value = true;
};

const deleteNotification = async (id) => {
  if (!confirm('Biztosan törölni szeretnéd ezt az értesítést?')) return;
  
  try {
    await axios.delete(`/api/notifications/${id}?token=${userData.value.token}`);
    await fetchNotifications();
  } catch (error) {
    console.error('Error deleting notification:', error);
    alert(error.response?.data?.error || 'Nem sikerült törölni az értesítést.');
  }
};

const toggleNotification = (id) => {
  if (expandedNotifications.value.includes(id)) {
    expandedNotifications.value = expandedNotifications.value.filter(notifId => notifId !== id);
  } else {
    expandedNotifications.value.push(id);
  }
};

// Handle clicking outside the popup
const handleClickOutside = (event) => {
  const popup = event.target.closest('.notification-popup');
  const button = event.target.closest('#notifications-button');
  if (!popup && !button) {
    closePopup();
  }
};

onMounted(async () => {
  await fetchNotifications();
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Clean up event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-popup {
  position: fixed;
  top: 70px;
  right: 20px;
  width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  padding: 24px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-header h3 {
  margin: 0;
  color: #1a1a1a;
  font-size: 20px;
  font-weight: 600;
}

.close-button {
  background: #f8f9fa;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e9ecef;
  color: #495057;
  transform: scale(1.05);
}

.notification-list {
  max-height: 450px;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.notification-item {
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #fafbfc;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  overflow: hidden;
}

.notification-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.notification-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.notification-item .notification-header {
  margin-bottom: 0;
  padding: 20px;
  border-bottom: none;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.notification-item .notification-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

.notification-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-weight: 600;
  font-size: 16px;
  color: #212529;
  margin-bottom: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
}

.dropdown-arrow {
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #e9ecef;
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dropdown-arrow:hover {
  background: #dee2e6;
  border-color: #adb5bd;
  transform: scale(1.05);
}

.dropdown-arrow.expanded {
  transform: rotate(180deg) scale(1.05);
  background: #BE3144;
  color: white;
  border-color: #BE3144;
  box-shadow: 0 2px 6px rgba(190, 49, 68, 0.3);
}

.dropdown-arrow svg {
  width: 18px;
  height: 18px;
}

.notification-details-content {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #e9ecef;
  margin-top: -1px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-meta {
  font-size: 13px;
  color: #6c757d;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-lecture-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.course-name {
  color: #BE3144;
  font-weight: 600;
  background: rgba(190, 49, 68, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-block;
  max-width: fit-content;
}

.lecture-name {
  color: #09122C;
  font-weight: 500;
  background: rgba(9, 18, 44, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-block;
  max-width: fit-content;
}

.general-notification {
  color: #6c757d;
  font-weight: 400;
  font-style: italic;
  font-size: 11px;
}

.deadline-info {
  background: #e7f3ff;
  color: #0066cc;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
}

.status-info {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.notification-content {
  margin: 12px 0;
}

.notification-content p {
  margin: 0 0 12px 0;
  color: #495057;
  line-height: 1.5;
  font-size: 14px;
}

.notification-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.notification-details span {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  background: linear-gradient(135deg, #09122C, #070f20);
  color: white;
  box-shadow: 0 2px 4px rgba(9, 18, 44, 0.2);
}

.edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(9, 18, 44, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #BE3144, #a82b3a);
  color: white;
  box-shadow: 0 2px 4px rgba(190, 49, 68, 0.2);
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(190, 49, 68, 0.3);
}

.no-notifications {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
  font-size: 15px;
}

.send-notification-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #BE3144, #a82b3a);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(190, 49, 68, 0.2);
}

.send-notification-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(190, 49, 68, 0.3);
}

.notification-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.notification-form {
  background: white;
  padding: 32px;
  border-radius: 20px;
  width: 90%;
  max-width: 540px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.notification-form h3 {
  margin: 0 0 24px 0;
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}

.label-text {
  display: inline-block;
  margin-right: 4px;
}

.required-asterisk {
  color: #BE3144;
  font-weight: 600;
  margin-left: 2px;
}

.optional-text {
  color: #6c757d;
  font-weight: 400;
  font-size: 12px;
  margin-left: 4px;
}

.form-help {
  display: block;
  margin-top: 4px;
  color: #6c757d;
  font-size: 12px;
  line-height: 1.4;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #fafbfc;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #BE3144;
  background: white;
  box-shadow: 0 0 0 3px rgba(190, 49, 68, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.form-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-cancel {
  background: #f8f9fa !important;
  color: #495057 !important;
  border: 2px solid #e9ecef !important;
}

.btn-cancel:hover {
  background: #e9ecef !important;
  border-color: #dee2e6 !important;
}

.btn-submit {
  background: linear-gradient(135deg, #BE3144, #a82b3a) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(190, 49, 68, 0.2) !important;
}

.btn-submit:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(190, 49, 68, 0.3) !important;
}

.filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.filter-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #BE3144;
  box-shadow: 0 0 0 3px rgba(190, 49, 68, 0.1);
}

@media (max-width: 768px) {
  .notification-popup {
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
  }
  
  .notification-form {
    width: 95%;
    padding: 24px;
    margin: 20px;
  }
}
</style> 