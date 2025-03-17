<template>
    <div class="question-container">
      <div class="question-header">
        <h3>Kérdés {{ index + 1 }}</h3>
        <button class="remove-question" @click="removeQuestion">
          <img src="/delete.png" alt="Delete" class="delete-icon" />
        </button>
      </div>
  
      <div class="question-header-container">
        <input
          v-model="question.title"
          class="question-title"
          placeholder="Kérdés szövege"
        />
  
        <select v-model="question.type" @change="handleQuestionTypeChange" class="question-type">
          <option value="text">Rövid válasz</option>
          <option value="checkbox">Jelölőnégyzetek</option>
          <option value="multiple-choice">Többválasztós kérdés</option>
        </select>
      </div>
  
      <div v-if="question.type === 'multiple-choice' || question.type === 'checkbox'">
        <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-container">
          <input
            v-model="option.isCorrect"
            :type="question.type === 'multiple-choice' ? 'radio' : 'checkbox'"
            :name="'question' + index"
            :value="true"
            class="correct-option"
            :disabled="question.type === 'multiple-choice' && option.isCorrect && question.options.filter(opt => opt.isCorrect).length >= 1"
            @change="handleCorrectOptionChange(optionIndex)"
          />
          <input
            v-model="option.text"
            placeholder="Válaszlehetőség"
            class="question-option"
          />
        </div>
        <button @click="addOption" class="add-option">Válaszlehetőség hozzáadása</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['question', 'index', 'removeQuestion'],
    methods: {
      handleQuestionTypeChange() {
        if (this.question.type !== 'multiple-choice' && this.question.type !== 'checkbox') {
          this.question.options = [];
        }
      },
      handleCorrectOptionChange(selectedIndex) {
        // If multiple-choice, ensure only one answer is correct
        if (this.question.type === 'multiple-choice') {
          // Uncheck all other options before marking the selected one as correct
          this.question.options.forEach((option, index) => {
            if (index !== selectedIndex) {
              option.isCorrect = false;
            }
          });
        }
      },
      addOption() {
        this.question.options.push({ text: '', isCorrect: false });
      }
    }
  };
  </script>
  
  <style scoped>
  .question-container {
    margin-bottom: 20px;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .question-header h3 {
    margin: 0;
  }
  
  .question-header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .question-title {
    width: 70%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
    margin-right: 10px;
  }
  
  .question-title:focus {
    outline: none;
    border-color: #007bff;
  }
  
  .question-type {
    width: 28%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  
  .question-type:focus {
    outline: none;
    border-color: #007bff;
  }
  
  .remove-question {
    background-color: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  
  .delete-icon {
    width: 20px;
    height: 20px;
  }
  
  .add-option {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .add-option:hover {
    background-color: #218838;
  }
  
  .option-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .correct-option {
    margin-right: 10px;
  }
  
  .question-option {
    width: 90%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  </style>
  