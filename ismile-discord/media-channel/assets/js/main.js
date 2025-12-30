document.addEventListener('DOMContentLoaded', () => {

  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.querySelector(".close");
  const postImages = document.querySelectorAll(".msgBody img");
  const chatBox = document.querySelectorAll(".chat-box");

  chatBox.forEach(box => {
    box.addEventListener("click", (event) => {
      const img = event.target.closest(".msgBody img");
      if (img) {
        modal.style.display = "flex";
        modalImg.src = img.src;
      }
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  const scrollBtn = document.getElementById("scrollToBottom");
  const mediaContent = document.querySelector(".content");

  requestAnimationFrame(() => {
    if (!mediaContent) return;
    mediaContent.scrollTop = mediaContent.scrollHeight - mediaContent.clientHeight;
  });

const typingIndicator = document.getElementById("is_typing");
const inputActive  = document.querySelector('.input-active');

if (inputActive && typingIndicator) {
  inputActive.addEventListener("input", () => {
    if (inputActive.value.trim().length > 0) {
      typingIndicator.classList.remove("hidden");
    } else {
      typingIndicator.classList.add("hidden");
    }
  });

  inputActive.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      typingIndicator.classList.add("hidden");
    }
  });
}

});
