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

const joinModal = document.getElementById("joinModal");
const joinTrigger = document.querySelector(".server-icon.join");
const joinCloseBtns = joinModal.querySelectorAll(".close, .back");
const inputJoin = document.querySelector(".input-join");
const inputJoinCont = document.querySelector(".input-join-cont");
const joinBtn2 = document.getElementById("joinBtn2");

function handleJoinSubmit() {
  const value = inputJoin.value.trim();
  const isValid = value.startsWith("https://discord.gg/");

  if (isValid) {
    inputJoinCont.classList.remove("invalid");
    window.open(value, "_blank");

    joinModal.style.display = "none";
  } else {
    inputJoinCont.classList.add("invalid");
  }
}

joinTrigger.addEventListener("click", () => {
  joinModal.style.display = "flex";
});

joinCloseBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    joinModal.style.display = "none";
  });
});

window.addEventListener("click", (event) => {
  if (event.target === joinModal) {
    joinModal.style.display = "none";
  }
});

inputJoin.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleJoinSubmit();
  }
});

joinBtn2.addEventListener("click", () => {
  handleJoinSubmit();
});

const channels = document.querySelectorAll('.channels-bar p');
const mainSections = document.querySelectorAll('.main');
const userList = document.querySelector('.user-list');
const iconUserList = document.querySelector('.icon-user-list')
const hamburger = document.querySelector('.icon-hamburger');
const channelBar = document.querySelector('.channels-bar');


  hamburger.addEventListener('click', () => {
    channelBar.classList.toggle('visible');
  });

  iconUserList.addEventListener('click', () => {
    userList.classList.toggle('visible');
    iconUserList.classList.toggle('visible');
  });


  channels.forEach(channel => {
    channel.addEventListener('click', () => {
      channels.forEach(c => c.classList.remove('selected'));
      channel.classList.add('selected');
      channelBar.classList.toggle('visible');

      mainSections.forEach(section => section.classList.add('hidden'));

      const targetClass = channel.textContent.trim();
      const targetSection = document.querySelector(`.main.${targetClass}`);
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }

      window.location.hash = targetClass;

      if (userList) {
        if (targetClass === 'spam') {
          userList.classList.add('spam');
        } else {
          userList.classList.remove('spam');
        }
      }
    });
  });


  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const targetSection = document.querySelector(`.main.${hash}`);
    const targetChannel = Array.from(channels).find(c => c.textContent.trim() === hash);
    if (targetSection && targetChannel) {
      channels.forEach(c => c.classList.remove('selected'));
      targetChannel.classList.add('selected');
      mainSections.forEach(section => section.classList.add('hidden'));
      targetSection.classList.remove('hidden');

      if (userList && hash === 'spam') {
        userList.classList.add('spam');
      }
    }
  }

  function activateChannelFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const targetSection = document.querySelector(`.main.${hash}`);
    const targetChannel = Array.from(channels).find(
      c => c.textContent.trim() === hash
    );

    if (targetSection && targetChannel) {
      channels.forEach(c => c.classList.remove('selected'));
      mainSections.forEach(section => section.classList.add('hidden'));

      targetChannel.classList.add('selected');
      targetSection.classList.remove('hidden');

      if (userList) {
        if (hash === 'spam') {
          userList.classList.add('spam');
        } else {
          userList.classList.remove('spam');
        }
      }
      updateUserCount();
    }
  }

activateChannelFromHash();
window.addEventListener('hashchange', activateChannelFromHash);

  const spamInput = document.querySelector('.spam .input-active');
  const spamBox = document.querySelector('.spam .chat-box');
  const scrollBtn = document.getElementById("scrollToBottom");
  const savedMessages = JSON.parse(localStorage.getItem('spamMessages')) || [];

  savedMessages.forEach((msg, index) => {
    const wrapper = createMessageWrapper(msg.text, index === 0, msg.id);
    spamBox.appendChild(wrapper);
  });

  requestAnimationFrame(() => {
    chatBox.forEach(box => {
      if (!box) return;
      box.scrollTop = box.scrollHeight - box.clientHeight;
    });
  });


spamInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const text = spamInput.value.trim();
    if (!text) return;

  if (editingMsgWrapper) {
    const p = editingMsgWrapper.querySelector("p");
    if (p) {
      p.textContent = text;
      const id = editingMsgWrapper.dataset.msgId;
      const index = savedMessages.findIndex(m => m.id === id);
      if (index > -1) {
        savedMessages[index].text = text;
        localStorage.setItem('spamMessages', JSON.stringify(savedMessages));
      }
    }
    editingMsgWrapper = null;
    spamInput.value = '';
    return;
  }

  let finalText = text;

    if (replyingToMsg) {
      finalText = `<blockquote>@<span class="user">${replyingToUser}</span> ${replyingToMsg}</blockquote><p>${text}</p>`;
      replyingToMsg = null;
      replyingToUser = null;
      const replyBanner = document.getElementById("replyBanner");
      if (replyBanner) replyBanner.classList.add("hidden");
    }

    const isFirst = savedMessages.length === 0;
    const id = Date.now().toString();
    const wrapper = createMessageWrapper(finalText, isFirst, id);
    spamBox.appendChild(wrapper);

    savedMessages.push({ id, text: finalText });
    localStorage.setItem('spamMessages', JSON.stringify(savedMessages));

    spamInput.value = '';

    spamBox.scrollTo({
      top: spamBox.scrollHeight,
      behavior: 'smooth'
    });
  }

});


if (spamBox && scrollBtn) {
  let isAutoScrolling = false;

  spamBox.addEventListener("scroll", () => {
    const atBottom = spamBox.scrollTop + spamBox.clientHeight >= spamBox.scrollHeight - 1; 

    if (isAutoScrolling) {
      if (atBottom) {
        scrollBtn.classList.add("hidden");
        isAutoScrolling = false;
      }
      return;
    }

    if (atBottom) {
      scrollBtn.classList.add("hidden");
    } else {
      scrollBtn.classList.remove("hidden");
    }
  });

  scrollBtn.addEventListener("click", () => {
    isAutoScrolling = true;
    scrollBtn.classList.add("hidden");
    spamBox.scrollTo({
      top: spamBox.scrollHeight,
      behavior: "smooth"
    });
  });

  spamInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      isAutoScrolling = true;
      spamBox.scrollTo({
        top: spamBox.scrollHeight,
        behavior: "smooth"
      });
    }
  });
}


const typingIndicator = document.getElementById("is_typing");

if (spamInput && typingIndicator) {
  spamInput.addEventListener("input", () => {
    if (spamInput.value.trim().length > 0) {
      typingIndicator.classList.remove("hidden");
    } else {
      typingIndicator.classList.add("hidden");
    }
  });

  spamInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      typingIndicator.classList.add("hidden");
    }
  });
}

  function createMessageWrapper(text, isFirst, id) {

    const processedText = text.replace(/:([\w-]+):/g, (match, emojiCode) => {
    const emojiElement = document.querySelector(`[data-emoji="${emojiCode}"]`);
    if (emojiElement) {
      return `<span class="emoji">${emojiElement.textContent}</span>`;
    }
    return match;
  });

    const wrapper = document.createElement('div');
    wrapper.className = isFirst ? 'msgWrapper' : 'msgWrapper no-img';
    wrapper.dataset.msgId = id;

    if (isFirst) {
      wrapper.className = 'msgWrapper';

      const img = document.createElement('div');
      img.className = 'displayPhoto';

      const allMessages = document.createElement('div');
      allMessages.className = 'allMessages';

      const senderInfo = document.createElement('p');
      senderInfo.className = 'senderInfo';
      senderInfo.title = '';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'user';
      nameSpan.textContent = 'User';

      const timestampSpan = document.createElement('span');
      timestampSpan.className = 'timestamp';
      timestampSpan.textContent = formatDate(new Date());

      senderInfo.appendChild(nameSpan);
      senderInfo.appendChild(timestampSpan);

      const msgBody = document.createElement('div');
      msgBody.className = 'msgBody';

      const p = document.createElement('p');
      p.innerHTML = processedText;
      msgBody.appendChild(p);

      allMessages.appendChild(senderInfo);
      allMessages.appendChild(msgBody);

      wrapper.appendChild(img);
      wrapper.appendChild(allMessages);
    } else {
      wrapper.className = 'msgWrapper no-img';

      const allMessages = document.createElement('div');
      allMessages.className = 'allMessages';

      const msgBody = document.createElement('div');
      msgBody.className = 'msgBody';

      const p = document.createElement('p');
      p.innerHTML = processedText;
      msgBody.appendChild(p);

      allMessages.appendChild(msgBody);
      wrapper.appendChild(allMessages);
    }
    return wrapper;
  }

  const emojiToggle = document.getElementById('emojiTrayToggle');
  const emojiTray = document.getElementById('emojiTray');

  emojiToggle.addEventListener('click', () => {
    emojiTray.classList.toggle('hidden');
  });

  const emojiGridItems = document.querySelectorAll('.emojiInGrid[data-emoji]');

  emojiGridItems.forEach(item => {
    item.addEventListener('click', () => {
      const emojiCode = item.getAttribute('data-emoji');
      const emojiChar = item.textContent;
      
      item.dataset.char = emojiChar;
      
      spamInput.value += `:${emojiCode}:`;
      spamInput.focus();
    });
  });

  const originalSpamInputHandler = spamInput.addEventListener;

  const autoHrefLinks = document.querySelectorAll('.auto-href');
  autoHrefLinks.forEach(link => {
    link.href = encodeURI(link.textContent.trim());
  });

  function formatDate(date) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  const replyBanner = document.getElementById("replyBanner");
  const replyCancelBtn = replyBanner ? replyBanner.querySelector(".cancel") : null;

  if (replyCancelBtn) {
    replyCancelBtn.addEventListener("click", () => {
      replyBanner.classList.add("hidden");
      replyingToMsg = null;
      replyingToUser = null;
      spamInput.value = "";
    });
  }

  const ctxMenu = document.createElement("div");
  ctxMenu.id = "ctxMenu";
  ctxMenu.classList.add("hidden");

  ["Delete", "Copy Text", "Reply", "Hide", "Edit"].forEach(label => {
    const option = document.createElement("div");
    option.className = "ctxMenuOption";
    option.textContent = label;
    ctxMenu.appendChild(option);
  });

  document.body.appendChild(ctxMenu);

  document.addEventListener("click", (event) => {
    if (!ctxMenu.contains(event.target)) {
      ctxMenu.classList.add("hidden");
      targetMsgWrapper = null;
    }
  });

  let targetMsgWrapper = null;
  let editingMsgWrapper = null;
  let replyingToMsg = null;
  let replyingToUser = null;

  if (spamBox) {
    spamBox.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const wrapper = event.target.closest(".msgWrapper");
      if (!wrapper) return;

      targetMsgWrapper = wrapper;

      const menuWidth = ctxMenu.offsetWidth;
      const menuHeight = ctxMenu.offsetHeight;
      const pageWidth = window.innerWidth;
      const pageHeight = window.innerHeight;

      let posX = event.clientX;
      let posY = event.clientY;

      if (posX + menuWidth > pageWidth) {
        posX = pageWidth - menuWidth - 5;
      }

      if (posY + menuHeight > pageHeight) {
        posY = pageHeight - menuHeight - 5;
      }

      ctxMenu.style.top = `${posY}px`;
      ctxMenu.style.left = `${posX}px`;
      ctxMenu.classList.remove("hidden");
    });
  }

  ctxMenu.addEventListener("click", (event) => {
    if (!targetMsgWrapper) return;

    const option = event.target.closest(".ctxMenuOption");
    if (!option) return;

    const action = option.textContent.trim();

    if (action === "Delete") {
      const id = targetMsgWrapper.dataset.msgId;
      const index = savedMessages.findIndex(m => m.id === id);
      if (index > -1) {
        savedMessages.splice(index, 1);
        localStorage.setItem('spamMessages', JSON.stringify(savedMessages));
      }
      targetMsgWrapper.remove();
    }

    if (action === "Copy Text") {
      const p = targetMsgWrapper.querySelector(".msgBody p");
      if (p) {
        navigator.clipboard.writeText(p.textContent)
          .then(() => console.log("Copied:", p.textContent))
          .catch(err => console.error("Copy failed", err));
      }
    }

    if (action === "Reply") {
      const p = targetMsgWrapper.querySelector(".msgBody p");
      if (p) {
        const replyBanner = document.getElementById("replyBanner");
        if (replyBanner) {
          replyBanner.classList.remove("hidden");
        }
        replyingToMsg = p.textContent;

        const nameSpan = targetMsgWrapper.querySelector(".name");
        replyingToUser = nameSpan ? nameSpan.textContent : "user";

        spamInput.focus();
      }
    }


    if (action === "Hide") {
      const p = targetMsgWrapper.querySelector(".msgBody p");
      if (p) {
        p.textContent = "[ This message was hidden by a moderator ]";
        const id = targetMsgWrapper.dataset.msgId;
        const index = savedMessages.findIndex(m => m.id === id);
        if (index > -1) {
          savedMessages[index].text = p.textContent;
          localStorage.setItem('spamMessages', JSON.stringify(savedMessages));
        }
      }
    }

    if (action === "Edit") {
      const p = targetMsgWrapper.querySelector(".msgBody p");
      if (p) {
        spamInput.value = p.textContent;
        editingMsgWrapper = targetMsgWrapper;
        spamInput.focus();
      }
    }

  ctxMenu.classList.add("hidden");
  targetMsgWrapper = null;
  });

});