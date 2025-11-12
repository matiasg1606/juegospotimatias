// =========================
// 🎵 Trivia Musical con Spotify API (Netlify backend)
// =========================

const API_URL = "https://juegospotimatias.netlify.app/.netlify/functions/getSpotifyToken"; // URL de tu función Netlify
let spotifyToken = null;

// --------------------------
// 1️⃣ Obtener token automáticamente desde el backend
// --------------------------
async function obtenerToken() {
  const res = await fetch(API_URL);
  const data = await res.json();
  spotifyToken = data.access_token;
  console.log("✅ Token obtenido desde Netlify:", spotifyToken);
}

// --------------------------
// 2️⃣ Render de la pantalla inicial
// --------------------------
function renderPantallaInicial() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="pantalla">
      <h1>🎵 Adivina la Canción</h1>
      <button id="btnEmpezar">Empezar</button>
    </div>
  `;

  document.getElementById("btnEmpezar").addEventListener("click", renderSeleccionTema);
}

// --------------------------
// 3️⃣ Pantalla de selección de tema
// --------------------------
function renderSeleccionTema() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="pantalla">
      <h2>Selecciona el tipo de música 🎧</h2>
      <button class="tema" data-tema="pop">Pop</button>
      <button class="tema" data-tema="rock">Rock</button>
      <button class="tema" data-tema="latino">Latino</button>
      <button class="tema" data-tema="rap">Rap</button>
      <button class="tema" data-tema="electronic">Electrónica</button>
    </div>
  `;

  document.querySelectorAll(".tema").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tema = e.target.dataset.tema;
      renderTrivia(tema);
    });
  });
}

// --------------------------
// 4️⃣ Lógica principal del juego
// --------------------------
async function renderTrivia(tema) {
  const app = document.getElementById("app");
  app.innerHTML = `<h2>Cargando canciones de ${tema}...</h2>`;

  const canciones = await buscarCanciones(tema);

  if (!canciones || canciones.length === 0) {
    app.innerHTML = `<p>No se encontraron canciones de ${tema} 😢</p>`;
    return;
  }

  const random = canciones[Math.floor(Math.random() * canciones.length)];
  const previewUrl = random.preview_url;

  app.innerHTML = `
    <div class="pantalla">
      <h2>🎶 Escucha y adivina la canción</h2>
      <audio id="player" src="${previewUrl}" autoplay controls></audio>
      <p><strong>Artista:</strong> ${random.artists[0].name}</p>
      <p><strong>Canción:</strong> ${random.name}</p>
      <button id="volver">Volver</button>
    </div>
  `;

  document.getElementById("volver").addEventListener("click", renderSeleccionTema);
}

// --------------------------
// 5️⃣ Función que busca canciones por tema
// --------------------------
async function buscarCanciones(tema) {
  try {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${tema}&type=track&limit=10`, {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    });
    const data = await res.json();
    return data.tracks?.items?.filter(t => t.preview_url);
  } catch (err) {
    console.error("Error al buscar canciones:", err);
    return [];
  }
}

// --------------------------
// 🚀 Inicio
// --------------------------
(async function init() {
  await obtenerToken();
  renderPantallaInicial();
})();

