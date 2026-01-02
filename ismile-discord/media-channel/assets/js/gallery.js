const supabaseUrl = "https://fiurqqputmfznyirozay.supabase.co";
const supabaseKey = "sb_publishable_qaIoJ3yHohnSAvP3zqOnlA_4lfoIURg";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const clientId = "eb13b27aceb4246";

let myName = null;
let myUID = null;

window.addEventListener("message", (event) => {
  if (event.origin !== "https://ismile.neocities.org") return;

  const { uid, username } = event.data;
  myUID = uid;
  myName = username;
  console.log("Received identity from parent page:", myName, myUID);
});

const chatBox = document.querySelector(".chat-box");
const inputField = document.querySelector(".input-active");
const uploadBtn = document.querySelector(".image-upload");

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const description = inputField.value.trim();

  const formData = new FormData();
  formData.append("image", file);
  if (description) formData.append("description", description);

  try {
    const res = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${clientId}`
      },
      body: formData
    });

    const data = await res.json();
    if (!data.success) {
      alert("Upload failed.");
      return;
    }

    const imageUrl = data.data.link;
    const timestamp = new Date().toISOString();

    const { error } = await supabaseClient.from("media").insert([
      {
        uid: myUID,
        username: myName,
        url: imageUrl,
        description: description,
        created_at: timestamp
      }
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Failed to save to database.");
      return;
    }

    inputField.value = "";
    fileInput.value = "";

    await refreshGallery();

  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed due to network error.");
  }
});

inputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (inputField.value.trim() !== "") {
      alert("Please include an image with your message.");
    }
  }
});

function renderMessage(msg) {
  const wrapper = document.createElement("div");
  wrapper.className = "msgWrapper";
  wrapper.setAttribute("data-uid", msg.uid);

  const displayPhoto = document.createElement("div");
  displayPhoto.className = "displayPhoto";

  const allMessages = document.createElement("div");
  allMessages.className = "allMessages";

  const senderInfo = document.createElement("p");
  senderInfo.className = "senderInfo";

  const nameSpan = document.createElement("span");
  nameSpan.className = "username";
  nameSpan.textContent = msg.username;

  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  const date = new Date(msg.created_at);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  timestampSpan.textContent = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  senderInfo.appendChild(nameSpan);
  senderInfo.appendChild(timestampSpan);

  const msgBody = document.createElement("div");
  msgBody.className = "msgBody";

  if (msg.description && msg.description.trim() !== "") {
    const p = document.createElement("p");
    p.textContent = msg.description;
    p.style.whiteSpace = "pre-wrap";
    msgBody.appendChild(p);
  }

  const imageEl = document.createElement("img");
  imageEl.src = msg.url;
  msgBody.appendChild(imageEl);

  allMessages.appendChild(senderInfo);
  allMessages.appendChild(msgBody);

  wrapper.appendChild(displayPhoto);
  wrapper.appendChild(allMessages);

  chatBox.appendChild(wrapper);
}

async function refreshGallery() {
  try {
    const { data: messages, error } = await supabaseClient
      .from("media")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    chatBox.innerHTML = "";
    if (messages) {
      messages.forEach(renderMessage);
    }

    requestAnimationFrame(() => {
      chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
    });
  } catch (err) {
    console.error("Refresh error:", err);
  }
}

document.addEventListener("DOMContentLoaded", refreshGallery);
