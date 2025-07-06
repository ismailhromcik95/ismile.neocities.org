const blipSound = new Audio('assets/audio/blip.mp3');
const frame = document.getElementById('game');
const buttons = document.querySelectorAll('.controls');

// Add message listener for color changes
window.addEventListener('message', (event) => {
    if (event.data.type === 'eggSelected' && event.data.eggType === 'fire') {
        // Change colors
        document.documentElement.style.setProperty('--main-color', 'orange');
        document.documentElement.style.setProperty('--frame-color', 'blue');
        
        // Save to localStorage
        localStorage.setItem('mainColor', 'orange');
        localStorage.setItem('frameColor', 'blue');
    }
});

// Load saved colors on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedMainColor = localStorage.getItem('mainColor');
    const savedFrameColor = localStorage.getItem('frameColor');
    
    if (savedMainColor) {
        document.documentElement.style.setProperty('--main-color', savedMainColor);
    }
    if (savedFrameColor) {
        document.documentElement.style.setProperty('--frame-color', savedFrameColor);
    }
});

buttons.forEach(button => {
    button.addEventListener('click', () => {
        blipSound.currentTime = 0;
        blipSound.play().catch(e => console.log("Audio play failed:", e));
        
        frame.contentWindow.postMessage({
            action: button.classList.contains('up') ? 'up' : 
                   button.classList.contains('down') ? 'down' : 
                   'select'
        }, '*');
    });
});
