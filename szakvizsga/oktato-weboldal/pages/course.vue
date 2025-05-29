<template>
  <div>
    <Nav />

    <!-- Mobile hamburger menu button -->
    <div class="mobile-menu-btn" :class="{'sidebar-open': !sidebarHidden}" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline :points="sidebarHidden ? '9,18 15,12 9,6' : '15,18 9,12 15,6'"></polyline>
      </svg>
    </div>

    <!-- Mobile overlay -->
    <div v-if="!sidebarHidden" class="mobile-overlay" @click="toggleSidebar"></div>

    <div class="container relative w-full" style="max-width:unset;">
      <div class="sidebar" :class="{'closed': sidebarHidden}">
        <!-- Mobile close button -->
        <div class="mobile-close-btn" @click="toggleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <div class="flex flex-row justify-between items-center flex-wrap mb-8">
          <h2 class="sidebar-title">Courses</h2>
          <div @click="router.push('/lessonedit')" v-if="userData.role === 'tanar'" class="add-lesson-btn rounded-full w-8 h-8 text-white flex items-center justify-center cursor-pointer p-4 m-4 bg-green-500"><span style="text-box-trim:trim-both;">+</span></div>
        </div>
        <div class="sidebar-content">
          <ol class="space-y-2" style="list-style-type: none;">
            <li :class="{
                'text-[#1f5f5f]': lastUnlocked > courseIndex,
                'bg-gray-200': selectedCourse?.title === course.title
            }" class="cursor-pointer course-item" style="list-style-type: none;" v-for="(course, courseIndex) in courses" :key="courseIndex" @click="lastUnlocked >= courseIndex ? selectCourse(courseIndex, 0) : () => {}">
              <div class="flex justify-between items-center">
                <span class="course-title">{{ course.title }}</span>
                <button 
                  v-if="userData.role === 'tanar'"
                  @click.stop="toggleCourseVisibility(course)"
                  :class="[
                    'visibility-btn',
                    course.visible ? 'visibility-on' : 'visibility-off'
                  ]"
                >
                  <svg v-if="course.visible.data[0]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                </button>
              </div>
              <ol v-if="course.lectures.length > 1" class="space-y-2 lecture-list" style="list-style-type: none;">
                <li class="cursor-pointer lecture-item" style="list-style-type: none;" v-for="(lecture, lectureIndex) in course.lectures" :key="lectureIndex">
                    {{ lecture.title }}
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </div>

      <div class="main" :class="{'sidebar-open': !sidebarHidden}">
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="main-title">{{ selectedCourse?.title }}</h1>
          <button 
            v-if="userData.role === 'tanar'"
            @click="router.push(`/lessonedit?id=${selectedCourse?.lectures[0]?.id}`)"
            class="edit-btn"
            title="Edit course"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div v-for="(lecture, lectureIndex) in selectedCourse?.lectures" :key="lectureIndex">
          <h2 class="lecture-title">{{ lecture.title }}</h2>
          <div v-for="(block, blockIndex) in lecture.blocks" :key="blockIndex">
            <div v-if="block.type === 'text'">
              <div v-if="block.editorType === 'markdown'" v-html="renderMarkdown(block.content)"></div>
              <div v-else class="plain-text">{{ block.content }}</div>
            </div>
            <div v-else-if="block.type === 'code'" class="exercise-box">
              <h3 class="exercise-title">{{ block.description }}</h3>
              <button 
                @click="() => { tryCode = block.content; router.push('/try'); }"
                class="try-btn"
              >
                Try it!
              </button>
            </div>
            <div v-else-if="block.type === 'test'" class="test-box">
              <h3 class="test-title">{{ block.title }}</h3>
              <div v-for="(question, qIndex) in block.questions" :key="qIndex">
                <p class="question-text">{{ question.text }}</p>
                <div v-if="question.type === 'multiple'">
                  <div v-for="(option, oIndex) in question.options" :key="oIndex" class="option-item">
                    <input type="radio" :name="'q' + qIndex" :value="oIndex" class="option-radio">
                    <span class="option-text">{{ option }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="block.type === 'highlight'" class="highlight-box">
              <div v-html="renderMarkdown(block.content)"></div>
            </div>
            <div v-else-if="block.type === 'table'" class="table-box">
              <div class="table-wrapper">
                <table class="lesson-table">
                  <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex" :class="{ 'header-row': block.hasHeader && rowIndex === 0 }">
                    <td v-for="(cell, colIndex) in row" :key="colIndex" :class="{ 'header-cell': block.hasHeader && rowIndex === 0 }">
                      {{ cell }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isDialogOpen" class="dialog-overlay">
      <div class="dialog-content">
        <h3 class="dialog-title">Create New Course</h3>
        <form @submit.prevent="submitCourse">
          <div class="form-group">
            <label for="courseTitle" class="form-label">Course Title:</label>
            <input 
              type="text" 
              id="courseTitle" 
              v-model="courseTitle" 
              required 
              class="form-input"
            />
          </div>
          <div class="dialog-actions">
            <button 
              type="button" 
              @click="closeDialog" 
              class="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn-submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';

const { userData } = useUserData();
const { courseData: courses } = await useCourses(userData.value.token);
const router = useRouter();
const { tryCode } = useTryCode();

const lastUnlocked = 2;
const selectedCourse = ref(null);
const sidebarHidden = ref(window.innerWidth <= 768); // Hide sidebar by default on mobile
const courseTitle = ref('');

function renderMarkdown(content) {
  return marked(content);
}

// Select first course on page load
onMounted(() => {
  if (courses.value && courses.value.length > 0) {
    selectCourse(0, 0);
  }
});

function selectCourse(courseIndex, lectureIndex) {
  selectedCourse.value = courses.value[courseIndex];
  // Close sidebar on mobile after selecting a course
  if (window.innerWidth <= 768) {
    sidebarHidden.value = true;
  }
}

function toggleSidebar() {
  sidebarHidden.value = !sidebarHidden.value;
}

const isDialogOpen = ref(false);

// Open the dialog
function openDialog() {
  isDialogOpen.value = true;
}

// Close the dialog
function closeDialog() {
  isDialogOpen.value = false;
  courseTitle.value = ''; // Reset course title input
}

async function submitCourse() {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: courseTitle.value, token: userData.value.token }),
    });

    if (response.ok) {
      // Successfully created the course, you can handle success here
      alert('Course created successfully!');
      closeDialog(); // Close the dialog after submission
    } else {
      // Handle error here (e.g., invalid title or server issue)
      alert('Failed to create course.');
    }
  } catch (error) {
    console.error('Error creating course:', error);
    alert('An error occurred while creating the course.');
  }
}

async function toggleCourseVisibility(course) {
  try {
    const response = await fetch(`/api/courses?id=${course.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        visible: !course.visible,
        token: userData.value.token 
      }),
    });

    if (response.ok) {
      // Update the course visibility in the local state
      course.visible = !course.visible;
    } else {
      alert('Failed to update course visibility.');
    }
  } catch (error) {
    console.error('Error toggling course visibility:', error);
    alert('An error occurred while updating course visibility.');
  }
}
</script>

<style scoped>
/* Mobile hamburger menu button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 30%;
  left: 0;
  transform: translateY(-50%);
  z-index: 60;
  background-color: #09122C;
  color: white;
  padding: 16px 8px;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  box-shadow: 2px 0 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: none;
  writing-mode: vertical-lr;
  text-orientation: mixed;
}

.mobile-menu-btn:hover {
  background-color: #1a1f3a;
  left: 2px;
  box-shadow: 3px 0 12px rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.15);
}

.mobile-menu-btn.sidebar-open {
  left: 280px;
}

/* Mobile overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 45;
}

/* Mobile close button */
.mobile-close-btn {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #BE3144;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 10;
}

.container {
  display: flex;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 300px;
  background-color: #e2e8f0;
  padding: 24px;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.sidebar-title {
  font-size: 28px;
  color: #09122C;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #872341;
}

.sidebar-content {
  padding: 8px 0;
}

.course-item {
  padding: 16px;
  margin: 8px 0;
  border-radius: 12px;
  transition: all 0.2s;
  font-size: 16px;
  color: #1f5f5f;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-item:hover {
  background-color: #f1f5f9;
  color: #BE3144;
  transform: translateY(-1px);
}

.course-item.active {
  color: #BE3144;
  border-left: 3px solid #BE3144;
}

.course-title {
  font-weight: 500;
  flex: 1;
}

.lecture-list {
  margin-top: 12px;
}

.lecture-item {
  padding: 8px 16px;
  margin: 4px 0;
  border-radius: 6px;
  font-size: 14px;
  color: #4a5568;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.lecture-item:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.visibility-btn {
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
}

.visibility-on {
  color: #BE3144;
}

.visibility-off {
  color: #872341;
}

.visibility-btn:hover {
  background-color: rgba(190, 49, 68, 0.1);
  transform: scale(1.1);
}

.main {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  transition: margin-left 0.3s ease;
}

.main-title {
  font-size: 36px;
  color: #09122C;
  font-weight: 700;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #872341;
  flex: 1;
}

.edit-btn {
  padding: 12px;
  background-color: #09122C;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background-color: #1a1f3a;
  transform: scale(1.05);
}

.lecture-title {
  font-size: 24px;
  color: #09122C;
  font-weight: 600;
  margin: 25px 0 15px 0;
}

.exercise-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.exercise-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2d3748;
}

.try-btn {
  margin-top: 16px;
  padding: 12px 24px;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
}

.try-btn:hover {
  background-color: #872341;
  transform: translateY(-1px);
}

.test-box {
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.test-title {
  font-size: 18px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 16px;
}

.question-text {
  color: #1f2937;
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.5;
}

.option-item {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  min-height: 44px;
}

.option-item:hover {
  background-color: rgba(22, 101, 52, 0.05);
}

.option-radio {
  width: 20px;
  height: 20px;
  accent-color: #166534;
}

.option-text {
  flex: 1;
  font-size: 15px;
}

.add-lesson-btn {
  background-color: #BE3144;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(190, 49, 68, 0.3);
  border: none;
}

.add-lesson-btn:hover {
  background-color: #872341;
  transform: scale(1.05);
}

.plain-text {
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
  color: #1f2937;
  font-size: 16px;
}

.highlight-box {
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.table-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.lesson-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.lesson-table th,
.lesson-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.lesson-table th,
.header-cell {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.header-row {
  background-color: #f3f4f6;
}

/* Dialog styles */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 16px;
}

.dialog-content {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-height: 44px;
}

.btn-cancel {
  color: #374151;
  background-color: #f3f4f6;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit {
  color: white;
  background-color: #3b82f6;
}

.btn-submit:hover {
  background-color: #2563eb;
}

/* Numbered lists */
ol {
  counter-reset: item;
  list-style: none;
  padding-left: 0;
}

ol li {
  counter-increment: item;
  margin-bottom: 0.8em;
  font-size: 16px;
}

ol li:before {
  content: counters(item, ".") ".";
  margin-right: 0.8em;
  font-weight: 600;
}

ol li ol {
  counter-reset: item;
  padding-left: 2em;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .mobile-overlay {
    display: block;
  }

  .mobile-close-btn {
    display: block;
  }

  .container {
    position: relative;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 50;
    width: 280px;
    transform: translateX(0);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar.closed {
    transform: translateX(-100%);
  }

  .main {
    padding: 20px 16px;
    margin-left: 0;
    width: 100%;
  }

  .main.sidebar-open {
    margin-left: 0;
  }

  .main-title {
    font-size: 24px;
    margin-bottom: 20px;
    padding-bottom: 10px;
  }

  .lecture-title {
    font-size: 20px;
    margin: 20px 0 12px 0;
  }

  .exercise-box,
  .test-box,
  .highlight-box,
  .table-box {
    padding: 16px;
    margin: 16px 0;
  }

  .exercise-title,
  .test-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .try-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
  }

  .table-wrapper {
    margin: -16px;
    padding: 16px;
  }

  .lesson-table {
    min-width: 400px;
  }

  .lesson-table th,
  .lesson-table td {
    padding: 8px 12px;
    font-size: 14px;
  }

  .dialog-content {
    padding: 24px;
    margin: 16px;
    max-width: none;
  }

  .dialog-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .dialog-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
  }

  .course-item {
    padding: 12px;
    margin: 6px 0;
    font-size: 15px;
  }

  .lecture-item {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 36px;
  }

  .sidebar-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .add-lesson-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

/* Small mobile phones */
@media (max-width: 480px) {
  .sidebar {
    width: 100%;
  }

  .mobile-menu-btn.sidebar-open {
    left: 100%;
    transform: translateX(-100%) translateY(-50%);
  }

  .main-title {
    font-size: 20px;
  }

  .lecture-title {
    font-size: 18px;
  }

  .lesson-table {
    min-width: 320px;
  }

  .lesson-table th,
  .lesson-table td {
    padding: 6px 8px;
    font-size: 13px;
  }
}
</style>
