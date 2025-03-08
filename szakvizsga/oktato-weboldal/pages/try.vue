<template>
    <div>
        <Nav />
        <div class="container">
        <div class="header">
            <button @click="runCode">Run</button>
        </div>
    
        <div class="columns">
            <!-- Left column: Monaco editor -->
            <MonacoEditor class="code-column" :options="{minimap: {enabled: false}}" v-model="editor" lang="html" />
    
            <!-- Right column: iframe displaying the result -->
            <div class="preview-column">
            <iframe v-if="iframeSrc" :srcdoc="iframeSrc" frameborder="0" width="100%" height="500px"></iframe>
            </div>
        </div>
        </div>
    </div>
  </template>
  
  <script>

  export default {
    data() {
      return {
        iframeSrc: '', // Holds the iframe content that will be updated when the "Run" button is clicked
        editor: '', 
      };
    },
    mounted() {
    },
    methods: {
      runCode() {
        try {
          // Get the HTML code from Monaco editor when the "Run" button is clicked
          const htmlCode = this.editor;
          
          // Check if the HTML content is not empty
          if (htmlCode.trim() === "") {
            alert("Please write some HTML code before running.");
            return;
          }
  
          // Safely update the iframeSrc
          this.iframeSrc = htmlCode;
        } catch (error) {
          console.error("Error running code:", error);
          alert("An error occurred while running the code.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    height: 100%;
  }
  
  .header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  .columns {
    display: flex;
    justify-content: space-between;
    height: 100%;
  }
  
  .code-column,
  .preview-column {
    flex: 1;
    margin: 0 10px;
  }
  
  iframe {
    border: 1px solid #ccc;
  }
  </style>
  