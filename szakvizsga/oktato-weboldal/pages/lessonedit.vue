<template>
  <div class="lesson-editor">
    <Nav />
    <div class="action-bar" :class="{ pinned: isPinned }" :style="{ top: isPinned && !isNavbarVisible ? '0' : isPinned ? `${navbarHeight}px` : '0', marginTop: isNavbarVisible && !isPinned ? '15px' : '0' }">
      <div class="action-bar-left">
        <button class="pin-button" @click="togglePin">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="isPinned" d="M12 2l-4 4h8l-4-4z"></path>
            <path v-if="!isPinned" d="M12 2l-4 4h8l-4-4z" fill="currentColor"></path>
          </svg>
          {{ isPinned ? 'Unpin' : 'Pin' }}
        </button>
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
      </div>
      <div class="action-bar-right">
        <button @click="addTextBlock" class="action-btn">Szöveg+</button>
        <button @click="addCodeBlock" class="action-btn">Kód+</button>
        <button @click="addHighlightBlock" class="action-btn">Kiemelés+</button>
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
    </div>

    <div class="editor-container">
      <div class="controls"></div>
      <draggable 
        v-model="lessonBlocks" 
        class="blocks"
        item-key="id"
        handle=".block-header"
        :animation="150"
        ghost-class="ghost"
        drag-class="drag"
        direction="vertical"
        @start="dragStart"
        @end="dragEnd"
      >
        <template #item="{ element: block, index }">
          <div class="block">
            <div v-if="block.type === 'text'">
              <div class="block-header">
                <span class="block-label">Szöveg Blokk</span>
                <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
              </div>
              <textarea v-model="block.content" placeholder="Írd ide a magyarázatot..." class="block-textarea" />
            </div>
            <div v-else-if="block.type === 'code'" class="code-block">
              <div class="block-header">
                <span class="block-label">Kód Blokk</span>
                <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
              </div>
              <input class="p-4 w-full" type="text" v-model="block.description" placeholder="Kód leírása">
              <div :id="`monaco-editor-${index}`" class="monaco-container"></div>
            </div>
            <div v-else-if="block.type === 'highlight'" class="highlight-block">
              <div class="block-header">
                <span class="block-label">Kiemelés Blokk</span>
                <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
              </div>
              <textarea v-model="block.content" placeholder="Írd ide a kiemelendő fontos információt..." class="highlight-textarea" />
            </div>
            <div v-else-if="block.type === 'test'" class="test-block">
              <div class="block-header">
                <span class="block-label">Teszt Blokk</span>
                <div class="block-buttons">
                  <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
                  <button @click="openModal(block, index)" class="btn btn-primary">Módosítás</button>
                </div>
              </div>
              <p>{{ block.title }}</p>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <button @click="toggleInputField" class="ai-generation-btn">AI</button>

    <div v-if="showInputField" class="ai-input-container">
      <input type="text" v-model="aiInput" class="ai-input" placeholder="Írd be a kérésed..." @input="autoExpandInput">
      <button @click="generateAIContent" class="generate-btn" :disabled="isGenerating">
        <span v-if="!isGenerating">Generálás</span>
        <span v-else class="loading">
          <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generálás...
        </span>
      </button>
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
import draggable from 'vuedraggable';

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
const isGenerating = ref(false);
const isPinned = ref(false);
const lastScrollY = ref(0);
const navbarHeight = ref(60);
const isNavbarVisible = ref(true);

const autoExpandInput = (event) => {
  event.target.style.height = 'auto';
  event.target.style.height = event.target.scrollHeight + 'px';
};

const dragStart = () => {
  // Clean up editors before drag
  Object.values(editors).forEach(editor => editor.dispose());
  
  // Start auto-scroll interval
  window.dragScrollInterval = setInterval(() => {
    const scrollSpeed = 10; // pixels per frame
    const scrollThreshold = 100; // pixels from edge to start scrolling
    
    const mouseY = window.event.clientY;
    const windowHeight = window.innerHeight;
    
    if (mouseY < scrollThreshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (mouseY > windowHeight - scrollThreshold) {
      window.scrollBy(0, scrollSpeed);
    }
  }, 16); // ~60fps
};

const dragEnd = () => {
  // Clear auto-scroll interval
  if (window.dragScrollInterval) {
    clearInterval(window.dragScrollInterval);
    window.dragScrollInterval = null;
  }
  
  // Reinitialize editors after drag
  nextTick(() => {
    lessonBlocks.value.forEach((block, index) => {
      if (block.type === 'code') {
        initMonacoEditor(index, block.content);
      }
    });
  });
};

const addTextBlock = () => {
  lessonBlocks.value.push({ 
    type: 'text', 
    content: '',
    id: Date.now() + Math.random()
  });
};

const addCodeBlock = () => {
  lessonBlocks.value.push({ 
    type: 'code', 
    content: '', 
    description: '',
    id: Date.now() + Math.random()
  });
  nextTick(() => {
    const index = lessonBlocks.value.length - 1;
    initMonacoEditor(index, '');
  });
};

const addHighlightBlock = () => {
  lessonBlocks.value.push({ 
    type: 'highlight', 
    content: '',
    id: Date.now() + Math.random()
  });
};

const addTestBlock = () => {
  lessonBlocks.value.push({
    type: 'test',
    title: '',
    questions: [],
    id: Date.now() + Math.random()
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

const generateAIContent = async () => {
  if (!aiInput.value) return;
  
  isGenerating.value = true;
  try {
    const response = await axios.post('/api/gemini', {
      prompt: aiInput.value + ' Magyarul válaszolj és kommentezd a kódot. Ha kódot generálsz, használd a ```html jelölést. A kód előtt használd a [KÓD LEÍRÁS] jelölést, és írd le röviden (max 5-6 szó) magyarul, hogy mit csinál a kód. A kód mindig legyen minimális, csak a szükséges elemeket tartalmazza. Ne használj markdown formázást (**), csak sima szöveget. Ne használj bevezető mondatokat vagy felesleges magyarázatokat, csak a tényleges leckét és kódot add meg.'
    });
    
    const content = response.data;
    
    // Parse content to separate text and code
    const parts = content.split('```html');
    
    // Extract description using the [KÓD LEÍRÁS] delimiter
    const descriptionMatch = parts[0].match(/\[KÓD LEÍRÁS\](.*?)(?=\n|$)/s);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // Remove description from text content
    let textContent = parts[0].trim();
    if (descriptionMatch) {
      textContent = textContent.replace(/\[KÓD LEÍRÁS\].*?(?=\n|$)/s, '').trim();
    }
    
    // Add text part if exists
    if (textContent) {
      if (!lessonBlocks.value.some(block => block.type === 'text')) {
        addTextBlock();
      }
      const lastTextBlockIndex = [...lessonBlocks.value].reverse().findIndex(block => block.type === 'text');
      const textIndex = lessonBlocks.value.length - 1 - lastTextBlockIndex;
      lessonBlocks.value[textIndex].content = textContent;
    }
    
    // Add code part if exists
    if (parts.length > 1) {
      const codeContent = parts[1].split('```')[0].trim();
      if (!lessonBlocks.value.some(block => block.type === 'code')) {
        addCodeBlock();
      }
      const lastCodeBlockIndex = [...lessonBlocks.value].reverse().findIndex(block => block.type === 'code');
      const codeIndex = lessonBlocks.value.length - 1 - lastCodeBlockIndex;
      
      // Set the description in the code block
      lessonBlocks.value[codeIndex].description = description;
      
      nextTick(() => {
        initMonacoEditor(codeIndex, codeContent);
      });
    }
    
    showInputField.value = false;
    aiInput.value = '';
  } catch (error) {
    console.error('Error generating AI content:', error);
    alert('Nem sikerült generálni a tartalmat. Kérlek próbáld újra.');
  } finally {
    isGenerating.value = false;
  }
};

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  isNavbarVisible.value = currentScrollY < navbarHeight.value;
  lastScrollY.value = currentScrollY;
};

const togglePin = () => {
  isPinned.value = !isPinned.value;
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
  window.addEventListener('scroll', handleScroll);
});

// Clean up editors when component is unmounted
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  Object.values(editors).forEach(editor => editor.dispose());
});
</script>

<style scoped>
.lesson-editor {
  padding: 0;
  background-color: white;
  min-height: 100vh;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: static;
  width: 100%;
  z-index: 90;
  transition: all 0.3s ease;
}

.action-bar.pinned {
  position: fixed;
  width: 100%;
  left: 0;
  right: 0;
  top: 60px;
  z-index: 90;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-bar-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pin-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pin-button:hover {
  color: #333;
}

.action-bar button {
  padding: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
  white-space: nowrap;
}

.editor-container {
  max-width: 800px;
  margin: auto;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.blocks {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  min-height: 50px;
}

.block {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  position: relative;
  width: 100%;
  background: white;
  transition: box-shadow 0.2s ease;
}

.block:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.block textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
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
  padding: 12px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ai-generation-btn:hover {
  background-color: #0056b3;
}

.ai-input-container {
  position: fixed;
  bottom: 70px;
  right: 20px;
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 300px;
  z-index: 1000;
}

.ai-input {
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
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
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.generate-btn:disabled {
  background-color: #0056b3;
  cursor: not-allowed;
}

.generate-btn:hover:not(:disabled) {
  background-color: #0056b3;
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

.code-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monaco-container {
  height: 250px;
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

.highlight-block {
  background-color: #fff3cd;
  border-left: 8px solid #ffc107;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.highlight-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ffc107;
  border-radius: 4px;
  resize: vertical;
  background-color: transparent;
  font-size: 16px;
  color: #856404;
}

.block-header {
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px;
  background: #f8f9fa;
  border-radius: 4px;
  user-select: none;
}

.block-header:active {
  cursor: grabbing;
}

.block-label {
  font-weight: bold;
  color: #666;
  font-size: 14px;
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

@media (max-width: 768px) {
  .action-bar-left {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .action-bar-right {
    width: 100%;
    justify-content: center;
  }

  .action-bar {
    position: static;
  }

  .action-bar.pinned {
    top: 50px;
  }

  .editor-container {
    margin-top: 20px;
  }

  .block-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .block-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .monaco-container {
    height: 200px;
  }
}
</style>
