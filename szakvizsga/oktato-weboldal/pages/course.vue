<template>
    <div>
    <Nav />
    <div class="container">
      <!-- Sidebar Section -->
      <div class="sidebar">
        <h2 class="sidebar-title">Courses</h2>
        <div class="sidebar-content">
          <ol class="space-y-2">
            <li :class="{
                'text-[#1f5f5f]': lastUnlocked > courseIndex,
                'bg-gray-200': selectedCourse?.courseTitle === course.courseTitle
            }" class="cursor-pointer" v-for="(course, courseIndex) in courses" :key="courseIndex" @click="lastUnlocked >= courseIndex ? selectCourse(courseIndex, 0) : () => {}">
              <span
                >{{ course.courseTitle }}</span>
              <ol v-if="course.lectures.length > 1" class="space-y-2">
                <li class="cursor-pointer" v-for="(lecture, lectureIndex) in course.lectures" :key="lectureIndex">
                    {{ lecture.title }}
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </div>
  
      <!-- Main Section -->
      <div class="main">
        <h1>{{ selectedCourse?.courseTitle }}</h1>
        <div v-for="(lecture, lectureIndex) in selectedCourse?.lectures" :key="lectureIndex">
          <h2 class="text-lg">{{ lecture.title }}</h2>
          <div v-for="(part, partIndex) in splitContentWithExercises(lecture.content, lecture.exercises)" :key="partIndex">
          <!-- Render Text -->
            <div v-if="typeof part === 'string'" v-html="part"></div>

            <!-- Render Exercises -->
            <ExerciseBox v-else :exercise="part.exercise" />
          </div>
        </div>
      </div>
    </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import courses from '../data/courses.js';
  
  const lastUnlocked = 1;

  // Store the selected course
  const selectedCourse = ref(null);
  
  // Select a course to display
  function selectCourse(courseIndex, lectureIndex) {
    selectedCourse.value = courses[courseIndex];
  }
  
  // Simulate the "Try it" button action
  function tryExercise(exerciseId) {
    alert(`You clicked "Try it" for exercise ${exerciseId}`);
  }
  function splitContentWithExercises(content, exercises) {
  let contentParts = content.split(/(@\{exercise[^\}]+\})/); // Split content by exercise placeholders
  let result = [];

  contentParts.forEach(part => {
    if (part.startsWith('@{exercise')) {
      const exerciseId = part.match(/exercise(\d+)/)[1]; // Extract exercise ID
      const exercise = exercises.find(ex => ex.exerciseId === `exercise${exerciseId}`);
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
    margin-bottom: 20px;
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
    
    /* Each list item increments the counter */
    ol li {
      counter-increment: item;
      margin-bottom: 0.5em;
    }
    
    /* Display the counter before each list item */
    ol li:before {
      content: counters(item, ".") ".";
      margin-right: 0.5em;
    }
    
    /* For nested ordered lists, reset the counter for their items */
    ol li ol {
      counter-reset: item;
      padding-left: 2em; /* Adjust as needed for indentation */
    }
  </style>
  