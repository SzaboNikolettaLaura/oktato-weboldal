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
            :type="question.type === 'multiple-choice' ? 'checkbox' : 'radio'"
            :name="'question' + index"
            :value="true"
            class="correct-option"
            :disabled="question.type === 'checkbox' && option.isCorrect && question.options.filter(opt => opt.isCorrect).length >= 1"
            @change="handleCorrectOptionChange(optionIndex)"
          />
          <input
            v-model="option.text"
            placeholder="Válaszlehetőség"
            class="question-option"
          />
          <button 
            v-if="question.options.length > 2" 
            @click="removeOption(optionIndex)" 
            class="remove-option"
            title="Válaszlehetőség törlése"
          >
            ×
          </button>
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
        if (this.question.type === 'multiple-choice' || this.question.type === 'checkbox') {
          // Add 4 default options if none exist
          if (!this.question.options || this.question.options.length === 0) {
            this.question.options = [
              { text: 'Válaszlehetőség A', isCorrect: false },
              { text: 'Válaszlehetőség B', isCorrect: false },
              { text: 'Válaszlehetőség C', isCorrect: false },
              { text: 'Válaszlehetőség D', isCorrect: false }
            ];
          }
        } else {
          this.question.options = [];
        }
      },
      handleCorrectOptionChange(selectedIndex) {
        // If checkbox type, ensure only one answer is correct
        if (this.question.type === 'checkbox') {
          this.question.options.forEach((option, index) => {
            if (index !== selectedIndex) {
              option.isCorrect = false;
            }
          });
        }
      },
      addOption() {
        this.question.options.push({ text: '', isCorrect: false });
      },
      removeOption(index) {
        this.question.options.splice(index, 1);
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
    cursor: grab;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
    user-select: none;
    margin-bottom: 15px;
  }
  
  .question-header:active {
    cursor: grabbing;
  }
  
  .question-header h3 {
    margin: 0;
    color: #666;
    font-size: 14px;
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
    padding: 5px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .remove-question:hover {
    opacity: 1;
  }
  
  .delete-icon {
    width: 20px;
    height: 20px;
  }
  
  .add-option {
    background-color: #09122C;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .add-option:hover {
    background-color: #061020;
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
  
  .remove-option {
    background-color: #BE3144;
    color: white;
    border: none;
    padding: 4px 8px;
    margin-left: 8px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .remove-option:hover {
    background-color: #a02838;
  }
  </style>
  