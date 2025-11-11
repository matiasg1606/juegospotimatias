const CLIENT_ID = "870da05dc0b7464e9f11a3e1ca2d5be9";
const REDIRECT_URI = "https://matiasg1606.github.io/juegospotimatias/";
const SCOPES = "user-read-private user-read-email";

let accessToken = "";

// --- Paso 1: Ver si ya tenemos token ---
window.onload = () => {
  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    accessToken = new URLSearchParams(hash.substring(1)).get("access_token");
    document.getElementById("login").style.display = "none";
    document.getElementById("game").style.display = "block";
  }

  document.getElementById("loginBtn").addEventListener("click", loginWithSpotify);

  document.querySelectorAll(".genre-btn").forEach(btn => {
    btn.addEventListener("click", () => getSongByGenre(btn.dataset.genre));
  });
};

// --- Paso 2: Redirigir al login de Spotify ---
function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = authUrl;
}

// --- Paso 3: Buscar canciones por género ---
async function getSongByGenre(genre) {
  if (!accessToken) return alert("Primero conectate con Spotify.");

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${genre}&type=track&limit=10`,
    {
      headers: { Authorization: "Bearer " + accessToken }
    }
  );

  const data = await response.json();

  if (!data.tracks || !data.tracks.items.length) {
    document.getElementById("result").innerText = "No se encontraron canciones 😢";
    return;
  }

  const track = data.tracks.items[Math.floor(Math.random() * data.tracks.items.length)];
  const audio = document.getElementById("audio");
  const question = document.getElementById("question");

  question.innerText = `🎧 Escuchá y adiviná: ${genre}`;
  audio.src = track.preview_url;
  audio.play().catch(() => {
    document.getElementById("result").innerText = "El preview no se puede reproducir.";
  });

  document.getElementById("result").innerHTML = `
    <p>Pista: <strong>${track.artists[0].name}</strong></p>
    <p>Canción: ${track.name}</p>
  `;
}
