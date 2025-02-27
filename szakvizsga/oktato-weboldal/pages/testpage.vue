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
    />
  </div>
</template>

<script>
import Question from './Question.vue';
import questions from '../data/questions.js';

export default {
  components: { Question },
  data() {
    return {
      quizStarted: false,
      currentQuestionIndex: 0,
      questions,
    };
  },
  methods: {
    startQuiz() {
      this.quizStarted = true;
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        alert("Teszt vége!");
        this.quizStarted = false;
        this.currentQuestionIndex = 0;
      }
    },
  },
};
</script>

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
