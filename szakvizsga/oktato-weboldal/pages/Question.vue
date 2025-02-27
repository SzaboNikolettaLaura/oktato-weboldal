<template>
  <div class="question-container">
    <h2>JavaScript Szintfelmérő Teszt</h2>

    <!-- Wrapper to conditionally render timer and question/content -->
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

    <!-- Result section after test is finished -->
    <div v-else class="result-section">
      <p class="result">You got {{ correctAnswers }} out of {{ total }} correct.</p>
      <button class="continue-button" @click="nextTest">Tovabb</button>
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
  mounted() {
    this.startTimer();
  },
  methods: {
    startTimer() {
      this.timer = 15;
      this.countdown = setInterval(() => {
        if (this.timer > 0 && !this.isTestFinished) {
          this.timer--;
        } else if (this.timer === 0) {
          this.checkAnswer();
        }
      }, 1000);
    },
    selectAnswer(option) {
      this.selectedAnswer = option;
      clearInterval(this.countdown);
      this.checkAnswer();
    },
    checkAnswer() {
      if (this.selectedAnswer === this.question.correctAnswer) {
        this.correctAnswers++;
      }
      if (this.currentIndex + 1 < this.total) {
        this.$emit('next');  // Notify parent to move to next question
      } else {
        this.isTestFinished = true;  // Show result when test is complete
        this.$emit('finished', this.correctAnswers);  // Send final score to parent
      }
    },
    nextTest() {
      this.$emit('nextTest');  // Trigger event to go to the next test (or page)
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
  align-items: center;
  text-align: center;
  background: #f8f8f8;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
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
  color: #4CAF50;
}

.continue-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.continue-button:hover {
  background-color: #45a049;
}
</style>
