<template>
  <div>
    <div class="modal-overlay" @click.self="closeModal">
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
        <div class="ai-input-container">
          <input 
            v-model="aiInput" 
            type="text" 
            class="ai-input" 
            placeholder="Írd be a kérésed a teszt generálásához..."
            @input="autoExpandInput"
          />
          <button @click="generateAITest" class="generate-btn" :disabled="isGenerating">
            <span v-if="!isGenerating">AI Generálás</span>
            <span v-else class="loading">
              <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generálás...
            </span>
          </button>
        </div>
        <div class="question-list">
          <draggable 
            v-model="questions" 
            item-key="id"
            handle=".question-header"
            :animation="150"
            ghost-class="ghost"
            drag-class="drag"
            direction="vertical"
          >
            <template #item="{ element: question, index }">
              <FormQuestion
                :question="question"
                :index="index"
                :removeQuestion="() => removeQuestion(index)"
              />
            </template>
          </draggable>
        </div>
        <button @click="addQuestion" class="add-question">Kérdés hozzáadása</button>
        <div class="form-actions">
          <button @click="submitForm" class="submit-form">Teszt mentése</button>
          <button class="close-modal" @click="closeModal">Bezárás</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormQuestion from './FormQuestion.vue';
import axios from 'axios';
import draggable from 'vuedraggable';

export default {
  components: {
    FormQuestion,
    draggable
  },
  props: ['block', 'save', 'close', 'courseId', 'token'],
  data() {
    return {
      formTitle: this.block.title || '',
      questions: this.block.questions || [{ title: '', type: 'text', options: [] }],
      aiInput: '',
      isGenerating: false
    };
  },
  methods: {
    autoExpandInput(event) {
      event.target.style.height = 'auto';
      event.target.style.height = event.target.scrollHeight + 'px';
    },
    async generateAITest() {
      if (!this.aiInput) return;
      
      this.isGenerating = true;
      try {
        const response = await axios.post('/api/gemini', {
          prompt: this.aiInput + ' Generálj egy tesztet magyarul. A tesztnek legyen címe és 3-5 kérdése. A kérdések típusai vegyesek legyenek:\n\n1. Rövid válaszos kérdések (type: "text") - csak a kérdés szövege\n2. Többválasztós kérdések (type: "radio") - 4 válaszlehetőség, egy helyes válasz\n3. Több válasz kiválasztására alkalmas kérdések (type: "checkbox") - 4 válaszlehetőség, több helyes válasz\n\nA válaszokat A, B, C, D betűkkel jelöld. A helyes válaszokat csillaggal (*) jelöld. Minden kérdés típusához add meg a megfelelő formátumot. Példa formátum:\n\nCím: Példa teszt\n\n1. [Rövid válasz] Kérdés szövege?\n\n2. [Többválasztós] Kérdés szövege?\nA) Első válasz\nB) Második válasz\nC) Harmadik válasz\nD) Negyedik válasz *\n\n3. [Több válasz] Kérdés szövege?\nA) Első válasz *\nB) Második válasz\nC) Harmadik válasz *\nD) Negyedik válasz\n\n4. [Rövid válasz] Kérdés szövege?\n\n5. [Többválasztós] Kérdés szövege?\nA) Első válasz\nB) Második válasz *\nC) Harmadik válasz\nD) Negyedik válasz'
        });
        
        const content = response.data;
        const lines = content.split('\n');
        let currentQuestion = null;
        let currentOptions = [];
        let currentType = 'text';
        
        lines.forEach(line => {
          if (line.startsWith('Cím:')) {
            this.formTitle = line.replace('Cím:', '').trim();
          } else if (line.match(/^\d+\./)) {
            if (currentQuestion) {
              this.questions.push({
                title: currentQuestion,
                type: currentType,
                options: currentOptions
              });
            }
            currentQuestion = line.replace(/^\d+\.\s*/, '').trim();
            currentOptions = [];
            
            if (line.includes('[Rövid válasz]')) {
              currentType = 'text';
              currentQuestion = currentQuestion.replace('[Rövid válasz]', '').trim();
            } else if (line.includes('[Többválasztós]')) {
              currentType = 'radio';
              currentQuestion = currentQuestion.replace('[Többválasztós]', '').trim();
            } else if (line.includes('[Több válasz]')) {
              currentType = 'checkbox';
              currentQuestion = currentQuestion.replace('[Több válasz]', '').trim();
            }
          } else if (line.match(/^[A-D]\)/)) {
            const isCorrect = line.includes('*');
            currentOptions.push({
              text: line.replace(/^[A-D]\)\s*/, '').replace('*', '').trim(),
              isCorrect
            });
          }
        });
        
        if (currentQuestion) {
          this.questions.push({
            title: currentQuestion,
            type: currentType,
            options: currentOptions
          });
        }
        
        this.aiInput = '';
      } catch (error) {
        console.error('Error generating AI test:', error);
        alert('Nem sikerült generálni a tesztet. Kérlek próbáld újra.');
      } finally {
        this.isGenerating = false;
      }
    },
    addQuestion() {
      this.questions.push({ 
        title: '', 
        type: 'text', 
        options: [],
        id: Date.now() + Math.random()
      });
    },
    removeQuestion(index) {
      this.questions.splice(index, 1);
    },
    async submitForm() {
      if (!this.formTitle || this.formTitle.trim() === '') {
        alert('A teszt címe kötelező!');
        return;
      }
      
      if (!this.questions || this.questions.length === 0) {
        alert('Legalább egy kérdés szükséges!');
        return;
      }
      
      const testBlock = {
        type: 'test',
        title: this.formTitle,
        questions: this.questions,
        id: Date.now() + Math.random()
      };
      
      try {
        const response = await axios.post('/api/lectures', {
          course: this.courseId,
          blocks: [testBlock],
          title: this.formTitle,
          visibility: true,
          token: this.token
        });
        
        alert('Teszt sikeresen mentve!');
        this.$emit('close');
      } catch (error) {
        console.error('Error saving test:', error);
        alert('Hiba történt a teszt mentése során. Kérlek próbáld újra.');
      }
    },
    closeModal() {
      this.$emit('close');
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

.ai-input-container {
  margin-bottom: 30px;
}

.ai-input {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  box-sizing: border-box;
  margin-bottom: 10px;
  min-height: 60px;
  height: auto;
  resize: none;
  overflow: hidden;
  line-height: 1.5;
}

.ai-input:focus {
  outline: none;
  border-color: #007bff;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background-color: #09122C;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.generate-btn:disabled {
  background-color: #061020;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading svg {
  width: 20px;
  height: 20px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.question-list {
  margin-bottom: 20px;
  min-height: 50px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.drag {
  opacity: 0.9;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  background-color: #09122C;
  width: auto;
  margin-top: 15px;
}

.add-question:hover {
  background-color: #061020;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.submit-form {
  background-color: #09122C;
  flex-grow: 1;
  margin-right: 15px;
}

.submit-form:hover {
  background-color: #061020;
}

.close-modal {
  background-color: #BE3144;
}

.close-modal:hover {
  background-color: #a02838;
}
</style>