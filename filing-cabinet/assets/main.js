const isGitHubPages = window.location.href.includes('github.io');
let parentWindow = null;

// Always try to get parent window if we're in an iframe
if (window.parent !== window) {
  parentWindow = window.parent;
  console.log('Parent window found:', parentWindow);
} else {
  console.log('No parent window found');
}

document.addEventListener('DOMContentLoaded', function() {

console.log('Main.js loaded in iframe');

  // =============================================
  // FILE CABINET FUNCTIONALITY
  // =============================================
  if (!localStorage.getItem('fileStorage')) {
    localStorage.setItem('fileStorage', JSON.stringify({}));
  }

  const fileStorage = JSON.parse(localStorage.getItem('fileStorage'));
  let currentFolder = fileStorage;
  let selectedFile = null;
  let selectedFileContainer = null;
  let draggedFile = null;
  let draggedFileOrigin = null;
  let draggedFileKey = null;

  // Upload handling
  document.getElementById('fileUpload')?.addEventListener('change', function(e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const targetFolder = selectedFileContainer || currentFolder;
        targetFolder[file.name] = {
          name: file.name,
          type: file.type,
          data: e.target.result.split(',')[1],
          uploadedAt: new Date().toISOString()
        };
        saveFiles();
        renderFiles();
        selectedFileContainer = null;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  // Add File buttons
  document.querySelectorAll('.add-file').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('fileUpload').click();
    });
  });

  // Find File buttons
  document.querySelectorAll('.find-file').forEach(btn => {
    btn.addEventListener('click', () => {
      const term = prompt('Search for:');
      if (!term) return;

      document.querySelectorAll('.file-item').forEach(el => el.classList.remove('highlight'));

      let matchFound = false;
      document.querySelectorAll('.file-item').forEach(el => {
        const name = el.textContent.toLowerCase();
        if (name.includes(term.toLowerCase())) {
          el.classList.add('highlight');
          matchFound = true;
        }
      });

      if (!matchFound) {
        alert('No matches found.');
      }
    });
  });

  // Open button - FIXED
  document.getElementById('openFile')?.addEventListener('click', () => {
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }
    
    console.log('Opening file:', selectedFile.name);
    
    // Send to parent with the file data
    if (parentWindow) {
      console.log('Sending FILE_OPENED message to parent');
    parentWindow.postMessage(
      { 
        type: 'FILE_OPENED',
        file: selectedFile
      },
      '*'
      );
    } else {
      console.log('No parent window found');
    }
  });

  // Delete
  document.getElementById('deleteFile')?.addEventListener('click', () => {
    if (selectedFile && confirm(`Delete ${selectedFile.name}?`)) {
      delete currentFolder[selectedFile.name];
      saveFiles();
      renderFiles();
      selectedFile = null;
      selectedFileContainer = null;
      updateButtonStates();
    }
  });

  // Rename
  document.getElementById('renameFile')?.addEventListener('click', () => {
    if (selectedFile) {
      const newName = prompt('Enter new name:', selectedFile.name);
      if (newName && newName !== selectedFile.name) {
        if (!currentFolder[newName]) {
          currentFolder[newName] = { ...selectedFile, name: newName };
          delete currentFolder[selectedFile.name];
          saveFiles();
          renderFiles();
        } else {
          alert('A file or folder with that name already exists.');
        }
      }
    }
  });

  // New Folder
  document.getElementById('newFolder')?.addEventListener('click', () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && !currentFolder[folderName]) {
      currentFolder[folderName] = {
        name: folderName,
        isFolder: true,
        children: {},
        createdAt: new Date().toISOString()
      };
      saveFiles();
      renderFiles();
    } else if (currentFolder[folderName]) {
      alert('A file or folder with that name already exists.');
    }
  });

  // Helper functions
  function navigateToFolder(folder) {
    const allItems = document.querySelectorAll('.file-item');
    for (const item of allItems) {
      const summary = item.querySelector('summary');
      if (summary && summary.textContent.includes(folder.name)) {
        item.open = true;
        summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }

  function updateButtonStates() {
    const hasSelection = selectedFile !== null;
    document.getElementById('openFile').disabled = !hasSelection;
    document.getElementById('deleteFile').disabled = !hasSelection;
    document.getElementById('renameFile').disabled = !hasSelection;
  }

  function renderFiles(container = document.getElementById('fileList'), folder = fileStorage, depth = 0) {
    if (depth === 0) container.innerHTML = '';

    Object.entries(folder).forEach(([key, item]) => {
      const fileItem = document.createElement(item.isFolder ? 'details' : 'div');
      fileItem.className = 'file-item';
      fileItem.style.marginLeft = `${depth * 20}px`;
      fileItem.draggable = !item.isFolder;

      if (item.isFolder) {
        const summary = document.createElement('summary');
        summary.innerHTML = `<span class="file-icon">📁</span> <span class="file-name">${item.name}</span>`;
        fileItem.appendChild(summary);

        const childContainer = document.createElement('div');
        fileItem.appendChild(childContainer);

        summary.addEventListener('click', e => {
          e.stopPropagation();
          document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
          fileItem.classList.add('selected');
          selectedFile = item;
          selectedFileContainer = item.children;
          updateButtonStates();

          if (!childContainer.hasChildNodes()) {
            renderFiles(childContainer, item.children, depth + 1);
          }
        });

        summary.addEventListener('dblclick', e => {
          e.stopPropagation();
          fileItem.open = !fileItem.open;
        });

        summary.addEventListener('dragover', e => {
          e.preventDefault();
          summary.classList.add('drag-hover');
        });

        summary.addEventListener('dragleave', () => {
          summary.classList.remove('drag-hover');
        });

        summary.addEventListener('drop', e => {
          e.preventDefault();
          summary.classList.remove('drag-hover');
          if (draggedFile && draggedFileOrigin && draggedFileKey !== item.name) {
            item.children[draggedFile.name] = { ...draggedFile };
            delete draggedFileOrigin[draggedFileKey];
            saveFiles();
            renderFiles();
          }
        });
      } else {
        fileItem.innerHTML = `
          <span class="file-icon">${getFileIcon(item.name)}</span>
          <span class="file-name">${item.name}</span>
        `;

        fileItem.addEventListener('click', () => {
          document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
          fileItem.classList.add('selected');
          selectedFile = item;
          selectedFileContainer = null;
          updateButtonStates();
          console.log('Selected file:', selectedFile.name);
        });

        fileItem.addEventListener('dblclick', () => {
          console.log('Double-clicked file:', item.name);
          openSelectedFile(item);
        });

        fileItem.addEventListener('dragstart', () => {
          draggedFile = item;
          draggedFileOrigin = folder;
          draggedFileKey = key;
        });
      }

      container.appendChild(fileItem);
    });

    updateButtonStates();
  }

// Helper function to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to revoke Blob URLs when done
function revokeBlobUrl(url) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function openSelectedFile(file = selectedFile) {
  if (!file) {
    console.log('No file to open');
    return;
  }
  
  console.log('Opening selected file:', file.name);
  
  if (parentWindow) {
    console.log('Sending FILE_OPENED message to parent');
    parentWindow.postMessage({
      type: 'FILE_OPENED',
      file: file
    }, '*'); // Parent origin
  } else {
    console.log('No parent window available');
  }
}

  function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      txt: '📄', md: '📝', json: '🔣', csv: '📑', xml: '🗃️',
      js: '📜', py: '🐍', html: '🌐', css: '🎨',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️',
      pdf: '📕', doc: '📘', docx: '📘', xls: '📊', xlsx: '📊', ppt: '📈', pptx: '📈',
      mp3: '🎵', wav: '🎵', flac: '🎵', ogg: '🎵', m4a: '🎵',
      mp4: '🎞️', mpeg: '🎞️', avi: '🎞️', mov: '🎬', webm: '🎬',
      zip: '🗜️', rar: '🗜️', '7z': '🗜️', tar: '🗜️', gz: '🗜️',
      exe: '⚙️', sh: '🐚', bat: '📁', iso: '💿', dmg: '💿',
      apk: '📱', torrent: '🌪️',
      default: '❓'
    };
    return icons[ext] || icons.default;
  }

  function saveFiles() {
    localStorage.setItem('fileStorage', JSON.stringify(fileStorage));
  }

  renderFiles();

});
