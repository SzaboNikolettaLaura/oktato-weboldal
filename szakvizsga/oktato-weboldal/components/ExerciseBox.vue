<template>
    <div class="exercise-box">
      <p>{{ exercise.description }}</p>
      <button @click="tryExercise(exercise.exerciseId)">Try it</button>
    </div>
  </template>
  
  <script setup>
  // Props: Exercise object containing the description and exerciseId
  defineProps({
    exercise: {
      type: Object,
      required: true
    }
  });
  
  
  // Simulate the "Try it" button action
  function tryExercise(exerciseId) {
    navigateTo(`/try?exerciseId=${exerciseId}`)
  }

  </script>
  
  <style scoped>
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
  