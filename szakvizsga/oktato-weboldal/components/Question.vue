<template>
  <div class="question-container" :key="currentIndex">
    <h2>JavaScript Szintfelmérő Teszt</h2>
    <div v-if="!isTestFinished">
      <p class="timer">{{ timer }}</p>
      <p class="question">{{ question.text }}</p>
      <button 
        v-for="(option, index) in question.options" 
        :key="index" 
        class="option" 
        @click="selectAnswer(option)"
      >
        {{ option }}
      </button>
      <p class="progress">{{ currentIndex + 1 }}/{{ total }}</p>
    </div>
    <div v-else class="result-section">
      <p class="result">Helyes válaszok száma: {{ correctAnswers }} / {{ total }}.</p>
      <button class="continue-button" @click="finished">Tovább</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['question', 'currentIndex', 'total'],
  data() {
    return {
      timer: 15,
      countdown: null,
      correctAnswers: 0,
      isTestFinished: false,
      selectedAnswer: null,
    };
  },
  watch: {
    currentIndex() {
      this.startTimer();
    }
  },
  mounted() {
    this.startTimer();
  },
  methods: {
    startTimer() {
      this.timer = 15;
      if (this.countdown) clearInterval(this.countdown);
      this.countdown = setInterval(() => {
        if (this.timer > 0 && !this.isTestFinished) {
          this.timer--;
        } else if (this.timer === 0) {
          this.checkAnswer();
          this.moveToNextQuestion();
        }
      }, 1000);
    },
    selectAnswer(option) {
      this.selectedAnswer = option;
      clearInterval(this.countdown);
      this.checkAnswer();
      this.moveToNextQuestion();
    },
    checkAnswer() {
      if (this.selectedAnswer === this.question.correctAnswer) {
        this.correctAnswers++;
      }
    },
    moveToNextQuestion() {
      if (this.currentIndex + 1 < this.total) {
        setTimeout(() => {
          this.$emit('next');
        }, 500);
      } else {
        this.isTestFinished = true;
      }
    },
    finished() {
      this.$emit('finished', this.correctAnswers);
    },
  },
  beforeUnmount() {
    clearInterval(this.countdown);
  },
};
</script>
<style scoped>
.question-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #f8f8f8;
  height: 100vh; 
  width: 100%; 
  padding: 20px;
  box-sizing: border-box; 
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.timer {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.question {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.option {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  font-size: 1rem;
  font-weight: bold;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.option:hover {
  background-color: #9B2540;
}

.progress {
  margin-top: 10px;
  font-size: 1rem;
}

.result-section {
  margin-top: 20px;
  text-align: center;
}

.result {
  font-size: 1.2rem;
  color: #BE3144;
}

.continue-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.continue-button:hover {
  background-color: #9B2540;
}

.flex-1.justify-between {
  background-color: #333333;
}
</style>
