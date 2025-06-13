document.addEventListener('DOMContentLoaded', function() {

console.log('Preview.js loaded');
console.log('Preview DOM loaded, container exists:', !!document.getElementById('previewContentIF'));

let currentFile = null;

// Message listener for parent
window.addEventListener('message', (event) => {
  // Accept messages from parent only - FIXED origin check
  if (!event.origin.includes('neocities.org')) return;
  
  console.log('Preview window received message:', event.data);
  
  if (event.data.type === 'PREVIEW_FILE') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        previewFile(event.data.file);
      });
    } else {
      previewFile(event.data.file);
    }
  }
  
  if (event.data.type === 'MAXIMIZE_PREVIEW') {
    maximizeCurrentFile();
  }
});

function previewFile(file) {
  console.log('Preview file called with:', file);
  currentFile = file; // Store current file for maximize functionality
  
  // Get preview container
  const previewContent = document.getElementById('previewContentIF');
  if (!previewContent) {
    console.error('Preview content container not found');
    return;
  }

  // Clear previous content
  previewContent.innerHTML = '';

  // Handle different file types
  if (file.type?.startsWith('image/')) {
    // Images - use data URL
    previewContent.innerHTML = `
      <img src="data:${file.type};base64,${file.data}" 
           alt="${file.name}" 
           style="max-width:100%; max-height:100%; object-fit:contain;">
    `;
  }
  else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    // Text files
    const text = atob(file.data);
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.margin = '0';
    pre.style.padding = '10px';
    pre.style.fontFamily = 'monospace';
    pre.style.overflow = 'auto';
    pre.style.height = '100%';
    pre.textContent = text;
    previewContent.appendChild(pre);
  }
  else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    // PDFs - use object tag
    previewContent.innerHTML = `
      <object data="data:application/pdf;base64,${file.data}" 
              type="application/pdf" 
              width="100%"
              style="border:none;height:100vh">
        <p>PDF viewer not available. <a href="data:application/pdf;base64,${file.data}" download="${file.name}">Download PDF</a></p>
      </object>
    `;
  }
  else if (file.type?.startsWith('audio/')) {
    // Audio files
    previewContent.innerHTML = `
      <audio controls style="width:100%; margin-top:20px;">
        <source src="data:${file.type};base64,${file.data}" type="${file.type}">
        Your browser doesn't support audio playback.
      </audio>
      <div style="margin-top:10px;">${file.name}</div>
    `;
  }
  else if (file.type?.startsWith('video/')) {
    // Video files
    previewContent.innerHTML = `
      <video controls style="max-width:100%; max-height:100%;">
        <source src="data:${file.type};base64,${file.data}" type="${file.type}">
        Your browser doesn't support video playback.
      </video>
    `;
  }
  else {
    // Unsupported files
    previewContent.innerHTML = `
      <div style="padding:20px; text-align:center;">
        <p>Cannot preview ${file.name}</p>
        <p><a href="data:${file.type};base64,${file.data}" download="${file.name}">Download file</a></p>
      </div>
    `;
  }
}

function maximizeCurrentFile() {
  if (!currentFile) return;
  
  const dataUrl = `data:${currentFile.type};base64,${currentFile.data}`;
  const newWindow = window.open('', '_blank');
  
  if (!newWindow) return;
  
  setTimeout(() => {
    try {
      let content = '';
      if (currentFile.type.startsWith('image/')) {
        content = `<img src="${dataUrl}" alt="${currentFile.name}" style="max-width:100vw;max-height:100vh;object-fit:contain;">`;
      } 
      else if (currentFile.type === 'text/plain' || currentFile.name.endsWith('.txt')) {
        const text = atob(currentFile.data).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        content = `<pre style="margin:0;padding:0;white-space:pre-wrap;">${text}</pre>`;
      }
      else if (currentFile.type.startsWith('audio/')) {
        content = `<audio controls style="margin:0;padding:0;"><source src="${dataUrl}" type="${currentFile.type}"></audio>`;
      }
      else if (currentFile.type.startsWith('video/')) {
        content = `<style>body {background:#000;display:flex;align-items:center;justify-content:center;}</style><video controls style="max-width:100vw;max-height:100vh;"><source src="${dataUrl}" type="${currentFile.type}"></video>`;
      }
      else if (currentFile.type === 'application/pdf') {
        content = `<embed src="${dataUrl}" type="application/pdf" width="100%" style="height:100vh">`;
      }
      else {
        // For other files, just download them
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = currentFile.name;
        a.click();
        newWindow.close();
        return;
      }

      newWindow.document.write(`
        <!DOCTYPE html>
        <html style="overflow:hidden;">
        <head>
          <title>${currentFile.name}</title>
          <style>
            body { margin: 0; padding: 0; background: #fff; min-height: 100vh; }
          </style>
        </head>
        <body>${content}</body>
        </html>
      `);
      newWindow.document.close();
    } catch (e) {
      console.error('Error opening file:', e);
    }
  }, 100);
}

});
