<template>
  <div>
    <Nav />

    <!-- Mobile hamburger menu button -->
    <div class="mobile-menu-btn" :class="{'sidebar-open': !sidebarHidden}" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline :points="sidebarHidden ? '9,18 15,12 9,6' : '15,18 9,12 15,6'"></polyline>
      </svg>
    </div>

    <!-- Mobile overlay -->
    <div v-if="!sidebarHidden" class="mobile-overlay" @click="toggleSidebar"></div>

    <!-- Text Selection Context Menu -->
    <div v-if="showContextMenu" class="context-menu" :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }">
      <button @click="explainSelectedText" class="context-menu-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Magyarázat
      </button>
      <button @click="generateSimilarTest" class="context-menu-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        Hasonló teszt
      </button>
    </div>

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
          placeholder="Kérdezz bármit a kurzusról..."
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

    <div class="container relative w-full" style="max-width:unset;" @mouseup="handleTextSelection">
      <div class="sidebar" :class="{'closed': sidebarHidden}">
        <!-- Mobile close button -->
        <div class="mobile-close-btn" @click="toggleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <div class="flex flex-row justify-between items-center mb-8">
          <h2 class="sidebar-title">Courses</h2>
          <div @click="router.push('/lessonedit')" v-if="userData.role === 'tanar'" class="add-lesson-btn"><span>+</span></div>
        </div>
        <div class="sidebar-content">
          <ol class="space-y-2" style="list-style-type: none;">
            <li :class="{
                'text-[#1f5f5f]': lastUnlocked > courseIndex,
                'bg-gray-200': selectedCourse?.title === course.title
            }" class="cursor-pointer course-item" style="list-style-type: none;" v-for="(course, courseIndex) in courses" :key="courseIndex" @click="lastUnlocked >= courseIndex ? selectCourse(courseIndex, 0) : () => {}">
              <div class="flex justify-between items-center">
                <span class="course-title">{{ course.title }}</span>
                <button 
                  v-if="userData.role === 'tanar'"
                  @click.stop="toggleCourseVisibility(course)"
                  :class="[
                    'visibility-btn',
                    course.visible ? 'visibility-on' : 'visibility-off'
                  ]"
                >
                  <svg v-if="course.visible.data[0]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                </button>
              </div>
              <ol v-if="course.lectures.length > 1" class="space-y-2 lecture-list" style="list-style-type: none;">
                <li class="cursor-pointer lecture-item" style="list-style-type: none;" v-for="(lecture, lectureIndex) in course.lectures" :key="lectureIndex">
                    {{ lecture.title }}
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </div>

      <div class="main" :class="{'sidebar-open': !sidebarHidden}">
        <div class="flex items-center gap-1 flex-wrap">
          <h1 class="main-title">{{ selectedCourse?.title }}</h1>
          <button 
            v-if="userData.role === 'tanar'"
            @click="router.push(`/lessonedit?id=${selectedCourse?.lectures[0]?.id}`)"
            class="edit-btn"
            title="Edit course"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div v-for="(lecture, lectureIndex) in selectedCourse?.lectures" :key="lectureIndex">
          <h2 class="lecture-title">{{ lecture.title }}</h2>
          <div v-for="(block, blockIndex) in lecture.blocks" :key="blockIndex">
            <div v-if="block.type === 'text'">
              <div v-if="block.editorType === 'markdown'" v-html="renderMarkdown(block.content)"></div>
              <div v-else class="plain-text">{{ block.content }}</div>
            </div>
            <div v-else-if="block.type === 'code'" class="exercise-box">
              <h3 class="exercise-title">{{ block.description }}</h3>
              <button 
                @click="() => { tryCode = block.content; router.push('/try'); }"
                class="try-btn"
              >
                Try it!
              </button>
            </div>
            <div v-else-if="block.type === 'test'" class="test-box">
              <h3 class="test-title">{{ block.title }}</h3>
              <p class="test-description">{{ block.questions.length }} kérdés</p>
              <div class="test-preview">
                <p class="preview-text">Kattintson a gombra a teszt megkezdéséhez</p>
              </div>
              <button 
                @click="router.push(`/test/${lecture.id}`)"
                class="take-test-btn"
              >
                {{ userData.role === 'tanar' ? 'Teszt előnézet' : 'Teszt megkezdése' }}
              </button>
            </div>
            <div v-else-if="block.type === 'highlight'" class="highlight-box">
              <div v-html="renderMarkdown(block.content)"></div>
            </div>
            <div v-else-if="block.type === 'table'" class="table-box">
              <div class="table-wrapper">
                <table class="lesson-table">
                  <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex" :class="{ 'header-row': block.hasHeader && rowIndex === 0 }">
                    <td v-for="(cell, colIndex) in row" :key="colIndex" :class="{ 'header-cell': block.hasHeader && rowIndex === 0 }">
                      {{ cell }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isDialogOpen" class="dialog-overlay">
      <div class="dialog-content">
        <h3 class="dialog-title">Create New Course</h3>
        <form @submit.prevent="submitCourse">
          <div class="form-group">
            <label for="courseTitle" class="form-label">Course Title:</label>
            <input 
              type="text" 
              id="courseTitle" 
              v-model="courseTitle" 
              required 
              class="form-input"
            />
          </div>
          <div class="dialog-actions">
            <button 
              type="button" 
              @click="closeDialog" 
              class="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn-submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';

const { userData } = useUserData();
const { courseData: courses } = await useCourses(userData.value.token);
const router = useRouter();
const { tryCode } = useTryCode();

const lastUnlocked = 2;
const selectedCourse = ref(null);
const sidebarHidden = ref(window.innerWidth <= 768); // Hide sidebar by default on mobile
const courseTitle = ref('');

// Chat related refs
const isChatOpen = ref(false);
const chatMessages = ref([]);
const currentMessage = ref('');
const isLoading = ref(false);
const chatMessagesRef = ref(null);

// Text selection refs
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const selectedText = ref('');
const selectionContext = ref('');

function renderMarkdown(content) {
  return marked(content);
}

// Select first course on page load
onMounted(() => {
  if (courses.value && courses.value.length > 0) {
    selectCourse(0, 0);
  }
  
  // Hide context menu when clicking elsewhere
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.context-menu')) {
      showContextMenu.value = false;
    }
  });
});

function selectCourse(courseIndex, lectureIndex) {
  selectedCourse.value = courses.value[courseIndex];
  // Close sidebar on mobile after selecting a course
  if (window.innerWidth <= 768) {
    sidebarHidden.value = true;
  }
}

function toggleSidebar() {
  sidebarHidden.value = !sidebarHidden.value;
}

const isDialogOpen = ref(false);

// Open the dialog
function openDialog() {
  isDialogOpen.value = true;
}

// Close the dialog
function closeDialog() {
  isDialogOpen.value = false;
  courseTitle.value = ''; // Reset course title input
}

async function submitCourse() {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: courseTitle.value, token: userData.value.token }),
    });

    if (response.ok) {
      // Successfully created the course, you can handle success here
      alert('Course created successfully!');
      closeDialog(); // Close the dialog after submission
    } else {
      // Handle error here (e.g., invalid title or server issue)
      alert('Failed to create course.');
    }
  } catch (error) {
    console.error('Error creating course:', error);
    alert('An error occurred while creating the course.');
  }
}

async function toggleCourseVisibility(course) {
  try {
    const response = await fetch(`/api/courses?id=${course.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        visible: !course.visible,
        token: userData.value.token 
      }),
    });

    if (response.ok) {
      // Update the course visibility in the local state
      course.visible = !course.visible;
    } else {
      alert('Failed to update course visibility.');
    }
  } catch (error) {
    console.error('Error toggling course visibility:', error);
    alert('An error occurred while updating course visibility.');
  }
}

// Chat functions
function toggleChat() {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value && chatMessages.value.length === 0) {
    chatMessages.value.push({
      role: 'assistant',
      content: `Szia! Én vagyok az AI asszisztensed. Segíthetek a kurzus tartalmával kapcsolatos kérdésekben.<br><br><strong>💡 Új funkció:</strong> Jelölj ki bármilyen szöveget az oldalon, és megjelenik egy menü két opcióval:<br>• <strong>Magyarázat</strong> - Részletes magyarázatot kapsz a kijelölt szövegről<br>• <strong>Hasonló teszt</strong> - Generálok hasonló teszt kérdéseket<br><br>Miben segíthetek?`
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
    const courseContext = selectedCourse.value ? {
      title: selectedCourse.value.title,
      lectures: selectedCourse.value.lectures.map(lecture => ({
        title: lecture.title,
        content: lecture.blocks.map(block => {
          if (block.type === 'text') return block.content;
          if (block.type === 'code') return `Code exercise: ${block.description}`;
          if (block.type === 'test') return `Test: ${block.title}`;
          if (block.type === 'highlight') return block.content;
          return '';
        }).join(' ')
      }))
    } : null;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        context: courseContext,
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

// Text selection functions
function handleTextSelection(event) {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    selectedText.value = text;
    
    // Get context around the selection
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    let contextElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    
    // Try to get more context from parent elements
    while (contextElement && contextElement.textContent.length < 200) {
      if (contextElement.parentElement) {
        contextElement = contextElement.parentElement;
      } else {
        break;
      }
    }
    
    selectionContext.value = contextElement ? contextElement.textContent.trim() : text;
    
    // Position the context menu
    contextMenuPosition.value = {
      x: Math.min(event.clientX + 10, window.innerWidth - 200),
      y: Math.min(event.clientY + 10, window.innerHeight - 100)
    };
    
    showContextMenu.value = true;
  } else {
    showContextMenu.value = false;
  }
}

async function explainSelectedText() {
  if (!selectedText.value) return;
  
  showContextMenu.value = false;
  
  // Open chat if not already open
  if (!isChatOpen.value) {
    toggleChat();
  }
  
  // Add user message
  chatMessages.value.push({
    role: 'user',
    content: `Magyarázd el: "${selectedText.value}"`
  });
  
  isLoading.value = true;
  
  try {
    const courseContext = selectedCourse.value ? {
      title: selectedCourse.value.title,
      lectures: selectedCourse.value.lectures.map(lecture => ({
        title: lecture.title,
        content: lecture.blocks.map(block => {
          if (block.type === 'text') return block.content;
          if (block.type === 'code') return `Code exercise: ${block.description}`;
          if (block.type === 'test') return `Test: ${block.title}`;
          if (block.type === 'highlight') return block.content;
          return '';
        }).join(' ')
      }))
    } : null;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: selectedText.value,
        context: courseContext,
        selectionContext: selectionContext.value,
        action: 'explain',
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
    console.error('Error explaining text:', error);
    chatMessages.value.push({
      role: 'assistant',
      content: 'Sajnálom, hiba történt. Kérlek, próbáld újra.'
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
  
  // Clear selection
  window.getSelection().removeAllRanges();
}

async function generateSimilarTest() {
  if (!selectedText.value) return;
  
  showContextMenu.value = false;
  
  // Open chat if not already open
  if (!isChatOpen.value) {
    toggleChat();
  }
  
  // Add user message
  chatMessages.value.push({
    role: 'user',
    content: `Generálj hasonló tesztet ehhez: "${selectedText.value}"`
  });
  
  isLoading.value = true;
  
  try {
    const courseContext = selectedCourse.value ? {
      title: selectedCourse.value.title,
      lectures: selectedCourse.value.lectures.map(lecture => ({
        title: lecture.title,
        content: lecture.blocks.map(block => {
          if (block.type === 'text') return block.content;
          if (block.type === 'code') return `Code exercise: ${block.description}`;
          if (block.type === 'test') return `Test: ${block.title}`;
          if (block.type === 'highlight') return block.content;
          return '';
        }).join(' ')
      }))
    } : null;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: selectedText.value,
        context: courseContext,
        selectionContext: selectionContext.value,
        action: 'generate_test',
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
    console.error('Error generating test:', error);
    chatMessages.value.push({
      role: 'assistant',
      content: 'Sajnálom, hiba történt. Kérlek, próbáld újra.'
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
  
  // Clear selection
  window.getSelection().removeAllRanges();
}
</script>

<style scoped>
/* Mobile hamburger menu button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 30%;
  left: 0;
  transform: translateY(-50%);
  z-index: 60;
  background-color: #09122C;
  color: white;
  padding: 16px 8px;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  box-shadow: 2px 0 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: none;
  writing-mode: vertical-lr;
  text-orientation: mixed;
}

.mobile-menu-btn:hover {
  background-color: #1a1f3a;
  left: 2px;
  box-shadow: 3px 0 12px rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.15);
}

.mobile-menu-btn.sidebar-open {
  left: 280px;
}

/* Mobile overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 45;
}

/* Mobile close button */
.mobile-close-btn {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #BE3144;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 10;
}

.container {
  display: flex;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 300px;
  background-color: #e2e8f0;
  padding: 24px;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.sidebar-title {
  font-size: 28px;
  color: #09122C;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #872341;
  flex: 1;
  min-width: 0;
}

.sidebar-content {
  padding: 8px 0;
}

.course-item {
  padding: 16px;
  margin: 8px 0;
  border-radius: 12px;
  transition: all 0.2s;
  font-size: 16px;
  color: #1f5f5f;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-item:hover {
  background-color: #f1f5f9;
  color: #BE3144;
  transform: translateY(-1px);
}

.course-item.active {
  color: #BE3144;
  border-left: 3px solid #BE3144;
}

.course-title {
  font-weight: 500;
  flex: 1;
}

.lecture-list {
  margin-top: 12px;
}

.lecture-item {
  padding: 8px 16px;
  margin: 4px 0;
  border-radius: 6px;
  font-size: 14px;
  color: #4a5568;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.lecture-item:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.visibility-btn {
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
}

.visibility-on {
  color: #BE3144;
  background-color: transparent;
}

.visibility-off {
  color: #872341;
  background-color: transparent;
}

.visibility-btn:hover {
  background-color: rgba(190, 49, 68, 0.1);
  transform: scale(1.1);
}

.main {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  transition: margin-left 0.3s ease;
}

.main-title {
  font-size: 36px;
  color: #09122C;
  font-weight: 700;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #872341;
  flex: 1;
}

.edit-btn {
  padding: 12px;
  background-color: #09122C;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background-color: #1a1f3a;
  transform: scale(1.05);
}

.lecture-title {
  font-size: 24px;
  color: #09122C;
  font-weight: 600;
  margin: 25px 0 15px 0;
}

.exercise-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.exercise-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2d3748;
}

.try-btn {
  margin-top: 16px;
  padding: 12px 24px;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
}

.try-btn:hover {
  background-color: #872341;
  transform: translateY(-1px);
}

.test-box {
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.test-title {
  font-size: 18px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 16px;
}

.test-description {
  color: #1f2937;
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.5;
}

.test-preview {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.preview-text {
  color: #1f2937;
  font-size: 16px;
  line-height: 1.5;
}

.take-test-btn {
  padding: 12px 24px;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
}

.take-test-btn:hover {
  background-color: #872341;
  transform: translateY(-1px);
}

.highlight-box {
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.table-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.lesson-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.lesson-table th,
.lesson-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.lesson-table th,
.header-cell {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.header-row {
  background-color: #f3f4f6;
}

/* Dialog styles */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 16px;
}

.dialog-content {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-height: 44px;
}

.btn-cancel {
  color: #374151;
  background-color: #f3f4f6;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit {
  color: white;
  background-color: #3b82f6;
}

.btn-submit:hover {
  background-color: #2563eb;
}

/* Numbered lists */
ol {
  counter-reset: item;
  list-style: none;
  padding-left: 0;
}

ol li {
  counter-increment: item;
  margin-bottom: 0.8em;
  font-size: 16px;
}

ol li:before {
  content: counters(item, ".") ".";
  margin-right: 0.8em;
  font-weight: 600;
}

ol li ol {
  counter-reset: item;
  padding-left: 2em;
}

/* Add lesson button */
.add-lesson-btn {
  width: 36px;
  height: 36px;
  background-color: #BE3144;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 20px;
  font-weight: 600;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-lesson-btn:hover {
  background-color: #872341;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.add-lesson-btn span {
  line-height: 1;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .mobile-overlay {
    display: block;
  }

  .mobile-close-btn {
    display: block;
  }

  .container {
    position: relative;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 50;
    width: 280px;
    transform: translateX(0);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar.closed {
    transform: translateX(-100%);
  }

  .main {
    padding: 20px 16px;
    margin-left: 0;
    width: 100%;
  }

  .main.sidebar-open {
    margin-left: 0;
  }

  .main-title {
    font-size: 24px;
    margin-bottom: 20px;
    padding-bottom: 10px;
  }

  .lecture-title {
    font-size: 20px;
    margin: 20px 0 12px 0;
  }

  .exercise-box,
  .test-box,
  .highlight-box,
  .table-box {
    padding: 16px;
    margin: 16px 0;
  }

  .exercise-title,
  .test-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .try-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
  }

  .table-wrapper {
    margin: -16px;
    padding: 16px;
  }

  .lesson-table {
    min-width: 400px;
  }

  .lesson-table th,
  .lesson-table td {
    padding: 8px 12px;
    font-size: 14px;
  }

  .dialog-content {
    padding: 24px;
    margin: 16px;
    max-width: none;
  }

  .dialog-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .dialog-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
  }

  .course-item {
    padding: 12px;
    margin: 6px 0;
    font-size: 15px;
  }

  .lecture-item {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 36px;
  }

  .sidebar-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .add-lesson-btn {
    width: 28px;
    height: 28px;
    font-size: 16px;
    flex-shrink: 0;
  }
}

/* Small mobile phones */
@media (max-width: 480px) {
  .sidebar {
    width: 100%;
  }

  .mobile-menu-btn.sidebar-open {
    left: 100%;
    transform: translateX(-100%) translateY(-50%);
  }

  .main-title {
    font-size: 20px;
  }

  .lecture-title {
    font-size: 18px;
  }

  .lesson-table {
    min-width: 320px;
  }

  .lesson-table th,
  .lesson-table td {
    padding: 6px 8px;
    font-size: 13px;
  }
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
  width: 40px;
  height: 40px;
  background-color: #BE3144;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-send:hover:not(:disabled) {
  background-color: #872341;
  transform: scale(1.05);
}

.chat-send:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

/* Mobile responsive styles for chat */
@media (max-width: 768px) {
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

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 55;
  min-width: 180px;
  border: 1px solid #e2e8f0;
}

.context-menu-btn {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}

.context-menu-btn:hover {
  background-color: #f3f4f6;
  color: #BE3144;
}

.context-menu-btn svg {
  flex-shrink: 0;
  color: #6b7280;
}

.context-menu-btn:hover svg {
  color: #BE3144;
}
</style>
