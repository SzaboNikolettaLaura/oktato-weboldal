<template>
  <div class="lesson-editor">
    <Nav />
    <div class="action-bar">
      <div>
        <span>Kurzus: </span>
        <select v-model="course" class="filter-input">
          <option value="" selected="selected">Kurzus</option>
          <option v-bind:value="c.id" v-for="c of courseData" v-bind:key="c.id">{{ c.title }}</option>
        </select>
      </div>
      <div>
        <span>Cím: </span>
        <input type="text" v-model="lectureTitle" class="filter-input">
      </div>
      <button @click="addTextBlock" class="action-btn">Szöveg+</button>
      <button @click="addCodeBlock" class="action-btn">Kód+</button>
      <button @click="addTestBlock" class="action-btn">Teszt+</button>
      <button @click="toggleVisibility" class="action-btn" :class="{ 'visibility-on': visibility, 'visibility-off': !visibility }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="visibility" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <path v-if="visibility" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
          <path v-if="!visibility" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        </svg>
        {{ visibility ? 'Látható' : 'Rejtett' }}
      </button>
      <button @click="saveLesson" class="action-btn">Mentés</button>
    </div>

    <div class="editor-container">
      <div class="controls"></div>
      <div class="blocks">
        <div v-for="(block, index) in lessonBlocks" :key="index" class="block">
          <div v-if="block.type === 'text'">
            <textarea v-model="block.content" placeholder="Írd ide a magyarázatot..." class="block-textarea" />
          </div>
          <div v-else-if="block.type === 'code'" class="code-block">
            <input class="p-4 w-full" type="text" v-model="block.description" placeholder="Kód leírása">
            <div :id="`monaco-editor-${index}`" class="monaco-container"></div>
          </div>
          <div v-else-if="block.type === 'test'" class="test-block">
            <span class="test-block-label">Teszt Blokk</span>
            <p>{{ block.title }}</p>
            <div class="block-buttons">
              <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
              <button @click="openModal(block, index)" class="btn btn-primary">Módosítás</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button @click="toggleInputField" class="ai-generation-btn">AI</button>

    <div v-if="showInputField" class="ai-input-container">
      <input type="text" v-model="aiInput" class="ai-input" placeholder="Enter AI prompt...">
    </div>

    <TestBlockEditor
      v-if="isModalVisible"
      :block="currentTestBlock"
      @save="saveBlockChanges"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import Nav from '@/components/Nav.vue';
import axios from 'axios';
import TestBlockEditor from '@/components/TestBlockEditor.vue';
import { useRoute } from 'vue-router';
import * as monaco from 'monaco-editor';

const route = useRoute();
const { userData } = useUserData();
const { courseData } = await useCourses();
const lessonBlocks = ref([]);
const visibility = ref(true);
const course = ref('');
const lectureTitle = ref('');
const isModalVisible = ref(false);
const currentTestBlock = ref(null);
const showInputField = ref(false);
const aiInput = ref('');
const editors = {};

const addTextBlock = () => {
  lessonBlocks.value.push({ type: 'text', content: '' });
};

const addCodeBlock = () => {
  lessonBlocks.value.push({ type: 'code', content: '', description: '' });
  nextTick(() => {
    const index = lessonBlocks.value.length - 1;
    initMonacoEditor(index, '');
  });
};

const addTestBlock = () => {
  lessonBlocks.value.push({
    type: 'test',
    title: '',
    questions: []
  });
};

const removeBlock = (index) => {
  if (lessonBlocks.value[index].type === 'code' && editors[index]) {
    editors[index].dispose();
    delete editors[index];
  }
  lessonBlocks.value.splice(index, 1);
};

const toggleVisibility = () => {
  visibility.value = !visibility.value;
};

const saveLesson = () => {
  // Update content from editors before saving
  lessonBlocks.value.forEach((block, index) => {
    if (block.type === 'code' && editors[index]) {
      block.content = editors[index].getValue();
    }
  });
  const lectureId = route.query.id;
  const method = lectureId ? 'patch' : 'post';
  const url = lectureId ? `/api/lectures?id=${lectureId}` : '/api/lectures';
  console.log(url);
  axios[method](url, { 
    course: course.value, 
    blocks: lessonBlocks.value, 
    title: lectureTitle.value,
    visibility: visibility.value,
    token: userData.value.token 
  })
    .then(() => {
      navigateTo('/course');
    })
    .catch(error => {
      console.error('Error saving lecture:', error);
      alert('Failed to save lecture. Please try again.');
    });
};

const openModal = (block, index) => {
  currentTestBlock.value = { ...block, index };
  isModalVisible.value = true;
};

const saveBlockChanges = (updatedBlock) => {
  lessonBlocks.value[currentTestBlock.value.index] = {...updatedBlock, type: 'test'};
  closeModal();
};

const closeModal = () => {
  isModalVisible.value = false;
  currentTestBlock.value = null;
};

const toggleInputField = () => {
  showInputField.value = !showInputField.value;
};

const initMonacoEditor = (index, content) => {
  const container = document.getElementById(`monaco-editor-${index}`);
  if (!container) return;

  if (editors[index]) {
    editors[index].dispose();
  }

  editors[index] = monaco.editor.create(container, {
    value: content,
    language: 'html',
    theme: 'vs',
    minimap: { enabled: false },
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    cursorStyle: 'line'
  });
};

// Load lecture data if ID is present
onMounted(async () => {
  const lectureId = route.query.id;
  if (lectureId) {
    try {
      const response = await axios.get(`/api/lectures?id=${lectureId}`);
      const lecture = response.data;
      // Set the course and title
      course.value = lecture.courseId;
      lectureTitle.value = lecture.title;
      visibility.value = lecture.visible.data[0]; // Set visibility, default to true if not set
      
      // Set the blocks and trim text content
      lessonBlocks.value = lecture.blocks.map(block => {
        if (block.type === 'text') {
          return {
            ...block,
            content: block.content.trim()
          };
        }
        return block;
      });

      // Initialize Monaco editors for code blocks
      nextTick(() => {
        lessonBlocks.value.forEach((block, index) => {
          if (block.type === 'code') {
            initMonacoEditor(index, block.content);
          }
        });
      });
    } catch (error) {
      console.error('Error loading lecture:', error);
      // Handle error appropriately
    }
  }
});

// Clean up editors when component is unmounted
onUnmounted(() => {
  Object.values(editors).forEach(editor => editor.dispose());
});
</script>

<style scoped>
.lesson-editor {
  padding: 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.action-bar button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
}

.action-bar button:hover {
  background-color: #0056b3;
}

.editor-container {
  max-width: 800px;
  margin: auto;
}

.blocks {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.block {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  position: relative;
  width: 100%;
}

.block textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.test-block {
  background-color: #e9f7ff;
  border-left: 8px solid #007bff;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.test-block-label {
  font-weight: bold;
  color: #007bff;
  font-size: 18px;
  margin-bottom: 10px;
}

.test-block p {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.block-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.filter-input {
  background-color: white;
  color: #333;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
}

.ai-generation-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 15px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ai-generation-btn:hover {
  background-color: #0056b3;
}

.ai-input-container {
  position: fixed;
  bottom: 70px;
  right: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 250px;
}

.ai-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.code-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monaco-container {
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.visibility-on {
  background-color: #28a745 !important;
  color: white;
}

.visibility-on:hover {
  background-color: #218838 !important;
}

.visibility-off {
  background-color: #dc3545 !important;
  color: white;
}

.visibility-off:hover {
  background-color: #c82333 !important;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
