// --- CONFIGURACIÓN ---
const CLIENT_ID = "TU_CLIENT_ID"; // ⚠️ poné el tuyo
const REDIRECT_URI = "https://tuusuario.github.io/trivia-musical/"; // ⚠️ o tu localhost si estás probando
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "streaming",
  "user-modify-playback-state"
];

// --- APP ---
window.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  // Leer token de la URL o del localStorage
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get("access_token") || localStorage.getItem("spotify_token");

  if (params.get("access_token")) {
    localStorage.setItem("spotify_token", params.get("access_token"));
    window.history.pushState("", "", REDIRECT_URI); // limpia la URL
  }

  if (!token) {
    renderLogin();
  } else {
    renderStart(token);
  }

  function renderLogin() {
    const authURL =
      "https://accounts.spotify.com/authorize" +
      "?client_id=" + CLIENT_ID +
      "&response_type=token" +
      "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
      "&scope=" + encodeURIComponent(SCOPES.join(" "));

    app.innerHTML = `
      <h1>Trivia Musical</h1>
      <p>Conéctate con Spotify para comenzar</p>
      <a href="${authURL}">Conectar con Spotify</a>
    `;
  }

  function renderStart(token) {
    app.innerHTML = `
      <h1>Trivia Musical</h1>
      <button id="startBtn">Comenzar</button>
    `;

    document.getElementById("startBtn").addEventListener("click", () => {
      renderTopics(token);
    });
  }

  function renderTopics(token) {
    app.innerHTML = `
      <h2>Selecciona el tipo de tema</h2>
      <button class="topic" data-topic="rock">Rock</button>
      <button class="topic" data-topic="pop">Pop</button>
      <button class="topic" data-topic="latino">Latino</button>
    `;

    document.querySelectorAll(".topic").forEach(btn => {
      btn.addEventListener("click", () => searchSongs(btn.dataset.topic, token));
    });
  }

  async function searchSongs(topic, token) {
    app.innerHTML = `<p>Buscando canciones de ${topic}...</p>`;

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(topic)}&type=track&limit=10`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.tracks || data.tracks.items.length === 0) {
      app.innerHTML = `<p>No se encontraron canciones.</p>`;
      return;
    }

    const tracks = data.tracks.items.filter(t => t.preview_url);
    if (tracks.length === 0) {
      app.innerHTML = `<p>No hay canciones con preview disponible.</p>`;
      return;
    }

    const track = tracks[Math.floor(Math.random() * tracks.length)];

    app.innerHTML = `
      <h3>Adivina la canción (${topic})</h3>
      <audio controls autoplay src="${track.preview_url}"></audio>
      <p>Artista: ???</p>
      <p>Título: ???</p>
      <button id="reveal">Mostrar respuesta</button>
    `;

    document.getElementById("reveal").addEventListener("click", () => {
      app.innerHTML += `
        <p><strong>${track.name}</strong> de ${track.artists[0].name}</p>
        <button id="volver">Volver</button>
      `;
      document.getElementById("volver").addEventListener("click", () => renderTopics(token));
    });
  }
});
