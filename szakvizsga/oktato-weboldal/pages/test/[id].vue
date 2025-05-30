<template>
  <div class="test-page">
    <Nav />
    <div class="test-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p>Teszt betöltése...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <h2>Hiba történt</h2>
        <p>{{ error }}</p>
        <button @click="router.back()" class="back-btn">Vissza</button>
      </div>

      <div v-else-if="testBlocks.length === 0" class="no-tests-container">
        <h2>Nincs teszt</h2>
        <p>Ez a lecke nem tartalmaz teszteket.</p>
        <button @click="router.back()" class="back-btn">Vissza</button>
      </div>

      <div v-else class="test-content">
        <div class="test-header">
          <h1>{{ lectureTitle }}</h1>
          <div v-if="userData && userData.role === 'tanar'" class="teacher-badge">
            <span>Tanári teszt futtatás</span>
          </div>
          <div v-if="hasCompletedTest && userData && userData.role === 'diak'" class="completion-badge">
            <span>✓ Teszt elvégezve: {{ completionDate ? new Date(completionDate).toLocaleString('hu-HU') : '' }}</span>
          </div>
          <div class="test-progress">
            <span>{{ currentTestIndex + 1 }} / {{ testBlocks.length }} teszt</span>
          </div>
        </div>

        <div class="test-block-container">
          <div v-for="(testBlock, testIndex) in testBlocks" :key="testIndex" 
               v-show="currentTestIndex === testIndex" 
               class="test-block">
            
            <div class="test-block-header">
              <h2>{{ testBlock.title }}</h2>
              <div class="question-progress">
                {{ answeredQuestions[testIndex] || 0 }} / {{ testBlock.questions.length }} kérdés megválaszolva
              </div>
            </div>

            <div class="questions-container">
              <div v-for="(question, qIndex) in testBlock.questions" :key="qIndex" class="question-item">
                <div class="question-header">
                  <h3 class="question-title">{{ qIndex + 1 }}. {{ question.title || question.text || 'Névtelen kérdés' }}</h3>
                  <span v-if="question.type !== 'text'" class="question-type">
                    {{ getQuestionTypeLabel(question.type) }}
                  </span>
                </div>

                <!-- Text answer -->
                <div v-if="question.type === 'text'" class="text-answer">
                  <textarea 
                    v-model="answers[testIndex][qIndex]"
                    placeholder="Írja be a válaszát..."
                    class="text-input"
                    @input="updateAnswerCount(testIndex)"
                  ></textarea>
                </div>

                <!-- Radio buttons (single choice) -->
                <div v-else-if="question.type === 'multiple-choice'" class="radio-answers">
                  <div v-for="(option, oIndex) in (question.options || [])" :key="oIndex" class="radio-option">
                    <input 
                      type="radio" 
                      :name="`q_${testIndex}_${qIndex}`"
                      :value="oIndex"
                      v-model="answers[testIndex][qIndex]"
                      :id="`q_${testIndex}_${qIndex}_${oIndex}`"
                      @change="updateAnswerCount(testIndex)"
                    />
                    <label :for="`q_${testIndex}_${qIndex}_${oIndex}`" class="radio-label">
                      {{ option.text || option }}
                      <span v-if="userData && userData.role === 'tanar' && option.isCorrect" class="correct-indicator">✓</span>
                    </label>
                  </div>
                </div>

                <!-- Checkboxes (multiple choice) -->
                <div v-else-if="question.type === 'checkbox'" class="checkbox-answers">
                  <div v-for="(option, oIndex) in (question.options || [])" :key="oIndex" class="checkbox-option">
                    <input 
                      type="checkbox" 
                      :value="oIndex"
                      v-model="answers[testIndex][qIndex]"
                      :id="`q_${testIndex}_${qIndex}_${oIndex}`"
                      @change="updateAnswerCount(testIndex)"
                    />
                    <label :for="`q_${testIndex}_${qIndex}_${oIndex}`" class="checkbox-label">
                      {{ option.text || option }}
                      <span v-if="userData && userData.role === 'tanar' && option.isCorrect" class="correct-indicator">✓</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="test-navigation">
              <button 
                v-if="currentTestIndex > 0" 
                @click="previousTest" 
                class="nav-btn prev-btn"
              >
                ← Előző teszt
              </button>
              
              <button 
                v-if="currentTestIndex < testBlocks.length - 1" 
                @click="nextTest" 
                class="nav-btn next-btn"
              >
                Következő teszt →
              </button>
              
              <button 
                v-if="currentTestIndex === testBlocks.length - 1" 
                @click="submitTest" 
                class="submit-btn"
                :disabled="userData && userData.role === 'tanar' ? false : !allQuestionsAnswered"
              >
                {{ userData && userData.role === 'tanar' ? 'Vissza a szerkesztőhöz' : 
                   hasCompletedTest ? 'Teszt újra beküldése' : 'Teszt beküldése' }}
              </button>
            </div>
          </div>
        </div>

        <div class="test-sidebar">
          <div class="test-overview">
            <h3>Teszt áttekintés</h3>
            <div v-for="(testBlock, testIndex) in testBlocks" :key="testIndex" class="test-summary">
              <button 
                @click="currentTestIndex = testIndex"
                class="test-summary-btn"
                :class="{ active: currentTestIndex === testIndex }"
              >
                <span class="test-name">{{ testBlock.title || `Teszt ${testIndex + 1}` }}</span>
                <span class="completion-status">
                  {{ answeredQuestions[testIndex] || 0 }}/{{ testBlock.questions.length }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Nav from '@/components/Nav.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const { userData } = useUserData();

const loading = ref(true);
const error = ref(null);
const testBlocks = ref([]);
const lectureTitle = ref('');
const currentTestIndex = ref(0);
const answers = ref({});
const answeredQuestions = ref({});
const hasCompletedTest = ref(false);
const completionDate = ref(null);

const allQuestionsAnswered = computed(() => {
  return testBlocks.value.every((testBlock, testIndex) => {
    return testBlock.questions.every((question, qIndex) => {
      const answer = answers.value[testIndex]?.[qIndex];
      if (question.type === 'text') {
        return answer && answer.trim().length > 0;
      } else if (question.type === 'multiple-choice') {
        return answer !== null && answer !== undefined;
      } else if (question.type === 'checkbox') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return false;
    });
  });
});

const initializeAnswers = () => {
  const answersObj = {};
  const answeredCount = {};
  
  testBlocks.value.forEach((testBlock, testIndex) => {
    answersObj[testIndex] = {};
    answeredCount[testIndex] = 0;
    
    // Ensure questions array exists and is not empty
    const questions = testBlock.questions || [];
    
    questions.forEach((question, qIndex) => {
      if (question.type === 'text') {
        answersObj[testIndex][qIndex] = '';
      } else if (question.type === 'multiple-choice') {
        answersObj[testIndex][qIndex] = null;
      } else if (question.type === 'checkbox') {
        answersObj[testIndex][qIndex] = [];
      } else {
        // Default fallback for unknown question types
        answersObj[testIndex][qIndex] = '';
      }
    });
  });
  
  answers.value = answersObj;
  answeredQuestions.value = answeredCount;
};

const updateAnswerCount = (testIndex) => {
  const testBlock = testBlocks.value[testIndex];
  let count = 0;
  
  testBlock.questions.forEach((question, qIndex) => {
    const answer = answers.value[testIndex][qIndex];
    if (question.type === 'text' && answer && answer.trim().length > 0) {
      count++;
    } else if (question.type === 'multiple-choice' && answer !== null && answer !== undefined) {
      count++;
    } else if (question.type === 'checkbox' && Array.isArray(answer) && answer.length > 0) {
      count++;
    }
  });
  
  answeredQuestions.value[testIndex] = count;
};

const getQuestionTypeLabel = (type) => {
  switch (type) {
    case 'multiple-choice': return 'Egyválasztós';
    case 'checkbox': return 'Többválasztós';
    case 'text': return 'Szöveges válasz';
    default: return '';
  }
};

const nextTest = () => {
  if (currentTestIndex.value < testBlocks.value.length - 1) {
    currentTestIndex.value++;
  }
};

const previousTest = () => {
  if (currentTestIndex.value > 0) {
    currentTestIndex.value--;
  }
};

const submitTest = async () => {
  if (userData.value && userData.value.role === 'tanar') {
    // For teachers - store test data in sessionStorage and redirect to lesson editor
    const currentTest = testBlocks.value[currentTestIndex.value];
    const testData = {
      editTest: true,
      testIndex: currentTestIndex.value,
      testTitle: currentTest.title || '',
      testQuestions: currentTest.questions || []
    };
    
    // Store in sessionStorage
    sessionStorage.setItem('editTestData', JSON.stringify(testData));
    
    router.push(`/lessonedit?id=${route.params.id}`);
  } else {
    // For students - submit test completion to database
    try {
      const response = await axios.post('/api/completions', {
        lectureId: route.params.id,
        answers: answers.value,
        token: userData.value.token
      });
      
      if (response.data && response.data.message) {
        alert('Teszt sikeresen beküldve!');
        router.push('/course');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Hiba történt a teszt beküldése során. Kérlek próbáld újra.');
    }
  }
};

const loadTest = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const lectureId = route.params.id;
    const response = await axios.get(`/api/lectures?id=${lectureId}`);
    const lecture = response.data;
    
    lectureTitle.value = lecture.title;
    
    // Extract test blocks from lecture blocks
    const tests = lecture.blocks.filter(block => block.type === 'test');
    
    if (tests.length === 0) {
      testBlocks.value = [];
      return;
    }
    
    // Ensure each test block has proper structure
    const validTests = tests.map(test => ({
      ...test,
      questions: test.questions || [],
      title: test.title || 'Névtelen teszt'
    }));
    
    testBlocks.value = validTests;
    
    // Check if student has already completed this test
    if (userData.value && userData.value.role === 'diak') {
      await checkTestCompletion(lectureId);
    }
    
    // Initialize answers after setting test blocks
    await nextTick();
    initializeAnswers();
    
  } catch (err) {
    console.error('Error loading test:', err);
    error.value = 'Nem sikerült betölteni a tesztet. Kérlek próbáld újra.';
  } finally {
    loading.value = false;
  }
};

const checkTestCompletion = async (lectureId) => {
  try {
    const response = await axios.get(`/api/completions?lectureId=${lectureId}&token=${userData.value.token}`);
    
    if (response.data && response.data.length > 0) {
      hasCompletedTest.value = true;
      completionDate.value = new Date(response.data[0].completedAt);
      
      // Load previous answers if available
      if (response.data[0].answers) {
        const savedAnswers = JSON.parse(response.data[0].answers);
        answers.value = savedAnswers;
      }
    }
  } catch (error) {
    console.error('Error checking test completion:', error);
    // Don't show error for this, just continue normally
  }
};

// Watch for answer changes to update counts
watch(answers, () => {
  testBlocks.value.forEach((_, testIndex) => {
    updateAnswerCount(testIndex);
  });
}, { deep: true });

onMounted(() => {
  loadTest();
});
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 60px;
}

.loading-container, .error-container, .no-tests-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner svg {
  width: 40px;
  height: 40px;
  color: #09122C;
  margin-bottom: 20px;
}

.error-container h2, .no-tests-container h2 {
  color: #BE3144;
  margin-bottom: 20px;
}

.back-btn {
  background-color: #09122C;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.back-btn:hover {
  background-color: #0a1536;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
}

.test-header {
  grid-column: 1 / -1;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.test-header h1 {
  margin: 0 0 15px 0;
  color: #09122C;
  font-size: 28px;
}

.teacher-badge {
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 15px;
}

.completion-badge {
  display: inline-block;
  background-color: #17a2b8;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 15px;
  margin-left: 10px;
}

.test-progress {
  color: #666;
  font-size: 16px;
}

.test-block-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.test-block {
  padding: 30px;
}

.test-block-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 20px;
}

.test-block-header h2 {
  margin: 0 0 10px 0;
  color: #09122C;
  font-size: 24px;
}

.question-progress {
  color: #666;
  font-size: 14px;
}

.questions-container {
  margin-bottom: 40px;
}

.question-item {
  margin-bottom: 40px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.question-title {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.question-type {
  background-color: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.text-answer {
  width: 100%;
}

.text-input {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.radio-answers, .checkbox-answers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option, .checkbox-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.radio-label, .checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1.5;
  flex: 1;
}

input[type="radio"], input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.correct-indicator {
  color: #28a745;
  font-weight: bold;
  font-size: 18px;
}

.test-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding-top: 30px;
  border-top: 1px solid #dee2e6;
}

.nav-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-left: auto;
}

.submit-btn:hover:not(:disabled) {
  background-color: #218838;
}

.submit-btn:disabled {
  background-color: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
}

.test-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.test-overview h3 {
  margin: 0 0 20px 0;
  color: #09122C;
  font-size: 18px;
}

.test-summary {
  margin-bottom: 12px;
}

.test-summary-btn {
  width: 100%;
  padding: 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-summary-btn:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.test-summary-btn.active {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.test-name {
  font-weight: 500;
  color: #333;
}

.completion-status {
  background-color: #09122C;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.test-summary-btn.active .completion-status {
  background-color: #007bff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .test-content {
    grid-template-columns: 1fr;
  }
  
  .test-sidebar {
    order: -1;
    position: static;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .test-navigation {
    flex-direction: column;
    gap: 10px;
  }
  
  .nav-btn, .submit-btn {
    width: 100%;
  }
}
</style> 