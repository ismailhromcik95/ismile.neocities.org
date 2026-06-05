document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".games .input-active");
  const gamesWrap = document.querySelector(".games .games-wrap");

  if (!input || !gamesWrap) return;

  let activeIframe = null;

  const arcadeGames = [
    "asteroids",
    "breakout",
    "pacman",
    "skifree",
    "snake",
    "spaceinvaders"
  ];

  function removeIframe() {
    if (activeIframe) {
      activeIframe.remove();
      activeIframe = null;
    }
  }

  function createIframe({ src, className }) {
    removeIframe();

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.id = "gameWindow";
    iframe.className = className;
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("tabindex", "0");

    gamesWrap.appendChild(iframe);
    activeIframe = iframe;

    requestAnimationFrame(() => {
      iframe.focus();
    });

  }

  function handleCommand(command) {
    if (arcadeGames.includes(command)) {
      createIframe({
        src: `https://onio.cafe/arcade/${command}`,
        className: "onio-minigames"
      });
      return;
    }

    if (command === "mons") {
      createIframe({
        src: "https://ismailhromcik95.github.io/ismile.neocities.org/MONS/",
        className: "mons"
      });
      return;
    }

    if (command === "blob") {
      createIframe({
        src: "https://onio.cafe/blob/blob058",
        className: "blob"
      });
      return;
    }

    if (command === "blob2") {
      window.open("https://onio.cafe/blob/", "_blank");
      return;
    }

    if (command === "vibesquest") {
      window.open("https://vibes.fish/", "_blank");
      return;
    }

    alert("Game not found.");
  }

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const value = input.value.trim().toLowerCase();
    input.value = "";

    if (!value.startsWith("!")) {
      alert("Game not found. Commands must start with !");
      return;
    }

    const command = value.slice(1);
    handleCommand(command);
  });

  document.addEventListener("click", (e) => {
    if (!activeIframe) return;

    if (
      !activeIframe.contains(e.target) &&
      !gamesWrap.contains(e.target)
    ) {
      removeIframe();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeIframe();
    }
  }, true);
});
