const blipSound = new Audio('assets/audio/blip.mp3');

const frame = document.getElementById('game');
const buttons = document.querySelectorAll('.controls');
    
buttons.forEach(button => {
    button.addEventListener('click', () => {
        blipSound.currentTime = 0;
        blipSound.play().catch(e => console.log("Audio play failed:", e));
        
        frame.contentWindow.postMessage({
            action: button.classList.contains('up') ? 'up' : 
                   button.classList.contains('down') ? 'down' : 
                   'select'
        }, '*'); // Replace '*' with your domain in production
    });
});
