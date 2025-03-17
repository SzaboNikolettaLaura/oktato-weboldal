<template>
  <div>
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="form-builder-modal">
        <h1>Teszt létrehozása</h1>
        <div class="form-title-container">
          <input
            v-model="formTitle"
            type="text"
            class="form-title"
            placeholder="Add meg a teszt címét"
          />
        </div>
        <div class="question-list">
          <div v-for="(question, index) in questions" :key="index">
            <FormQuestion
              :question="question"
              :index="index"
              :removeQuestion="() => removeQuestion(index)"
            />
          </div>
        </div>
        <button @click="addQuestion" class="add-question">Kérdés hozzáadása</button>
        <div class="form-actions">
          <button @click="submitForm" class="submit-form">Teszt beküldése</button>
          <button class="close-modal" @click="closeModal">Bezárás</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormQuestion from './FormQuestion.vue';

export default {
  components: {
    FormQuestion
  },
  data() {
    return {
      isModalOpen: true,
      formTitle: '',
      questions: [{ title: '', type: 'text', options: [] }]
    };
  },
  methods: {
    closeModal() {
      this.isModalOpen = false;
    },
    addQuestion() {
      this.questions.push({ title: '', type: 'text', options: [] });
    },
    removeQuestion(index) {
      this.questions.splice(index, 1);
    },
    submitForm() {
      const formData = {
        title: this.formTitle,
        questions: this.questions
      };
      console.log("Teszt adat beküldve", formData);
      this.closeModal();
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 30px;
}

.form-builder-modal {
  background-color: #f7f7f7;
  padding: 40px;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow-y: auto;
}

h1 {
  font-size: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.form-title-container {
  margin-bottom: 30px;
}

.form-title {
  width: 100%;
  padding: 16px;
  font-size: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white; /* Fehér háttér a cím mezőhöz */
  box-sizing: border-box;
  margin-bottom: 30px;
}

.form-title:focus {
  outline: none;
  border-color: #007bff;
}

.question-list {
  margin-bottom: 20px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  width: 100%;
}

button:hover {
  background-color: #0056b3;
}

.add-question {
  background-color: #28a745;
  width: auto;
  margin-top: 15px;
}

.add-question:hover {
  background-color: #218838;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.submit-form {
  background-color: #28a745;
  flex-grow: 1;
  margin-right: 15px;
}

.submit-form:hover {
  background-color: #218838;
}

.close-modal {
  background-color: #dc3545;
}

.close-modal:hover {
  background-color: #c82333;
}
</style>
