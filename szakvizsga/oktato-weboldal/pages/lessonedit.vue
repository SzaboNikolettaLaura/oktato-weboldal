<template>
    <div class="lesson-editor">
      <Nav />
      <div class="action-bar">
        <div>
            <span>Kurzus: </span>
            <select v-model="course" class="filter-input">
                <option value="" selected="selected">Kurzus</option>
                <option v-for="c in courseData" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
        </div>
        <div>
            <span>Cim: </span>
            <input type="text" v-model="lectureTitle" class="filter-input">
        </div>
        <button @click="addTextBlock">Szöveg+</button>
        <button @click="addCodeBlock">Kód+</button>
        <button @click="toggleVisibility">Láthatóság</button>
        <button @click="saveLesson">Mentés</button>
      </div>
      <div class="editor-container">
        <div class="controls">
          <!-- Additional controls can be added here -->
        </div>
        <div class="blocks">
          <div v-for="(block, index) in lessonBlocks" :key="index" class="block">
            <textarea v-if="block.type === 'text'" v-model="block.content" placeholder="Írd ide a magyarázatot..." />
            <div v-else-if="block.type === 'code'">
                <input class="p-4 w-full" type="text" v-model="block.description" placeholder="Kod leirasa">
                <pre contenteditable="true" @input="updateCode(index, $event)"></pre>
            </div>
            <button class="delete-btn" @click="removeBlock(index)">Törlés</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Nav from '@/components/Nav.vue';
import axios from 'axios';
  
  const {courseData} = await useCourses();
  const lessonBlocks = ref([]);
  const visibility = ref(true);
  const course = ref(courseData.value[0].id);
  const lectureTitle = ref('');
  
  const addTextBlock = () => {
    lessonBlocks.value.push({ type: 'text', content: '' });
  };
  
  const addCodeBlock = () => {
    lessonBlocks.value.push({ type: 'code', content: '', description: '' });
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
    axios.post('/api/lectures', {course: course.value, blocks: lessonBlocks.value, title: lectureTitle.value}).then(() => {
        navigateTo('/course');
    })
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
  }
  
  .action-bar button:hover {
    background-color: #0056b3;
  }
  
  .editor-container {
    max-width: 800px;
    margin: auto;
  }
  
  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
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
  
  textarea {
    width: 100%;
    min-height: 80px;
    padding: 5px;
  }
  
  pre {
    background: #f5f5f5;
    padding: 10px;
    white-space: pre-wrap;
    min-height: 80px;
  }
  
  .delete-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    padding: 5px;
    cursor: pointer;
  }
  .filter-input {
    padding: 8px;
    font-size: 14px;
    background-color: white;
    border-radius: 8px;
    min-width: 150px;
  }
  
  </style>
  