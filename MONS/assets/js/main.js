const frame = document.getElementById('game');
const buttons = document.querySelectorAll('.controls');
    
buttons.forEach(button => {
    button.addEventListener('click', () => {
        frame.contentWindow.postMessage({
            action: button.classList.contains('up') ? 'up' : 
                    button.classList.contains('down') ? 'down' : 
                    'select'
        }, 'https://ismailhromcik95.github.io');
    });
});
