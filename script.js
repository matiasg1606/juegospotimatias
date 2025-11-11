const CLIENT_ID = "870da05dc0b7464e9f11a3e1ca2d5be9";
const REDIRECT_URI = "https://matiasg1606.github.io/juegospotimatias/";
const SCOPES = "user-read-private user-read-email";

let accessToken = "";

document.addEventListener("DOMContentLoaded", () => {
  const loginDiv = document.getElementById("login");
  const gameDiv = document.getElementById("game");
  const loginBtn = document.getElementById("loginBtn");

  // Si no existe alguno de estos elementos, salimos
  if (!loginDiv || !gameDiv || !loginBtn) {
    console.error("Error: faltan elementos HTML requeridos.");
    return;
  }

  // 1️⃣ Detectar si ya hay token en la URL
  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    accessToken = new URLSearchParams(hash.substring(1)).get("access_token");
    loginDiv.style.display = "none";
    gameDiv.style.display = "block";
  }

  // 2️⃣ Botón de login
  loginBtn.addEventListener("click", () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  });

  // 3️⃣ Botones de géneros
  document.querySelectorAll(".genre-btn").forEach(btn => {
    btn.addEventListener("click", () => getSongByGenre(btn.dataset.genre));
  });
});

// --- Función para obtener canciones por género ---
async function getSongByGenre(genre) {
  if (!accessToken) return alert("Primero conectate con Spotify.");

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${genre}&type=track&limit=10`,
      { headers: { Authorization: "Bearer " + accessToken } }
    );

    const data = await response.json();

    if (!data.tracks || !data.tracks.items.length) {
      document.getElementById("result").innerText =
        "No se encontraron canciones 😢";
      return;
    }

    const track =
      data.tracks.items[Math.floor(Math.random() * data.tracks.items.length)];
    const audio = document.getElementById("audio");
    const question = document.getElementById("question");

    question.innerText = `🎧 Escuchá y adiviná: ${genre}`;
    audio.src = track.preview_url;

    audio.play().catch(() => {
      document.getElementById("result").innerText =
        "El preview no se puede reproducir automáticamente.";
    });

    document.getElementById(
      "result"
    ).innerHTML = `<p>Pista: <strong>${track.artists[0].name}</strong></p><p>Canción: ${track.name}</p>`;
  } catch (err) {
    console.error("Error obteniendo canciones:", err);
  }
}
