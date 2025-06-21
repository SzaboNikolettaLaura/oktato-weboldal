<template>
  <div class="lesson-editor" @contextmenu.prevent="showContextMenu">
    <Nav />
    <div class="action-bar" :style="{ top: isNavbarVisible ? '60px' : '0' }">
      <div class="action-bar-left">
        <div class="course-selector">
          <select v-model="course" class="filter-input" @change="loadLessons">
            <option value="" selected="selected">Kurzus</option>
            <option v-bind:value="c.id" v-for="c of courseData" v-bind:key="c.id">{{ c.title }}</option>
          </select>
        </div>
        <div v-if="!course" class="new-course-input">
          <input 
            v-model="newCourseName" 
            type="text" 
            placeholder="Új kurzus neve..." 
            class="filter-input"
          >
        </div>
        <div class="editor-type-selector">
          <select v-model="defaultEditorType" class="editor-type-select" @change="handleEditorTypeChange">
            <option value="plain">Egyszerű szöveg</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
      </div>
      <div class="action-bar-right">
        <input type="file" ref="fileInput" accept=".md,.txt,.js" class="file-input" @change="handleFileUpload" style="display: none">
        <button @click="$refs.fileInput.click()" class="action-btn" :disabled="isUploading">
          <span v-if="!isUploading">Fájl feltöltés</span>
          <span v-else class="loading">
            <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Feltöltés...
          </span>
        </button>
        <div class="add-block-dropdown">
          <select v-model="selectedBlockType" class="action-btn" @change="handleBlockTypeChange">
            <option value="">Blokk hozzáadása</option>
            <option value="new">+ Új lecke</option>
            <template v-if="defaultEditorType !== 'markdown'">
              <option value="text">Szöveg</option>
              <option value="code">Kód</option>
              <option value="highlight">Kiemelés</option>
              <option value="table">Táblázat</option>
            </template>
            <option value="test">Teszt</option>
          </select>
        </div>
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

    <div class="lessons-container">
      <div v-for="lesson in courseLessons" :key="lesson.id" class="lesson-section">
        <div class="lesson-header" @click="loadLesson(lesson.id)">
          <h3>{{ lesson.title || 'Új lecke' }}</h3>
          <div class="lesson-actions">
            <button @click.stop="toggleLessonVisibility(lesson)" class="action-btn" :class="{ 'visibility-on': lesson.visible, 'visibility-off': !lesson.visible }">
              {{ lesson.visible ? 'Látható' : 'Rejtett' }}
            </button>
            <button @click.stop="saveLesson(lesson)" class="action-btn">Mentés</button>
          </div>
        </div>
        <div v-if="currentLessonId === lesson.id" class="editor-container" :class="{ 'full-page': defaultEditorType === 'markdown' }">
          <div class="lesson-title-container">
            <input 
              v-model="lectureTitle" 
              type="text" 
              placeholder="Lecke címe..." 
              class="lesson-title-input"
            >
          </div>
          <div v-if="defaultEditorType === 'markdown'" class="markdown-editor">
            <div class="markdown-input">
              <textarea v-model="markdownContent" placeholder="Írd ide a markdown szöveget..." class="block-textarea"></textarea>
            </div>
            <div class="markdown-preview" v-html="renderMarkdown(markdownContent)"></div>
          </div>
          <draggable 
            v-else
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
                    <div class="block-actions">
                      <select v-model="block.editorType" class="editor-select">
                        <option value="plain">Egyszerű szöveg</option>
                        <option value="markdown">Markdown</option>
                      </select>
                      <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
                    </div>
                  </div>
                  <div v-if="block.editorType === 'plain'" class="block-textarea">
                    <textarea v-model="block.content" placeholder="Írd ide a magyarázatot..."></textarea>
                  </div>
                  <div v-else-if="block.editorType === 'markdown'" class="markdown-editor">
                    <div class="markdown-input">
                      <textarea v-model="block.content" placeholder="Írd ide a markdown szöveget..." class="block-textarea"></textarea>
                    </div>
                    <div class="markdown-preview" v-html="renderMarkdown(block.content)"></div>
                  </div>
                </div>
                <div v-else-if="block.type === 'code'" class="code-block">
                  <div class="block-header">
                    <span class="block-label">Kód Blokk</span>
                    <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
                  </div>
                  <input class="p-4 w-full" type="text" v-model="block.description" placeholder="Kód leírása">
                  <div :id="`monaco-editor-${index}`" class="monaco-container" style="height: 250px;"></div>
                </div>
                <div v-else-if="block.type === 'highlight'" class="highlight-block">
                  <div class="block-header">
                    <span class="block-label">Kiemelés Blokk</span>
                    <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
                  </div>
                  <textarea v-model="block.content" placeholder="Írd ide a kiemelendő fontos információt..." class="highlight-textarea"></textarea>
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
                <div v-else-if="block.type === 'table'" class="table-block">
                  <div class="block-header">
                    <span class="block-label">Táblázat Blokk</span>
                    <div class="block-actions">
                      <label class="header-toggle">
                        <input type="checkbox" v-model="block.hasHeader">
                        Fejléc
                      </label>
                      <button @click="removeBlock(index)" class="btn btn-danger">Törlés</button>
                    </div>
                  </div>
                  <div class="table-controls">
                    <button @click="addTableRow(block)" class="btn btn-secondary">Sor+</button>
                    <button @click="addTableColumn(block)" class="btn btn-secondary">Oszlop+</button>
                  </div>
                  <div class="table-container">
                    <table class="lesson-table">
                      <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex" :class="{ 'header-row': block.hasHeader && rowIndex === 0 }">
                        <td v-for="(cell, colIndex) in row" :key="colIndex">
                          <textarea v-model="block.rows[rowIndex][colIndex]" class="table-cell" :class="{ 'header-cell': block.hasHeader && rowIndex === 0 }"></textarea>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
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
      :courseId="course"
      :token="userData.token"
      @save="saveBlockChanges"
      @close="closeModal"
    />

    <!-- Context Menu -->
    <div 
      v-if="showContextMenuVisible" 
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="addBlockAtPosition('text')">
        Szöveg blokk hozzáadása
      </div>
      <div class="context-menu-item" @click="addBlockAtPosition('code')">
        Kód blokk hozzáadása
      </div>
      <div class="context-menu-item" @click="addBlockAtPosition('highlight')">
        Kiemelés blokk hozzáadása
      </div>
      <div class="context-menu-item" @click="addBlockAtPosition('test')">
        Teszt blokk hozzáadása
      </div>
      <div class="context-menu-item" @click="addBlockAtPosition('table')">
        Táblázat blokk hozzáadása
      </div>
    </div>

    <!-- Context menu overlay to hide menu when clicking outside -->
    <div 
      v-if="showContextMenuVisible" 
      class="context-menu-overlay" 
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import Nav from '@/components/Nav.vue';
import axios from 'axios';
import TestBlockEditor from '@/components/TestBlockEditor.vue';
import { useRoute } from 'vue-router';
import * as monaco from 'monaco-editor';
import draggable from 'vuedraggable';
import { marked } from 'marked';

const route = useRoute();
const { userData } = useUserData();
const { courseData } = await useCourses(userData.value.token);
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
const lastScrollY = ref(0);
const navbarHeight = ref(60);
const isNavbarVisible = ref(true);
const fileInput = ref(null);
const isUploading = ref(false);
const showLessonsTab = ref(false);
const courseLessons = ref([]);
const currentLessonId = ref(null);
const defaultEditorType = ref('plain');
const markdownContent = ref('');
const selectedBlockType = ref('');
const newCourseName = ref('');
const showContextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuInsertIndex = ref(0);

watch(course, (newCourse) => {
  if (newCourse) {
    const selectedCourse = courseData.value.find(c => c.id === newCourse);
    if (selectedCourse) {
      courseLessons.value = selectedCourse.lectures.map(lecture => ({
        id: lecture.id,
        title: lecture.title,
        visible: lecture?.visible?.data[0] || false
      }));
    }
  } else {
    courseLessons.value = [];
  }
});

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
    editorType: defaultEditorType.value,
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

const addTableBlock = () => {
  lessonBlocks.value.push({
    type: 'table',
    rows: [['', ''], ['', '']],
    hasHeader: true,
    id: Date.now() + Math.random()
  });
};

const addTableRow = (block) => {
  const newRow = Array(block.rows[0].length).fill('');
  block.rows.push(newRow);
};

const addTableColumn = (block) => {
  block.rows.forEach(row => row.push(''));
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

const toggleLessonVisibility = (lesson) => {
  lesson.visible = !lesson.visible;
};

const saveLesson = async (lesson) => {
  if (!lesson) {
    lesson = {
      id: currentLessonId.value,
      title: lectureTitle.value,
      visible: visibility.value,
      blocks: lessonBlocks.value
    };
  }

  if(!lesson.blocks) {
    lesson.blocks = lessonBlocks.value;
  }
  
  // Check if lesson has content
  if (!lesson.blocks || lesson.blocks.length === 0) {
    alert('A lecke nem lehet üres!');
    return;
  }
  
  // Handle course creation if needed
  let courseId = course.value;
  if (!courseId) {
    if (!newCourseName.value || newCourseName.value.trim() === '') {
      alert('Kérlek válassz ki egy kurzust vagy adj meg egy új kurzus nevet!');
      return;
    }
    
    try {
      // Create new course first
      const courseResponse = await axios.post('/api/courses', {
        title: newCourseName.value.trim(),
        token: userData.value.token
      });
      
      if (courseResponse.status === 200) {
        // Get the new course ID - we need to fetch courses again to get the ID
        const { courseData: updatedCourses } = await useCourses(userData.value.token);
        const newCourse = updatedCourses.value.find(c => c.title === newCourseName.value.trim());
        if (newCourse) {
          courseId = newCourse.id;
          course.value = courseId;
        } else {
          alert('Hiba történt az új kurzus létrehozása során.');
          return;
        }
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Hiba történt az új kurzus létrehozása során.');
      return;
    }
  }
  
  // Update content from editors before saving
  if (defaultEditorType.value === 'markdown') {
    // Extract title from markdown content if it exists, otherwise use input field
    const titleMatch = markdownContent.value.match(/^# (.*?)(?:\n|$)/);
    const extractedTitle = titleMatch ? titleMatch[1].trim() : lectureTitle.value;
    
    lesson.blocks = [{
      type: 'text',
      content: markdownContent.value,
      editorType: 'markdown',
      id: Date.now() + Math.random()
    }];
    lesson.title = extractedTitle;
  } else {
    lesson.blocks.forEach((block, index) => {
      if (block.type === 'code' && editors[index]) {
        block.content = editors[index].getValue();
      }
    });
    // Use the title from the input field
    lesson.title = lectureTitle.value;
  }
  
  // Set default title if empty
  if (!lesson.title || lesson.title.trim() === '') {
    lesson.title = 'Új lecke';
  }
  
  const method = lesson.id ? 'patch' : 'post';
  const url = lesson.id ? `/api/lectures?id=${lesson.id}` : '/api/lectures';
  
  try {
    const response = await axios[method](url, { 
      course: courseId, 
      blocks: lesson.blocks, 
      title: lesson.title,
      visibility: lesson.visible,
      token: userData.value.token 
    });
    
    alert('Lecke sikeresen mentve!');
    navigateTo('/course');
  } catch (error) {
    console.error('Error saving lecture:', error);
    alert('Hiba történt a lecke mentése során. Kérlek próbáld újra.');
  }
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
  nextTick(() => {
    const container = document.getElementById(`monaco-editor-${index}`);
    if (!container) return;

    if (editors[index]) {
      editors[index].dispose();
    }

    editors[index] = monaco.editor.create(container, {
      value: content || '',
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
  });
};

const generateAIContent = async () => {
  if (!aiInput.value) return;
  
  isGenerating.value = true;
  try {
    const response = await axios.post('/api/gemini', {
      prompt: aiInput.value + ' Magyarul válaszolj és kommentezd a kódot. Ha kódot generálsz, használd a ```html jelölést. A kód előtt használd a [KÓD LEÍRÁS] jelölést, utána új sor, és írd le röviden (max 5-6 szó) magyarul, hogy mit csinál a kód. A kód mindig legyen minimális, csak a szükséges elemeket tartalmazza. Ne használj markdown formázást (**), csak sima szöveget. Ne használj bevezető mondatokat vagy felesleges magyarázatokat, csak a tényleges leckét és kódot add meg.'
    });
    
    const content = response.data;
    
    // Split by [KÓD LEÍRÁS] to identify code sections
    const sections = content.split(/\[KÓD LEÍRÁS\]/);
    
    // First section is always text (before any code)
    if (sections[0].trim()) {
      addTextBlock();
      lessonBlocks.value[lessonBlocks.value.length - 1].content = sections[0].trim();
    }
    
    // Process remaining sections (each starts with a code block)
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      
      // Find the code block (between ```html and ```)
      const codeMatch = section.match(/```html\s*([\s\S]*?)```/);
      
      if (codeMatch) {
        const codeContent = codeMatch[1].trim();
        
        // Extract description (text before ```html)
        const beforeCode = section.substring(0, section.indexOf('```html')).trim();
        
        // Extract text after code block - find the end of the closing ```
        const codeEndIndex = section.indexOf('```', section.indexOf('```html') + 7) + 3;
        const afterCode = section.substring(codeEndIndex).trim();
        
        // Add code block
        addCodeBlock();
        const codeBlockIndex = lessonBlocks.value.length - 1;
        lessonBlocks.value[codeBlockIndex].description = beforeCode;
        
        nextTick(() => {
          initMonacoEditor(codeBlockIndex, codeContent);
        });
        
        // Add text after code if exists
        if (afterCode) {
          addTextBlock();
          lessonBlocks.value[lessonBlocks.value.length - 1].content = afterCode;
        }
      }
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

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const { lectures, courseTitle } = parseMarkdownContent(content);
    
    if (courseTitle) {
      newCourseName.value = courseTitle;
    }
    
    if (lectures.length > 0) {
      lectures.forEach(lecture => {
        const newTab = {
          id: Date.now() + Math.random(),
          title: lecture.title || 'Új lecke',
          visible: true,
          isNew: true,
          blocks: lecture.blocks
        };
        courseLessons.value.push(newTab);
      });
      
      if (lectures[0].blocks.length > 0) {
        lessonBlocks.value = lectures[0].blocks;
        lectureTitle.value = lectures[0].title;
      }
    }
  };
  reader.onerror = () => {
    alert('Hiba történt a fájl feltöltése során.');
  };
  reader.onloadend = () => {
    isUploading.value = false;
  };
  reader.readAsText(file);
};

const parseMarkdownContent = (content) => {
  const lectures = [];
  let currentLecture = {
    title: '',
    blocks: []
  };
  let currentBlock = null;
  let currentContent = [];
  let inTable = false;
  let tableContent = [];

  const lines = content.split('\n');
  let courseTitle = '';
  let firstLineProcessed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!firstLineProcessed && line.trim() !== '') {
      if (line.trim().startsWith('#')) {
        courseTitle = line.trim().replace(/^#+\s*/, '');
      } else {
        courseTitle = line.trim();
      }
      firstLineProcessed = true;
      continue;
    }
    // New lesson title if line starts with '##'
    if (line.trim().startsWith('##')) {
      // Save current lecture if it has blocks
      if (currentLecture.blocks.length > 0) {
        lectures.push(currentLecture);
      }
      currentLecture = {
        title: line.trim().replace(/^##+\s*/, ''),
        blocks: []
      };
      currentBlock = null;
      currentContent = [];
      inTable = false;
      tableContent = [];
      continue;
    }
    
    if (line.includes('|')) {
      if (!inTable) {
        inTable = true;
        tableContent = [];
      }
      tableContent.push(line);
      continue;
    } else if (inTable) {
      inTable = false;
      currentBlock = {
        type: 'text',
        content: tableContent.join('\n'),
        editorType: 'plain'
      };
      currentLecture.blocks.push(currentBlock);
      currentBlock = null;
    }
    
    if (line.startsWith('```')) {
      if (currentBlock) {
        currentLecture.blocks.push({
          type: currentBlock.type,
          content: currentContent.join('\n').trim(),
          description: currentBlock.description || '',
          id: Date.now() + Math.random(),
          ...(currentBlock.type === 'text' ? { editorType: 'plain' } : {})
        });
        currentContent = [];
      }
      const description = line.slice(3).trim();
      currentBlock = {
        type: 'code',
        description: description
      };
    } else if (line.startsWith('>')) {
      if (currentBlock) {
        currentLecture.blocks.push({
          type: currentBlock.type,
          content: currentContent.join('\n').trim(),
          description: currentBlock.description || '',
          id: Date.now() + Math.random(),
          ...(currentBlock.type === 'text' ? { editorType: 'plain' } : {})
        });
        currentContent = [];
      }
      currentBlock = {
        type: 'highlight'
      };
      currentContent.push(line.slice(1).trim());
    } else if (line.trim() === '') {
      if (currentBlock && currentContent.length > 0) {
        currentLecture.blocks.push({
          type: currentBlock.type,
          content: currentContent.join('\n').trim(),
          description: currentBlock.description || '',
          id: Date.now() + Math.random(),
          ...(currentBlock.type === 'text' ? { editorType: 'plain' } : {})
        });
        currentContent = [];
        currentBlock = null;
      }
    } else {
      if (!currentBlock) {
        currentBlock = {
          type: 'text',
          editorType: 'plain'
        };
      }
      currentContent.push(line);
    }
  }

  if (currentBlock && currentContent.length > 0) {
    currentLecture.blocks.push({
      type: currentBlock.type,
      content: currentContent.join('\n').trim(),
      description: currentBlock.description || '',
      id: Date.now() + Math.random(),
      ...(currentBlock.type === 'text' ? { editorType: 'plain' } : {})
    });
  }

  if (currentLecture.blocks.length > 0) {
    lectures.push(currentLecture);
  }

  // Set the course title as the first lecture's title if available
  if (lectures.length > 0 && courseTitle) {
    lectures[0].title = courseTitle;
  }

  return { lectures, courseTitle };
};

const loadLessons = async () => {
  if (!course.value) {
    courseLessons.value = [];
    return;
  }

  const selectedCourse = courseData.value.find(c => c.id === course.value);
  if (selectedCourse) {
    courseLessons.value = selectedCourse.lectures.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      visible: lecture.visible.data[0]
    }));
  }
};

const createNewLesson = () => {
  lessonBlocks.value = [];
  lectureTitle.value = '';
  visibility.value = true;
  currentLessonId.value = null;
  
  // Add new tab
  const newTab = {
    id: Date.now(),
    title: 'Új lecke',
    visible: true,
    isNew: true
  };
  courseLessons.value.push(newTab);
  
  // Navigate to the new lesson
  navigateTo(`/lessonedit?id=${newTab.id}`);
};

const closeTab = (lessonId) => {
  if (currentLessonId.value === lessonId) {
    createNewLesson();
  }
  courseLessons.value = courseLessons.value.filter(l => l.id !== lessonId);
};

const loadLesson = async (lessonId) => {
  currentLessonId.value = lessonId;
  try {
    const response = await axios.get(`/api/lectures?id=${lessonId}`);
    const lecture = response.data;
    course.value = lecture.courseId;
    lectureTitle.value = lecture.title;
    visibility.value = lecture.visible.data[0];
    
    if (defaultEditorType.value === 'markdown') {
      const markdownBlock = lecture.blocks.find(block => block.type === 'text' && block.editorType === 'markdown');
      markdownContent.value = markdownBlock ? markdownBlock.content : '';
      // Add title to markdown content if it exists
      if (lecture.title) {
        markdownContent.value = `# ${lecture.title}\n\n${markdownContent.value}`;
      }
    } else {
      lessonBlocks.value = lecture.blocks.map(block => {
        if (block.type === 'text') {
          return {
            ...block,
            content: block.content.trim()
          };
        }
        return block;
      });

      nextTick(() => {
        lessonBlocks.value.forEach((block, index) => {
          if (block.type === 'code') {
            initMonacoEditor(index, block.content);
          }
        });
        
        // Check if we should auto-open the test editor
        const editTestData = sessionStorage.getItem('editTestData');
        if (editTestData) {
          try {
            const testData = JSON.parse(editTestData);
            if (testData.editTest) {
              const testIndex = testData.testIndex || 0;
              const testBlocks = lessonBlocks.value.filter(block => block.type === 'test');
              
              if (testBlocks[testIndex]) {
                // Find the actual index of this test block in lessonBlocks
                const blockIndex = lessonBlocks.value.findIndex(block => 
                  block.type === 'test' && block === testBlocks[testIndex]
                );
                
                if (blockIndex !== -1) {
                  // Auto-open the test editor
                  openModal(lessonBlocks.value[blockIndex], blockIndex);
                  
                  // Clear the sessionStorage data after using it
                  sessionStorage.removeItem('editTestData');
                }
              }
            }
          } catch (error) {
            console.error('Error parsing test data from sessionStorage:', error);
            sessionStorage.removeItem('editTestData');
          }
        }
      });
    }
  } catch (error) {
    console.error('Error loading lesson:', error);
  }
};

const toggleMarkdown = (index) => {
  lessonBlocks.value[index].useMarkdown = !lessonBlocks.value[index].useMarkdown;
};

const renderMarkdown = (content) => {
  return marked(content);
};

const addMarkdownBlock = () => {
  lessonBlocks.value.push({ 
    type: 'text', 
    content: '',
    editorType: 'markdown',
    id: Date.now() + Math.random()
  });
};

const handleEditorTypeChange = () => {
  // No need for rich editor initialization
};

const handleBlockTypeChange = () => {
  if (!selectedBlockType.value) return;
  
  switch (selectedBlockType.value) {
    case 'new':
      createNewLesson();
      break;
    case 'test':
      addTestBlock();
      break;
    default:
      if (defaultEditorType.value !== 'markdown') {
        switch (selectedBlockType.value) {
          case 'text':
            addTextBlock();
            break;
          case 'code':
            addCodeBlock();
            break;
          case 'highlight':
            addHighlightBlock();
            break;
          case 'table':
            addTableBlock();
            break;
        }
      }
  }
  
  selectedBlockType.value = '';
};

const showContextMenu = (event) => {
  event.preventDefault();
  
  // Only show context menu if not in markdown mode
  if (defaultEditorType.value === 'markdown') {
    return;
  }
  
  showContextMenuVisible.value = true;
  
  // Improved positioning to avoid going off screen
  const menuWidth = 200;
  const menuHeight = 200; // approximate
  const x = event.clientX + menuWidth > window.innerWidth 
    ? event.clientX - menuWidth 
    : event.clientX;
  const y = event.clientY + menuHeight > window.innerHeight 
    ? event.clientY - menuHeight 
    : event.clientY;
    
  contextMenuPosition.value = { x, y };
  
  // Calculate insert position based on mouse position relative to blocks
  const blocksContainer = document.querySelector('.blocks');
  if (blocksContainer) {
    const rect = blocksContainer.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    
    // Find which block the mouse is closest to
    const blockElements = blocksContainer.querySelectorAll('.block');
    let insertIndex = lessonBlocks.value.length;
    
    for (let i = 0; i < blockElements.length; i++) {
      const blockRect = blockElements[i].getBoundingClientRect();
      const blockRelativeY = blockRect.top - rect.top;
      
      if (relativeY < blockRelativeY + (blockRect.height / 2)) {
        insertIndex = i;
        break;
      }
    }
    
    contextMenuInsertIndex.value = insertIndex;
  } else {
    // If blocks container not found, insert at the end
    contextMenuInsertIndex.value = lessonBlocks.value.length;
  }
};

const hideContextMenu = () => {
  showContextMenuVisible.value = false;
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    hideContextMenu();
  }
};

const addBlockAtPosition = (blockType) => {
  const newBlock = {
    id: Date.now() + Math.random()
  };
  
  switch (blockType) {
    case 'text':
      newBlock.type = 'text';
      newBlock.content = '';
      newBlock.editorType = defaultEditorType.value;
      break;
    case 'code':
      newBlock.type = 'code';
      newBlock.content = '';
      newBlock.description = '';
      break;
    case 'highlight':
      newBlock.type = 'highlight';
      newBlock.content = '';
      break;
    case 'test':
      newBlock.type = 'test';
      newBlock.title = '';
      newBlock.questions = [];
      break;
    case 'table':
      newBlock.type = 'table';
      newBlock.rows = [['', ''], ['', '']];
      newBlock.hasHeader = true;
      break;
  }
  
  lessonBlocks.value.splice(contextMenuInsertIndex.value, 0, newBlock);
  
  if (blockType === 'code') {
    nextTick(() => {
      initMonacoEditor(contextMenuInsertIndex.value, '');
    });
  }
  
  hideContextMenu();
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
      visibility.value = lecture?.visible?.data[0] || false; // Set visibility, default to true if not set
      
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
        
        // Check if we should auto-open the test editor
        const editTestData = sessionStorage.getItem('editTestData');
        if (editTestData) {
          try {
            const testData = JSON.parse(editTestData);
            if (testData.editTest) {
              const testIndex = testData.testIndex || 0;
              const testBlocks = lessonBlocks.value.filter(block => block.type === 'test');
              
              if (testBlocks[testIndex]) {
                // Find the actual index of this test block in lessonBlocks
                const blockIndex = lessonBlocks.value.findIndex(block => 
                  block.type === 'test' && block === testBlocks[testIndex]
                );
                
                if (blockIndex !== -1) {
                  // Auto-open the test editor
                  openModal(lessonBlocks.value[blockIndex], blockIndex);
                  
                  // Clear the sessionStorage data after using it
                  sessionStorage.removeItem('editTestData');
                }
              }
            }
          } catch (error) {
            console.error('Error parsing test data from sessionStorage:', error);
            sessionStorage.removeItem('editTestData');
          }
        }
      });
    } catch (error) {
      console.error('Error loading lecture:', error);
      // Handle error appropriately
    }
  }
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeydown);
});

// Clean up editors when component is unmounted
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
  Object.values(editors).forEach(editor => editor.dispose());
});
</script>

<style>
.editor-select {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-size: 14px;
}

.rich-editor {
  height: 100%;
  padding: 20px;
  background: white;
}

.rich-editor-input {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
}

.rich-editor-input :deep(.ql-toolbar) {
  border-top: none;
  border-left: none;
  border-right: none;
  background: #f8f9fa;
  padding: 8px;
}

.rich-editor-input :deep(.ql-container) {
  border: none;
  height: calc(100vh - 200px);
  font-size: 16px;
}

.rich-editor-input :deep(.ql-editor) {
  padding: 20px;
  min-height: 100%;
}

.rich-editor-preview {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 5px;
  z-index: 1000;
  min-height: 200px;
}

.rich-editor-preview :deep(.ql-toolbar) {
  border-top: none;
  border-left: none;
  border-right: none;
  background: #f8f9fa;
}

.rich-editor-preview :deep(.ql-container) {
  border: none;
  min-height: 150px;
}

.tabs-container {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 0;
  position: sticky;
  top: 60px;
  z-index: 80;
}

.tabs-header {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 10px;
  gap: 15px;
}

.course-selector {
  min-width: 200px;
}

.course-selector .filter-input {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #333;
}

.editor-type-selector {
  min-width: 150px;
}

.editor-type-selector .editor-type-select {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #333;
}

.tabs-list {
  display: flex;
  overflow-x: auto;
  flex: 1;
  gap: 2px;
  padding: 5px 0;
  scrollbar-width: thin;
  -ms-overflow-style: auto;
  height: 100%;
  overflow-y: hidden;
}

.tabs-list::-webkit-scrollbar {
  height: 6px;
}

.tabs-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tabs-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.tabs-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.tab {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #e9ecef;
  border: 1px solid #dee2e6;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  min-width: 160px;
  max-width: 250px;
  gap: 8px;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.tab:hover {
  background: #f1f3f5;
}

.tab.active {
  background: white;
  z-index: 2;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
  z-index: 3;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.close-tab {
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  padding: 0 4px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 1;
}

.close-tab:hover {
  color: #333;
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
  background-color: #BE3144;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #a02a3a;
}

.btn-primary {
  background-color: #09122C;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0a1536;
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
  background-color: #09122C;
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
  background-color: #0a1536;
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
  background-color: #09122C;
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
  background-color: #0a1536;
  cursor: not-allowed;
}

.generate-btn:hover:not(:disabled) {
  background-color: #0a1536;
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
  background-color: #BE3144 !important;
  color: white;
}

.visibility-off:hover {
  background-color: #a02a3a !important;
}

.action-btn {
  background-color: #09122C;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background-color: #0a1536;
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

  .rich-editor {
    grid-template-columns: 1fr;
  }
}

.lessons-container {
  padding: 20px;
}

.lesson-section {
  margin-bottom: 30px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
}

.lesson-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.lesson-actions {
  display: flex;
  gap: 10px;
}

.add-lesson-btn {
  padding: 8px 16px;
  background: #09122C;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-lesson-btn:hover {
  background: #0a1536;
}

.tabs-container {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 0;
  position: sticky;
  top: 60px;
  z-index: 80;
}

.tabs-header {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 10px;
  gap: 15px;
}

.action-bar.hidden {
  display: none;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  width: 100%;
  z-index: 90;
  transition: all 0.3s ease;
  flex-wrap: nowrap;
  top: 60px;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.action-bar-right {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.add-block-dropdown {
  position: relative;
}

.add-block-dropdown select {
  appearance: none;
  background-color: #09122C;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  min-width: 150px;
  height: 40px;
  display: flex;
  align-items: center;
}

.add-block-dropdown select:hover {
  background-color: #0a1536;
}

.add-block-dropdown select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.add-block-dropdown select option {
  background-color: white;
  color: #333;
  padding: 8px;
}

.add-block-dropdown select option:first-child {
  color: #666;
}

.table-block {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.table-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.btn-secondary {
  background-color: #09122C;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #0a1536;
}

.table-container {
  overflow-x: auto;
}

.lesson-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.lesson-table td {
  padding: 0;
  border: 1px solid #dee2e6;
}

.table-cell {
  width: 100%;
  min-height: 40px;
  padding: 8px;
  border: none;
  resize: none;
  background: transparent;
  font-size: 14px;
}

.table-cell:focus {
  outline: none;
  background: white;
}

.block-actions {
  display: flex;
  gap: 8px;
}

.markdown-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  height: calc(100vh - 200px);
  padding: 20px;
  background: white;
}

.markdown-input {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.markdown-input textarea {
  width: 100%;
  height: 100%;
  min-height: unset;
  padding: 20px;
  border: none;
  resize: none;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
}

.markdown-preview {
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  overflow-y: auto;
  height: 100%;
}

.markdown-preview :deep(h1) {
  font-size: 1.8em;
  margin-bottom: 0.5em;
  color: #2c3e50;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 0.5em;
  color: #2c3e50;
}

.markdown-preview :deep(h3) {
  font-size: 1.3em;
  margin-bottom: 0.5em;
  color: #2c3e50;
}

.markdown-preview :deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
}

.markdown-preview :deep(ul), .markdown-preview :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-preview :deep(code) {
  background: #f8f9fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: #f8f9fa;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #dee2e6;
  padding-left: 1em;
  margin-left: 0;
  color: #6c757d;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-preview :deep(th), .markdown-preview :deep(td) {
  border: 1px solid #dee2e6;
  padding: 0.5em;
}

.markdown-preview :deep(th) {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .markdown-editor {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .markdown-input, .markdown-preview {
    height: 400px;
  }
}

.header-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
}

.header-toggle input[type="checkbox"] {
  margin: 0;
}

.header-row {
  background-color: #f8f9fa;
}

.header-cell {
  font-weight: bold;
  background-color: #f8f9fa;
}

.lesson-title-container {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #dee2e6;
}

.lesson-title-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 24px;
  font-weight: 600;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: white;
  color: #333;
  transition: border-color 0.2s ease;
}

.lesson-title-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.lesson-title-input::placeholder {
  color: #999;
  font-weight: 400;
}

.new-course-input {
  min-width: 200px;
}

.new-course-input .filter-input {
  border: 2px solid #28a745;
  background-color: #f8fff9;
}

.new-course-input .filter-input:focus {
  border-color: #20c997;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  min-width: 200px;
  overflow: hidden;
}

.context-menu-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f8f9fa;
}

.context-menu-item:last-child {
  border-bottom: none;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1999;
}
</style>


