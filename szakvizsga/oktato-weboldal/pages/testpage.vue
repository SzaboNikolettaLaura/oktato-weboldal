<template>
  <div class="container">
    <header v-if="!quizStarted" class="header">
      <h1>Szintfelmérő teszt</h1>
      <p class="description">
        Mennyire értesz a JavaScripthez? Töltsd ki a tesztet, és derítsd ki, hogy milyen szinten állsz!
      </p>
      <button class="button" @click="startQuiz">Kezdés</button>
    </header>

    <Question v-else 
      :question="questions[currentQuestionIndex]" 
      :current-index="currentQuestionIndex" 
      :total="questions.length" 
      @next="nextQuestion"
      @finished="finished"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'test-complete'
});
import { ref } from 'vue';
import axios from 'axios';
import Question from '../components/Question.vue';
import questions from '../data/questions.js';

const {userData} = useUserData();

const quizStarted = ref(false);
const currentQuestionIndex = ref(0);

const startQuiz = () => {
  quizStarted.value = true;
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++;
  } else {
    quizStarted.value = false;
  }
};
const finished = (correctAnswers) => {
  axios.post(`/api/quiz`, {correct: correctAnswers, token: userData.value.token}).then(() => {
    navigateTo(`/users/${userData.value.id}`);
  })
}
</script>

<style>

body {
  background-color: #f8f8f8;
}
</style>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 600px;
  min-height: 100vh;
  margin: auto;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.description {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.button {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 700;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.button:hover {
  background-color: #9B2540;
}
</style>
