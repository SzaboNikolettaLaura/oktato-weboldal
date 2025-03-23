<template>
  <div>
    <Nav />

    <div class="show-courses cursor-pointer" @click="navigateToLessonEdit">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8h15M5 16h22M5 24h22M5 11l3-3l-3-3"/>
      </svg>
    </div>
    
    <div class="container relative">
      <div class="sidebar" :class="{'closed': sidebarHidden}">
        <div class="flex flex-row justify-between items-center flex-wrap mb-8">
          <h2 class="sidebar-title">Courses</h2>
          <div @click="openDialog" v-if="userData.role === 'tanar'" class="add-lesson-btn rounded-full w-8 h-8 text-white flex items-center justify-center cursor-pointer p-4 m-4 bg-green-500">+</div>
        </div>
        <div class="sidebar-content">
          <ol class="space-y-2">
            <li :class="{
                'text-[#1f5f5f]': lastUnlocked > courseIndex,
                'bg-gray-200': selectedCourse?.title === course.title
            }" class="cursor-pointer" v-for="(course, courseIndex) in courses" :key="courseIndex" @click="lastUnlocked >= courseIndex ? selectCourse(courseIndex, 0) : () => {}">
              <div class="flex justify-between items-center">
                <span>{{ course.title }}</span>
                <button 
                  v-if="userData.role === 'tanar'"
                  @click.stop="toggleCourseVisibility(course)"
                  :class="[
                    'px-2 py-1 rounded text-sm',
                    course.visible ? 'visibility-on' : 'visibility-off'
                  ]"
                >
                  <svg v-if="course.visible" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                </button>
              </div>
              <ol v-if="course.lectures.length > 1" class="space-y-2">
                <li class="cursor-pointer" v-for="(lecture, lectureIndex) in course.lectures" :key="lectureIndex">
                    {{ lecture.title }}
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </div>

      <div class="main">
        <h1>{{ selectedCourse?.title }}</h1>
        <div v-for="(lecture, lectureIndex) in selectedCourse?.lectures" :key="lectureIndex">
          <div class="flex items-center gap-2">
            <h2 class="text-lg">{{ lecture.title }}</h2>
            <button 
              v-if="userData.role === 'tanar'"
              @click="router.push(`/lessonedit?id=${lecture.id}`)"
              class="p-1 text-blue-500 hover:text-blue-700"
              title="Edit lecture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
          <div v-for="(part, partIndex) in splitContentWithExercises(lecture.content, lecture.exercises)" :key="partIndex">
            <div v-if="typeof part === 'string'" v-html="part"></div>
            <ExerciseBox v-else :exercise="part.exercise" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isDialogOpen" class="fixed inset-0  flex justify-center items-center z-50" style="background-color: rgba(0.3, 0.3, 0.3, 0.4)">
  <div class="bg-white p-8 rounded-lg shadow-lg w-96">
    <h3 class="text-xl font-semibold text-gray-800 mb-6">Create New Course</h3>
    <form @submit.prevent="submitCourse">
      <div class="mb-4">
        <label for="courseTitle" class="block text-sm font-medium text-gray-700">Course Title:</label>
        <input 
          type="text" 
          id="courseTitle" 
          v-model="courseTitle" 
          required 
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div class="flex justify-end gap-4">
        <button 
          type="button" 
          @click="closeDialog" 
          class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const { courseData: courses } = await useCourses();
const { userData } = useUserData();
const router = useRouter();

const lastUnlocked = 1;
const selectedCourse = ref(null);
const sidebarHidden = ref(false);

function selectCourse(courseIndex, lectureIndex) {
  selectedCourse.value = courses.value[courseIndex];
}

function toggleSidebar() {
  sidebarHidden.value = !sidebarHidden.value;
}

function navigateToLessonEdit() {
  router.push('/lessonedit');
}

const isDialogOpen = ref(false);
const courseTitle = ref('');

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

function splitContentWithExercises(content, exercises) {
  let contentParts = content.split(/(@\{[^\}]+\})/);
  let result = [];

  contentParts.forEach(part => {
    if (part.startsWith('@{')) {
      const exerciseId = Number(part.match(/(\d+)/)[1]);
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        result.push({
          type: 'exercise',
          exercise: exercise
        });
      }
    } else {
      result.push(part);
    }
  });

  return result;
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
.container {
  display: flex;
}

.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 24px;
}

.sidebar-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar-content ul li {
  padding: 10px 0;
  cursor: pointer;
}

.main {
  flex: 1;
  padding: 20px;
}

.main h1 {
  font-size: 32px;
}

.exercise-box {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 20px;
  background-color: #f9f9f9;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 400px;
  width: 100%;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.exercise-box button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.exercise-box button:hover {
  background-color: #45a049;
}

ol {
  counter-reset: item;
  list-style: none;
  padding-left: 0;
}

ol li {
  counter-increment: item;
  margin-bottom: 0.5em;
}

ol li:before {
  content: counters(item, ".") ".";
  margin-right: 0.5em;
}

ol li ol {
  counter-reset: item;
  padding-left: 2em;
}

.show-courses {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  right: 0;
  margin: 16px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  padding: 8px;
  background-color: #09122C;
  color: white;
}

.add-lesson-btn {
  background-color: #4CAF50;
  padding: 10px;
  border-radius: 50%;
  color: white;
  text-align: center;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    left: 0;
    top:  0;
    bottom: 0;
    transition: transform 0.3s ease-in;
  }

  .sidebar.closed {
    transform: translateX(-100%);
  }

  .show-courses {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
