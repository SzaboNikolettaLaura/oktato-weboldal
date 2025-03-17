<template>
    <div class="test-block">
      <span class="test-block-label">Teszt Blokk</span>
      <p>{{ testBlock.description }}</p>
  
      <!-- Question Type Selection -->
      <select v-model="testBlock.questionType" class="filter-input">
        <option value="multipleChoice">Több válasz lehetőség</option>
        <option value="singleChoice">Egy válasz lehetőség</option>
        <option value="description">Leírás</option>
        <option value="completion">Kiegészítő kérdés</option>
      </select>
  
      <!-- Description Field -->
      <textarea v-model="testBlock.description" placeholder="Add leírás" rows="3"></textarea>
  
      <!-- Multiple Choice Options -->
      <div v-if="testBlock.questionType === 'multipleChoice'">
        <div v-for="(option, idx) in testBlock.options" :key="idx">
          <input v-model="testBlock.options[idx]" class="filter-input" placeholder="Válasz opció">
          <button @click="removeOption(idx)" class="btn btn-danger">Törlés</button>
        </div>
        <button @click="addOption" class="btn btn-primary">Új Opció Hozzáadása</button>
      </div>
  
      <!-- Single Choice Options -->
      <div v-if="testBlock.questionType === 'singleChoice'">
        <div v-for="(option, idx) in testBlock.options" :key="idx">
          <input v-model="testBlock.options[idx]" class="filter-input" placeholder="Válasz opció">
          <button @click="removeOption(idx)" class="btn btn-danger">Törlés</button>
        </div>
      </div>
  
      <!-- Completion Question -->
      <div v-if="testBlock.questionType === 'completion'">
        <div v-for="(completion, idx) in testBlock.completionItems" :key="idx">
          <input v-model="testBlock.completionItems[idx]" class="filter-input" placeholder="Kiegészítő kérdés elem">
          <button @click="removeCompletion(idx)" class="btn btn-danger">Törlés</button>
        </div>
        <button @click="addCompletion" class="btn btn-primary">Új Elem Hozzáadása</button>
      </div>
  
      <div class="block-buttons">
        <button @click="deleteBlock" class="btn btn-danger">Törlés</button>
        <button @click="saveBlock" class="btn btn-primary">Mentés</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    testBlock: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['updateTestBlock', 'deleteTestBlock']);
  
  const addOption = () => {
    props.testBlock.options.push('');
  };
  
  const removeOption = (idx) => {
    props.testBlock.options.splice(idx, 1);
  };
  
  const addCompletion = () => {
    props.testBlock.completionItems.push('');
  };
  
  const removeCompletion = (idx) => {
    props.testBlock.completionItems.splice(idx, 1);
  };
  
  const deleteBlock = () => {
    emit('deleteTestBlock', props.testBlock);
  };
  
  const saveBlock = () => {
    emit('updateTestBlock', props.testBlock);
  };
  </script>
  
  <style scoped>
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
  
  .filter-input {
    padding: 8px;
    font-size: 14px;
    background-color: white;
    border-radius: 8px;
    min-width: 150px;
  }
  
  .block-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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
  </style>
  