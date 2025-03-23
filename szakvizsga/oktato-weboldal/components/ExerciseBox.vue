<template>
    <div class="exercise-box">
      <p>{{ exercise.description }}</p>
      <button @click="tryExercise(exercise.id)">Try it</button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  const router = useRouter();

  // Props: Exercise object containing the description and id
  defineProps({
    exercise: {
      type: Object,
      required: true
    }
  });
  
  // Navigate to the try page with the exercise ID
  function tryExercise(exerciseId) {
    router.push(`/try?exerciseId=${exerciseId}`);
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
  