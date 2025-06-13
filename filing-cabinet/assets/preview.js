console.log('Preview.js loaded');

// Message listener for parent
window.addEventListener('message', (event) => {
  // Accept messages from parent only - FIXED origin check
  if (!event.origin.includes('neocities.org')) return;
  
  console.log('Preview window received message:', event.data);
  
  if (event.data.type === 'PREVIEW_FILE') {
    previewFile(event.data.file);
  }
});

function previewFile(file) {
  console.log('Preview file called with:', file);
  
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
              height="100%"
              style="border:none;">
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
