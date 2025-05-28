<template>
  <div class="app-container">
    <Nav />
    <div class="container">
      <div class="header">
        <button @click="runCode">Run</button>
      </div>
    
      <div class="columns">
        <MonacoEditor class="code-column flex-1 h-full"
          :options="{ minimap: { enabled: false }, automaticLayout: true }" 
          v-model="editor" 
          lang="html" 
        />
    
        <div class="preview-column flex-1 h-full">
          <iframe v-if="iframeSrc" :srcdoc="iframeSrc" frameborder="0" width="100%" height="100%"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTryCode } from '~/composables/useTryCode';

const route = useRoute();
const iframeSrc = ref('');
const editor = ref('');
const { tryCode } = useTryCode();

// Load content when component mounts
onMounted(() => {
  if (tryCode.value) {
    editor.value = tryCode.value;
    tryCode.value = '';
  }
});

// Function to run the code
const runCode = () => {
  try {
    const htmlCode = editor.value;
    if (htmlCode.trim() === '') {
      alert('Please write some HTML code before running.');
      return;
    }
    iframeSrc.value = htmlCode;
  } catch (error) {
    console.error('Error running code:', error);
    alert('An error occurred while running the code.');
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 100%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #218838;
}

.columns {
  display: flex;
  flex: 1;
  justify-content: space-between;
  height: 100%;
  gap: 20px;
}

.code-column {
  flex: 1;
  border-radius: 10px;
  background-color: #f1f1f1;
  padding: 10px;
}

.preview-column {
  flex: 1;
  border-radius: 10px;
  background-color: #f1f1f1;
  overflow: hidden;
  border: 1px solid #ddd;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .columns {
    flex-direction: column;
    gap: 10px;
  }

  .code-column, .preview-column {
    flex: 1 1 0%;
  }

  .container {
    padding: 10px;
  }

  button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .header {
    justify-content: center;
  }

  button {
    width: 100%;
    font-size: 14px;
  }
}
</style>
