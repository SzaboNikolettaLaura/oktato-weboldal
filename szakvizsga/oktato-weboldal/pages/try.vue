<template>
  <div class="app-container">
    <Nav />

    <!-- Floating Chat Button -->
    <div class="chat-button" @click="toggleChat">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>

    <!-- Chat Modal -->
    <div v-if="isChatOpen" class="chat-modal">
      <div class="chat-header">
        <h3>AI Asszisztens</h3>
        <button @click="toggleChat" class="chat-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="chat-messages" ref="chatMessagesRef">
        <div v-for="(message, index) in chatMessages" :key="index" :class="['message', message.role]">
          <div class="message-content" v-html="message.content"></div>
        </div>
        <div v-if="isLoading" class="message assistant">
          <div class="message-content typing">AI válaszol...</div>
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="currentMessage" 
          @keypress.enter="sendMessage"
          placeholder="Kérdezz a kódolásról, HTML-ről..."
          class="chat-input-field"
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading || !currentMessage.trim()" class="chat-send">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
        </button>
      </div>
    </div>

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
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useTryCode } from '~/composables/useTryCode';
import useUserData from '~/composables/useUserData';

const { userData } = useUserData();
const route = useRoute();
const iframeSrc = ref('');
const editor = ref('');
const { tryCode } = useTryCode();

// Chat related refs
const isChatOpen = ref(false);
const chatMessages = ref([]);
const currentMessage = ref('');
const isLoading = ref(false);
const chatMessagesRef = ref(null);

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

// Chat functions
function toggleChat() {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value && chatMessages.value.length === 0) {
    chatMessages.value.push({
      role: 'assistant',
      content: `Szia! Én vagyok az AI asszisztensed a kódolásban. Segíthetek HTML, CSS, JavaScript kérdésekben és hibakeresésben.<br><br><strong>💡 Tippek:</strong><br>• Kérdezz a kódodról<br>• Kérj segítséget hibák javításához<br>• Magyarázatot HTML elemekhez<br>• Ötleteket projektekhez<br><br>Miben segíthetek?`
    });
  }
}

async function sendMessage() {
  if (!currentMessage.value.trim() || isLoading.value) return;

  const userMessage = currentMessage.value.trim();
  chatMessages.value.push({
    role: 'user',
    content: userMessage
  });

  currentMessage.value = '';
  isLoading.value = true;

  try {
    // Include current code as context
    const codeContext = {
      currentCode: editor.value,
      page: 'code_editor'
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        context: codeContext,
        action: 'code_help',
        token: userData.value.token
      }),
    });

    if (response.ok) {
      const data = await response.json();
      chatMessages.value.push({
        role: 'assistant',
        content: data.response
      });
    } else {
      chatMessages.value.push({
        role: 'assistant',
        content: 'Sajnálom, hiba történt. Kérlek, próbáld újra.'
      });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    chatMessages.value.push({
      role: 'assistant',
      content: 'Sajnálom, hiba történt. Kérlek, próbáld újra.'
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
}
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

/* Chat Button Styles */
.chat-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  background-color: #BE3144;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(190, 49, 68, 0.3);
  transition: all 0.3s ease;
  z-index: 40;
}

.chat-button:hover {
  background-color: #872341;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(190, 49, 68, 0.4);
}

/* Chat Modal Styles */
.chat-modal {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 400px;
  height: 500px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 45;
  overflow: hidden;
}

.chat-header {
  background-color: #BE3144;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.chat-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.chat-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  margin-bottom: 8px;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
}

.message.user .message-content {
  background-color: #BE3144;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background-color: #f1f5f9;
  color: #2d3748;
  border-bottom-left-radius: 4px;
}

.typing {
  font-style: italic;
  color: #64748b !important;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input-field:focus {
  border-color: #BE3144;
}

.chat-input-field:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
}

.chat-send {
  width: 40px !important;
  height: 40px !important;
  background-color: #BE3144 !important;
  color: white;
  border: none;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 !important;
  font-size: 14px !important;
}

.chat-send:hover:not(:disabled) {
  background-color: #872341 !important;
  transform: scale(1.05);
}

.chat-send:disabled {
  background-color: #94a3b8 !important;
  cursor: not-allowed;
  transform: none;
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

  /* Mobile chat styles */
  .chat-button {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
  }

  .chat-modal {
    bottom: 90px;
    right: 20px;
    left: 20px;
    width: auto;
    height: 400px;
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

  .chat-modal {
    bottom: 90px;
    right: 16px;
    left: 16px;
    height: 350px;
  }

  .chat-button {
    bottom: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
  }
}
</style>
