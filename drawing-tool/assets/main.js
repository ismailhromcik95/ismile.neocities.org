// Get the canvases and their contexts
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');
const drawingCanvas = document.getElementById('drawing-canvas');
const drawingCtx = drawingCanvas.getContext('2d');

let isDrawing = false;
let undoStack = [];
let redoStack = [];
let currentTool = 'draw'; // Current tool: 'draw' or 'erase'
let isGridVisible = false; // Track grid visibility

// Function to resize the canvas dynamically
function resizeCanvas() {
  const parent = drawingCanvas.parentElement;
  gridCanvas.width = drawingCanvas.width = parent.clientWidth;
  gridCanvas.height = drawingCanvas.height = parent.clientHeight;
  drawGrid(); // Redraw the grid if needed
}

// Resize on window load and resize event
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Function to show a popup with markdown link
function showPopupWithMarkdown(url) {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '5.5px';
  popup.style.left = '25%';
  popup.style.width = '50%';
  popup.style.background = '#fff';
  popup.style.padding = '25px';
  popup.style.border = '1px solid #ccc';
  popup.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
  popup.style.zIndex = '1000';
  popup.style.textAlign = 'center';
  popup.style.fontSize = '14px';
  popup.style.display = 'flex';
  popup.style.flexDirection = 'column';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';

  const message = document.createElement('p');
  message.textContent = "Drawing submitted! Copy this into your clipboard and paste it into the chat:";
  message.style.marginTop = '0';

  const textArea = document.createElement('textarea');
  textArea.value = `![](${url})`;
  textArea.style.width = '60%';
  textArea.style.height = '18px';
  textArea.readOnly = true;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.marginTop = '10px';
  closeButton.style.display = 'block';
  closeButton.style.width = 'fit-content';
  closeButton.addEventListener('click', () => document.body.removeChild(popup));

  popup.appendChild(message);
  popup.appendChild(textArea);
  popup.appendChild(closeButton);
  document.body.appendChild(popup);
}

// Function to get scaled coordinates
function getScaledCoordinates(e) {
  const rect = drawingCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (drawingCanvas.width / rect.width),
    y: (e.clientY - rect.top) * (drawingCanvas.height / rect.height)
  };
}

// Create a custom cursor
const cursor = document.createElement('div');
cursor.id = 'custom-cursor'; // Add an ID for styling
cursor.style.position = 'fixed'; // Use fixed positioning
cursor.style.borderRadius = '50%';
cursor.style.pointerEvents = 'none';
cursor.style.display = 'none';
document.body.appendChild(cursor);

// Update cursor size and color based on slider and color picker
function updateCursor() {
  const size = document.getElementById('resize-slider').value;
  const color = document.getElementById('color-picker').value;

  cursor.style.width = `${size}px`;
  cursor.style.height = `${size}px`;
  cursor.style.backgroundColor = color;
  cursor.style.border = '1px solid #000'; // Add a border for better visibility
}

// Move the cursor with the mouse
drawingCanvas.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX - cursor.offsetWidth / 2}px`;
  cursor.style.top = `${e.clientY - cursor.offsetHeight / 2}px`;
});

// Show/hide the cursor when entering/leaving the canvas
drawingCanvas.addEventListener('mouseleave', () => {
  cursor.style.display = 'none';
});

drawingCanvas.addEventListener('mouseenter', () => {
  if (currentTool === 'draw') {
    cursor.style.display = 'block'; // Show custom dot cursor
  }
});

// Update cursor when slider or color picker changes
document.getElementById('resize-slider').addEventListener('input', updateCursor);
document.getElementById('color-picker').addEventListener('input', updateCursor);

// Initialize cursor
updateCursor();

// Detect touch devices
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Set up drawing functionality for both mouse and touch
drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
drawingCanvas.addEventListener('mouseup', stopDrawing);
drawingCanvas.addEventListener('mouseleave', stopDrawing);

if (isTouchDevice()) {
  drawingCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    startDrawing(e.touches[0]); // Use the first touch point
  });

  drawingCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    draw(e.touches[0]); // Use the first touch point
  });

  drawingCanvas.addEventListener('touchend', stopDrawing);
}

// Start drawing or erasing
function startDrawing(e) {
  isDrawing = true;
  if (currentTool === 'draw') {
    const coords = getScaledCoordinates(e);
    drawingCtx.beginPath();
    drawingCtx.moveTo(coords.x, coords.y);
  }
  saveState();
}

function stopDrawing() {
  isDrawing = false;
  if (currentTool === 'draw') {
    drawingCtx.beginPath();
  }
}

function draw(e) {
  if (!isDrawing) return;

  const coords = getScaledCoordinates(e);
  const size = document.getElementById('resize-slider').value;

  if (currentTool === 'draw') {
    // Drawing mode
    drawingCtx.lineWidth = size;
    drawingCtx.lineCap = 'round';
    drawingCtx.strokeStyle = document.getElementById('color-picker').value;

    drawingCtx.lineTo(coords.x, coords.y);
    drawingCtx.stroke();
    drawingCtx.beginPath();
    drawingCtx.moveTo(coords.x, coords.y);
  } else if (currentTool === 'erase') {
    // Erasing mode
    const halfSize = size / 2;
    drawingCtx.clearRect(coords.x - halfSize, coords.y - halfSize, size, size);
  }
}

// Draw a dot or erase based on the tool
function drawDot(e) {
  const coords = getScaledCoordinates(e);
  const size = document.getElementById('resize-slider').value / 2;
  if (currentTool === 'draw') {
    drawingCtx.beginPath();
    drawingCtx.arc(coords.x, coords.y, size, 0, Math.PI * 2);
    drawingCtx.fillStyle = document.getElementById('color-picker').value;
    drawingCtx.fill();
    drawingCtx.closePath();
  } else if (currentTool === 'erase') {
    drawingCtx.clearRect(coords.x - size, coords.y - size, size * 2, size * 2);
  }
}

// Handle single click to draw a dot or erase
drawingCanvas.addEventListener('click', (e) => {
  if (!isDrawing) { // Only draw or erase if not dragging
    drawDot(e);
    saveState(); // Save the current state for undo/redo
  }
});

// Save the current canvas state for undo/redo
function saveState() {
  const currentState = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);

  // Only push state if different from the last one
  if (
    undoStack.length === 0 ||
    !compareImageData(currentState, undoStack[undoStack.length - 1])
  ) {
    undoStack.push(currentState);
    redoStack = []; // Clear redo stack when a new action is performed
  }
}

// Compare two ImageData objects for equality
function compareImageData(data1, data2) {
  if (data1.data.length !== data2.data.length) return false;
  for (let i = 0; i < data1.data.length; i++) {
    if (data1.data[i] !== data2.data[i]) return false;
  }
  return true;
}

// Undo functionality
document.getElementById('undo-btn').addEventListener('click', () => {
  if (undoStack.length > 0) {
    redoStack.push(drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)); // Save current state to redo stack
    drawingCtx.putImageData(undoStack.pop(), 0, 0); // Restore previous state
  }
});

// Redo functionality
document.getElementById('redo-btn').addEventListener('click', () => {
  if (redoStack.length > 0) {
    undoStack.push(drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)); // Save current state to undo stack
    drawingCtx.putImageData(redoStack.pop(), 0, 0); // Restore next state
  }
});

// Get the draw, erase, grid, and color buttons
const drawBtn = document.getElementById('draw-btn');
const eraseBtn = document.getElementById('erase-btn');
const gridBtn = document.getElementById('grid-btn');
const colorBtn = document.getElementById('color-btn');

// Function to set the active tool
function setActiveTool(activeBtn, inactiveBtns) {
  activeBtn.classList.add('active-tool'); // Add active class to the active button
  inactiveBtns.forEach(btn => btn.classList.remove('active-tool')); // Remove active class from inactive buttons
}

// Draw tool
drawBtn.addEventListener('click', () => {
  currentTool = 'draw';
  drawingCanvas.style.cursor = 'none'; // Hide default cursor
  cursor.style.display = 'block'; // Show custom dot cursor
  updateCursor(); // Update the custom dot cursor
  setActiveTool(drawBtn, [eraseBtn]); // Only remove active class from erase button
});

// Erase tool
eraseBtn.addEventListener('click', () => {
  currentTool = 'erase';
  drawingCanvas.style.cursor = `url('assets/img/eraser.png') 32 0, auto`; // Set custom eraser cursor
  cursor.style.display = 'none'; // Hide custom dot cursor
  setActiveTool(eraseBtn, [drawBtn]); // Only remove active class from draw button
});

// Grid button functionality
gridBtn.addEventListener('click', function() {
  isGridVisible = !isGridVisible; // Toggle grid visibility
  drawGrid(); // Redraw the grid if visible
  // Toggle the active-tool class based on the visibility of the grid
  if (isGridVisible) {
    gridBtn.classList.add('active-tool');
  } else {
    gridBtn.classList.remove('active-tool');
  }
});

// Color button functionality
colorBtn.addEventListener('click', function() {
  document.getElementById('color-picker').click(); // Trigger the color picker
  colorBtn.classList.add('active-tool'); // Add active-tool class when color palette is shown
});

// Ensure the color button is active when the color picker is used
document.getElementById('color-picker').addEventListener('input', function() {
  colorBtn.classList.add('active-tool');
});

// Remove active-tool class when clicking outside of the color picker
document.addEventListener('click', function(event) {
  const colorPicker = document.getElementById('color-picker');
  if (!colorPicker.contains(event.target) && !colorBtn.contains(event.target)) {
    colorBtn.classList.remove('active-tool'); // Remove active-tool class when color palette is hidden
  }
});

// Initialize the active tool when the page loads
setActiveTool(drawBtn, [eraseBtn, gridBtn, colorBtn]); // Set draw button as active by default

// Draw grid on the grid canvas
function drawGrid() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height); // Clear the grid canvas

  if (isGridVisible) {
    const gridSize = 20; // Size of each grid cell
    gridCtx.strokeStyle = '#000'; // Black color for the grid
    gridCtx.lineWidth = 0.5; // Thin lines for the grid

    // Draw vertical lines
    for (let x = 0; x <= gridCanvas.width; x += gridSize) {
      gridCtx.beginPath();
      gridCtx.moveTo(x, 0);
      gridCtx.lineTo(x, gridCanvas.height);
      gridCtx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridCanvas.height; y += gridSize) {
      gridCtx.beginPath();
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(gridCanvas.width, y);
      gridCtx.stroke();
    }
  }
}

// Clear canvas functionality
document.getElementById('clear-btn').addEventListener('click', () => {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Clear the drawing canvas
  saveState(); // Save the current state for undo/redo
});

// Submit drawing
document.getElementById('submit-draw').addEventListener('click', async () => {
  const image = drawingCanvas.toDataURL('image/png'); // Convert drawing canvas to base64 image
  const uploadResult = await uploadImage(image); // Upload image to Imgur
});

// Upload image to Imgur
async function uploadImage(imageData) {
  const formData = new FormData();
  formData.append('image', imageData.split(',')[1]); // Remove the base64 prefix

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: 'Client-ID eb13b27aceb4246', // Use your Client ID here
      },
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      const imageUrl = data.data.link;
      const deleteHash = data.data.deletehash;
      const uploadTimestamp = Date.now();

      // Store the image info in localStorage
      storeImageInfo(deleteHash, uploadTimestamp, imageUrl);

      // Show popup with markdown link
      showPopupWithMarkdown(imageUrl);

      // Schedule periodic checks for expired images
      scheduleExpiredImageChecks();

      return true;
    } else {
      console.error('Failed to upload image.');
      return false;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return false;
  }
}

// Store image info in localStorage
function storeImageInfo(deleteHash, uploadTimestamp, imageUrl) {
  const imageInfo = {
    deleteHash,
    uploadTimestamp,
    imageUrl,
  };

  let images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  images.push(imageInfo);
  localStorage.setItem('uploadedImages', JSON.stringify(images));
}

// Check for expired images and delete them
async function checkForExpiredImages() {
  let images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  for (let i = images.length - 1; i >= 0; i--) {
    const image = images[i];
    if (now - image.uploadTimestamp > twentyFourHours) {
      // Image is older than 24 hours, delete it
      await deleteImage(image.deleteHash);
      images.splice(i, 1); // Remove the image from the list
    }
  }

  // Update localStorage with the remaining images
  localStorage.setItem('uploadedImages', JSON.stringify(images));
}

// Delete an image from Imgur using the deleteHash
async function deleteImage(deleteHash) {
  try {
    await fetch(`https://api.imgur.com/3/image/${deleteHash}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Client-ID eb13b27aceb4246', // Use your Client ID here
      },
    });
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Schedule periodic checks for expired images
function scheduleExpiredImageChecks() {
  // Check for expired images when the page loads
  checkForExpiredImages();

  // Check for expired images every hour
  setInterval(checkForExpiredImages, 60 * 60 * 1000);

  // Check for expired images after each new upload
  window.addEventListener('uploadComplete', checkForExpiredImages);
}

// Initialize the canvas state when the page loads
window.addEventListener('load', () => {
  saveState(); // Capture the initial state of the canvas
  scheduleExpiredImageChecks(); // Start periodic checks for expired images
});
