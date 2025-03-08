<template>
    <div class="container">
      <!-- Sidebar Section -->
      <div class="sidebar">
        <h2 class="sidebar-title">Courses</h2>
        <div class="sidebar-content">
          <ul>
            <li v-for="(course, courseIndex) in courses" :key="courseIndex" @click="selectCourse(courseIndex)">
              {{ course.courseTitle }}
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Main Section -->
      <div class="main">
        <h1>{{ selectedCourse?.courseTitle }}</h1>
        <div v-for="(lecture, lectureIndex) in selectedCourse?.lectures" :key="lectureIndex">
          <h2>{{ lecture.title }}</h2>
          <p v-html="lecture.content"></p>
  
          <!-- Exercises -->
          <div v-for="exercise in lecture.exercises" :key="exercise.exerciseId" class="exercise-box">
            <p>{{ exercise.description }}</p>
            <button @click="tryExercise(exercise.exerciseId)">Try it</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import courses from '../data/courses.js';
  
  // Store the selected course
  const selectedCourse = ref(null);
  
  // Select a course to display
  function selectCourse(courseIndex) {
    selectedCourse.value = courses[courseIndex];
  }
  
  // Simulate the "Try it" button action
  function tryExercise(exerciseId) {
    alert(`You clicked "Try it" for exercise ${exerciseId}`);
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
  </style>
  