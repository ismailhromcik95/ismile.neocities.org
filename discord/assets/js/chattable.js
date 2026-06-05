chattable.initialize({
  stylesheet: "assets/css/chattable.css",
});

const onlineListElement = document.getElementById("onlineList");
let myName = null;
let myUID = null;

chattable.on("ready", function() {
  console.log("Chattable ready, user object:", chattable.user);
  if (chattable.user) {
    myName = chattable.user.name;
    myUID = chattable.user.uid;
    console.log("My info - Name:", myName, "UID:", myUID);
    if (myName) updateUserNameElements();
    if (myUID) updateSpamUserList();
    sendIdentityToIframe();
  }
});


chattable.on("load", function() {
  console.log("Chattable loaded");
  if (chattable.user && chattable.user.name && !myName) {
    myName = chattable.user.name;
    myUID = chattable.user.uid || myUID;
    updateUserNameElements();
    updateSpamUserList();
    sendIdentityToIframe(); // NEW
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM ready, checking for initial user info...");
  if (chattable.user && chattable.user.name) {
    myName = chattable.user.name;
    myUID = chattable.user.uid;
    updateUserNameElements();
    updateSpamUserList();
    sendIdentityToIframe(); // NEW
  }
  setTimeout(() => {
    if (!myName && chattable.user && chattable.user.name) {
      myName = chattable.user.name;
      myUID = chattable.user.uid;
      updateUserNameElements();
      updateSpamUserList();
      sendIdentityToIframe(); // NEW
    }
  }, 1000);
});


function sendIdentityToIframe() {
  const mediaIframe = document.getElementById("mediaGit");
  if (mediaIframe && myName && myUID) {
    mediaIframe.contentWindow.postMessage(
      { uid: myUID, username: myName },
      "https://ismailhromcik95.github.io"
    );
    console.log("Sent identity to iframe:", myName, myUID);
  }
}

chattable.on("connection", function (list) {
  console.log("Connection event, list:", list);
  onlineList = list;
  onlineListElement.innerHTML = "";

  Object.entries(onlineList).forEach(([uid, name]) => {
    const item = document.createElement("li");
    item.textContent = name;
    item.classList.add("list-item");
    item.setAttribute("data-uid", uid);
    
    onlineListElement.appendChild(item);
  });
  
  updateUserCount();
  
  if (!myName && chattable.user && chattable.user.name) {
    myName = chattable.user.name;
    myUID = chattable.user.uid;
    updateUserNameElements();
    updateSpamUserList();
  }
});

function updateUserNameElements() {
  if (!myName) return;
  
  const userElements = document.querySelectorAll('.user');
  console.log(`Updating ${userElements.length} .user elements with name: ${myName}`);
  
  userElements.forEach(element => {
    element.textContent = myName;
  });
}

function updateSpamUserList() {
  if (!myUID) return;
  
  const spamUserList = document.querySelector('.user-list.spam p');
  if (spamUserList) {
    spamUserList.setAttribute('data-uid', myUID);
    console.log("Set data-uid on spam user list:", myUID);
  }
  
  const spamMsgWrappers = document.querySelectorAll('.spam .chat-box .msgWrapper');
  spamMsgWrappers.forEach(wrapper => {
    wrapper.setAttribute('data-uid', myUID);
  });
  
  if (spamMsgWrappers.length > 0) {
    console.log(`Set data-uid on ${spamMsgWrappers.length} message wrappers:`, myUID);
  }
  
  const userList = document.querySelector('.user-list');
  if (userList) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            userList.classList.contains('spam')) {
          const p = userList.querySelector('p');
          if (p && !p.hasAttribute('data-uid')) {
            p.setAttribute('data-uid', myUID);
            console.log("Set data-uid on spam user list (dynamic):", myUID);
          }
          
          const dynamicMsgWrappers = document.querySelectorAll('.spam .chat-box .msgWrapper');
          dynamicMsgWrappers.forEach(wrapper => {
            if (!wrapper.hasAttribute('data-uid')) {
              wrapper.setAttribute('data-uid', myUID);
            }
          });
          
          if (dynamicMsgWrappers.length > 0) {
            console.log(`Set data-uid on ${dynamicMsgWrappers.length} dynamic message wrappers:`, myUID);
          }
        }
      });
    });
    
    observer.observe(userList, { attributes: true });
  }
  
  const spamChatBox = document.querySelector('.spam .chat-box');
  if (spamChatBox) {
    const msgObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.classList && node.classList.contains('msgWrapper')) {
              if (!node.hasAttribute('data-uid')) {
                node.setAttribute('data-uid', myUID);
                console.log("Set data-uid on newly added message wrapper:", myUID);
              }
            }
          });
        }
      });
    });
    
    msgObserver.observe(spamChatBox, { childList: true, subtree: false });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM ready, checking for initial user info...");
  
  if (chattable.user && chattable.user.name) {
    myName = chattable.user.name;
    myUID = chattable.user.uid;
    updateUserNameElements();
    updateSpamUserList();
  }
  
  setTimeout(() => {
    if (!myName && chattable.user && chattable.user.name) {
      myName = chattable.user.name;
      myUID = chattable.user.uid;
      updateUserNameElements();
      updateSpamUserList();
    }
  }, 1000);
});

function updateUserCount() {
  const list = document.getElementById("onlineList");
  const userNumber = document.getElementById("userNumber");
  
  const selectedChannel = document.querySelector('.channels-bar p.selected');
  const isSpamSelected = selectedChannel && selectedChannel.textContent.trim() === 'spam';
  
  if (isSpamSelected) {
    userNumber.textContent = "1";
  } else {
    const count = list.querySelectorAll("li").length;
    userNumber.textContent = count;
  }
}

updateUserCount();

const list = document.getElementById("onlineList");
if (list) {
  const observer = new MutationObserver(updateUserCount);
  observer.observe(list, { childList: true, subtree: false });
}