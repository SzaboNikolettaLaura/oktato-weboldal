<template>
  <div class="lesson-editor">
    <Nav />
    <div class="action-bar">
      <div>
        <span>Kurzus: </span>
        <select v-model="course" class="filter-input">
          <option value="" selected="selected">Kurzus</option>
        </select>
      </div>
      <div>
        <span>Cím: </span>
        <input type="text" v-model="lectureTitle" class="filter-input">
      </div>
      <button @click="addTextBlock" class="action-btn">Szöveg+</button>
      <button @click="addCodeBlock" class="action-btn">Kód+</button>
      <button @click="addTestBlock" class="action-btn">Teszt+</button>
      <button @click="toggleVisibility" class="action-btn">Láthatóság</button>
      <button @click="saveLesson" class="action-btn">Mentés</button>
    </div>

    <div class="editor-container">
      <div class="controls"></div>
      <div class="blocks">
        <div v-for="(block, index) in lessonBlocks" :key="index" class="block">
          <div v-if="block.type === 'text'">
            <textarea v-model="block.content" placeholder="Írd ide a magyarázatot..." />
          </div>
          <div v-else-if="block.type === 'code'">
            <input class="p-4 w-full" type="text" v-model="block.description" placeholder="Kód leírása">
            <pre contenteditable="true" @input="updateCode(index, $event)"></pre>
          </div>
          <div v-else-if="block.type === 'test'" class="test-block">
            <span class="test-block-label">Teszt Blokk</span>
            <p>{{ block.description }}</p>
            <div class="block-buttons">
              <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
              <button @click="openModal(block, index)" class="btn btn-primary">Módosítás</button> <!-- Modified Button -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <TestBlockEditor
      v-if="isModalVisible"
      :block="currentTestBlock"
      @save="saveBlockChanges"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Nav from '@/components/Nav.vue';
import axios from 'axios';
import TestBlockEditor from '@/components/TestBlockEditor.vue';

const { userData } = useUserData();
const { courseData } = await useCourses();
const lessonBlocks = ref([]);
const visibility = ref(true);
const course = ref(courseData.value[0].id);
const lectureTitle = ref('');
const isModalVisible = ref(false);
const currentTestBlock = ref(null);

const addTextBlock = () => {
  lessonBlocks.value.push({ type: 'text', content: '' });
};

const addCodeBlock = () => {
  lessonBlocks.value.push({ type: 'code', content: '', description: '' });
};

const addTestBlock = () => {
  lessonBlocks.value.push({
    type: 'test',
    description: '',
    questionType: 'multipleChoice',
    options: [''],
    completionItems: [''],
  });
};

const removeBlock = (index) => {
  lessonBlocks.value.splice(index, 1);
};

const updateCode = (index, event) => {
  lessonBlocks.value[index].content = event.target.innerText;
};

const toggleVisibility = () => {
  visibility.value = !visibility.value;
};

const saveLesson = () => {
  axios.post('/api/lectures', { course: course.value, blocks: lessonBlocks.value, title: lectureTitle.value })
    .then(() => {
      navigateTo('/course');
    });
};

const openModal = (block, index) => {
  currentTestBlock.value = { ...block, index }; // Store the block to edit
  isModalVisible.value = true; // Show the modal
};

const saveBlockChanges = (updatedBlock) => {
  lessonBlocks.value[currentTestBlock.value.index] = updatedBlock; // Update the lesson block
  closeModal(); // Close the modal
};

const closeModal = () => {
  isModalVisible.value = false; // Hide the modal
  currentTestBlock.value = null; // Clear the current block
};
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
</style>
