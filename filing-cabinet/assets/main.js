const isGitHubPages = window.location.href.includes('github.io');
let parentWindow = null;

if (isGitHubPages) {
  // If we're in an iframe, get reference to parent window
  if (window.parent !== window) {
    parentWindow = window.parent;
  }
}

document.getElementById('openFile').addEventListener('click', () => {
  // Send a message to the parent window
  window.parent.postMessage(
    { type: 'FILE_OPENED' },  // Unique message identifier
    'https://ismile.neocities.org/aol/'  // Replace with your parent page's exact origin
  );
});


document.addEventListener('DOMContentLoaded', function() {

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

  // Open button
  document.getElementById('openFile')?.addEventListener('click', () => {
    if (!selectedFile) return;
    if (selectedFile.isFolder) {
      navigateToFolder(selectedFile);
    } else {
      openSelectedFile(selectedFile);
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
        });

        fileItem.addEventListener('dblclick', () => openSelectedFile(item));

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

function openSelectedFile() {
  if (!selectedFile) return;
  
  if (parentWindow) {
    parentWindow.postMessage({
      type: 'PREVIEW_FILE',
      file: selectedFile
    }, '*');
  } else {
    previewFile(selectedFile);
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


window.addEventListener('message', (event) => {
  if (event.data.type === 'PREVIEW_FILE') {
    previewFile(event.data.file); // Directly use existing function
  }
});

  renderFiles();

});
