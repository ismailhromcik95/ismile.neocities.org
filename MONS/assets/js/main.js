const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// Global function to trigger file selection
window.triggerFileUpload = () => {
  return new Promise((resolve) => {
    fileInput.onchange = (e) => resolve(e.target.files[0]);
    fileInput.click(); // This will now work because it's called from a user-triggered event
  });
};

const blipSound = new Audio('assets/audio/blip.mp3');
const frame = document.getElementById('game');
const buttons = document.querySelectorAll('.controls');

window.addEventListener('message', (event) => {
    if (event.data.eggType === 'fire') {
        document.documentElement.style.setProperty('--main-color', 'orange');
        document.documentElement.style.setProperty('--frame-color', 'blue');

        const artElement = document.querySelector('.art');
        artElement.style.setProperty('background-image', 'url("assets/img/mons/digimon/gen1/lvl1/botamon/art.png")');
    }

    if (event.data.type === 'refresh') {
        window.location.reload();
    }

      if (event.data.type === 'requestFileUpload') {
        window.triggerFileUpload().then((file) => {
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const monData = JSON.parse(e.target.result);
              // Save to localStorage
              localStorage.setItem('monName', monData.name);
              localStorage.setItem('monSpecies', monData.species);
              localStorage.setItem('monFamily', monData.family);
              localStorage.setItem('selectedEggType', monData.type);
              localStorage.setItem('monLevel', monData.level);
              localStorage.setItem('monAge', monData.age);
              localStorage.setItem('monHunger', monData.hunger);
              localStorage.setItem('lastFedTime', monData.feed_time);
              localStorage.setItem('hatchTimestamp', monData.hatch_date);
              localStorage.setItem('lastCleanTime', monData.clean_time);
              localStorage.setItem('poopCount', monData.poop_count);
              localStorage.setItem('monStatus', monData.status);

              // Notify the iframe
              event.source.postMessage({ type: 'uploadComplete' }, '*');
            };
            reader.readAsText(file);
          }
        });
      }
});

document.addEventListener('DOMContentLoaded', function() {
  const gameFrame = document.getElementById('game');
  
  // Check if localStorage has any MON data
  const hasMonData = localStorage.getItem('monName') || 
                     localStorage.getItem('selectedEggType');
  
  // Load appropriate page based on storage
  gameFrame.src = hasMonData ? 'mon.html' : 'main-menu.html';

  // Rest of your existing code (audio, button handlers, etc.)...
  const blipSound = new Audio('assets/audio/blip.mp3');
  const buttons = document.querySelectorAll('.controls');


    const eggType = localStorage.getItem('selectedEggType');
    
    if (eggType === 'fire') {
        document.documentElement.style.setProperty('--main-color', 'orange');
        document.documentElement.style.setProperty('--frame-color', 'blue');

        const artElement = document.querySelector('.art');
        artElement.style.setProperty('background-image', 'url("assets/img/mons/digimon/gen1/lvl1/botamon/art.png")');
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
