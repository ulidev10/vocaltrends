// 1. Array de canciones (¡Actualiza las rutas de las imágenes y ahora las de los audios!)
// Asegúrate de que las rutas a tus archivos .mp3 (o .wav/.ogg) sean correctas
// y que los archivos existan en esas ubicaciones.
const songs = [
    {
        id: 'flower', // Un ID interno para tu referencia
        title: 'flower',
        artist: 'iyowa',
        image: 'img/flower.jpg', // Ruta a la imagen de la portada
        audioSrc: 'audio/flower.mp4' // ¡Ruta a tu archivo de audio MP3!
    },
    {
        id: 'kyukurarin',
        title: 'きゅうくらりん',
        artist: 'IYOWA',
        image: 'img/きゅうくらりん.jpg',
        audioSrc: 'audio/kyukurarin.mp3'
    },
    {
        id: '1000_nen_ikiteru',
        title: '1000年生きてる',
        artist: 'IYOWA',
        image: 'img/1000年生きてる.jpg',
        audioSrc: 'audio/1000_nen_ikiteru.mp3'
    }
    // ¡Asegúrate de tener al menos 3 canciones para que el carrusel se vea bien!
    // Y que los archivos de audio existan en las rutas 'audio/nombre_cancion.mp3'
];

let currentSongIndex = 0;
let audioPlayer; // Referencia a la etiqueta <audio> de HTML5

// Referencias a los elementos del DOM (se mantienen igual)
const songTitleElement = document.querySelector('.global-player-controls .song-title');
const songArtistElement = document.querySelector('.global-player-controls .song-artist');
const playPauseBtn = document.getElementById('playPauseBtn');
const songProgress = document.getElementById('song-progress');
const musicCarousel = document.querySelector('.music-carousel');

// Inicialización del reproductor de audio local
document.addEventListener('DOMContentLoaded', () => {
    audioPlayer = document.getElementById('audio-player');
    
    // Event listener para cuando la canción termina
    audioPlayer.addEventListener('ended', () => {
        moveToSong((currentSongIndex + 1) % songs.length); // Pasa a la siguiente canción, con loop
    });

    // Event listener para actualizar la barra de progreso mientras se reproduce
    audioPlayer.addEventListener('timeupdate', startProgressUpdate);

    // Event listener para cuando los metadatos de la canción están cargados (para la duración total)
    audioPlayer.addEventListener('loadedmetadata', () => {
        songProgress.max = audioPlayer.duration; // Establece el máximo de la barra de progreso
    });

    // Carga la primera canción al iniciar
    loadSong(currentSongIndex);
    renderCarousel(); // Renderiza el carrusel al inicio
});


// --- Funciones de Control de Reproducción ---

function loadSong(index) {
    currentSongIndex = index;
    const song = songs[currentSongIndex];
    audioPlayer.src = song.audioSrc; // Establece la fuente del audio
    audioPlayer.load(); // Carga el audio (pero no lo reproduce aún)
    updateGlobalPlayerInfo(song); // Actualiza la información visible
}

function updateGlobalPlayerInfo(song) {
    if (songTitleElement) {
        songTitleElement.textContent = song.title;
    }
    if (songArtistElement) {
        songArtistElement.textContent = song.artist;
    }
    songProgress.value = 0; // Reinicia la barra de progreso
    songProgress.max = 0; // Se actualizará cuando 'loadedmetadata' se dispare
}

function playPauseSong() {
    if (audioPlayer.paused) {
        audioPlayer.play(); // Reproduce
        playPauseBtn.innerHTML = '⏸';
        startProgressUpdate(); // Inicia la actualización de la barra
    } else {
        audioPlayer.pause(); // Pausa
        playPauseBtn.innerHTML = '⏯';
        stopProgressUpdate(); // Detiene la actualización de la barra
    }
}

function seekBackward() {
    if (audioPlayer) {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    }
}

function seekForward() {
    if (audioPlayer) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    }
}

// Lógica de la barra de progreso
let progressUpdateInterval; // Cambiado el nombre de la variable para claridad

function startProgressUpdate() {
    // Si ya hay un intervalo, no crear uno nuevo
    if (!progressUpdateInterval) {
        progressUpdateInterval = setInterval(() => {
            if (!audioPlayer.paused && !audioPlayer.ended) {
                songProgress.value = audioPlayer.currentTime;
            } else {
                stopProgressUpdate(); // Detiene si no está reproduciendo
            }
        }, 100); // Actualiza más rápido para una barra más suave (cada 100ms)
    }
}

function stopProgressUpdate() {
    clearInterval(progressUpdateInterval);
    progressUpdateInterval = null; // Reiniciar la variable
}

songProgress.addEventListener('input', () => {
    stopProgressUpdate(); // Detiene la actualización automática al arrastrar
    audioPlayer.currentTime = songProgress.value; // Establece el tiempo de reproducción
});

songProgress.addEventListener('change', () => {
    // Reanuda la actualización al soltar, si estaba reproduciendo
    if (!audioPlayer.paused) {
        startProgressUpdate();
    }
});


// --- Lógica del Carrusel de Pistas y Animación (similar, pero adaptado) ---

function renderCarousel() {
    musicCarousel.innerHTML = ''; // Limpiar el carrusel antes de renderizar

    const numSongs = songs.length;
    const windowSize = 2; // Mostrar 2 antes y 2 después de la actual (total 5)
    const cardElements = [];

    // Crear y añadir todas las tarjetas que potencialmente se van a mostrar
    for (let i = 0; i < numSongs; i++) {
        const songData = songs[i];
        const cardElement = document.createElement('div');
        cardElement.classList.add('music-card-item');
        cardElement.dataset.songIndex = i; // Guardar el índice original de la canción

        cardElement.innerHTML = `
            <img src="${songData.image}" alt="${songData.title}" class="card-img-cover">
            <div class="song-info">
                <h3 class="song-title">${songData.title}</h3>
                <p class="song-artist">${songData.artist}</p>
            </div>
        `;
        musicCarousel.appendChild(cardElement); // Añadir al DOM
        cardElements.push(cardElement); // Guardar referencia
    }

    // Ahora, aplicar las clases de posición a las tarjetas.
    cardElements.forEach((cardElement, index) => {
        let relativeIndex = index - currentSongIndex;

        // Manejar el "loop" para que el carrusel sea infinito
        if (relativeIndex > numSongs / 2) {
            relativeIndex -= numSongs;
        } else if (relativeIndex < -numSongs / 2) {
            relativeIndex += numSongs;
        }

        // Remover todas las clases de posición antes de añadir la correcta
        cardElement.classList.remove('active', 'prev-1', 'prev-2', 'next-1', 'next-2', 'hidden');
        cardElement.style.pointerEvents = 'auto'; // Habilitar clics por defecto

        if (relativeIndex === 0) {
            cardElement.classList.add('active');
            cardElement.style.pointerEvents = 'none'; // La tarjeta activa no es clicable para moverse a sí misma
        } else if (relativeIndex === -1) {
            cardElement.classList.add('prev-1');
        } else if (relativeIndex === -2) {
            cardElement.classList.add('prev-2');
        } else if (relativeIndex === 1) {
            cardElement.classList.add('next-1');
        } else if (relativeIndex === 2) {
            cardElement.classList.add('next-2');
        } else {
            // Tarjetas muy lejos, las ocultamos y deshabilitamos clics
            cardElement.classList.add('hidden'); // Clase para ocultar completamente
            cardElement.style.pointerEvents = 'none';
        }
        
        // Añadir el evento de clic solo a las tarjetas no activas
        if (index !== currentSongIndex) {
            cardElement.onclick = () => moveToSong(index);
        }
    });
}

function moveToSong(newIndex) {
    newIndex = Number(newIndex);
    if (isNaN(newIndex) || newIndex < 0 || newIndex >= songs.length) {
        newIndex = 0; // Loop al inicio si se pasa del final
    }

    // Solo procede si la canción es diferente a la actual
    // o si la actual ha terminado y estamos pasando a la siguiente.
    if (newIndex === currentSongIndex && !audioPlayer.ended) {
        return; 
    }

    const prevActiveCard = document.querySelector('.music-card-item.active');

    // Animación de rotación al salir
    if (prevActiveCard) {
        // Añade una clase temporal para un giro al salir
        prevActiveCard.classList.remove('active'); // Para que la animación de salida se aplique bien
        prevActiveCard.classList.add('rotating-out-temporary');
        prevActiveCard.style.pointerEvents = 'none'; // Deshabilita clics mientras rota
        
        // Espera a que la animación de salida termine antes de cargar la nueva canción y renderizar
        setTimeout(() => {
            loadSong(newIndex); // Carga la nueva canción
            audioPlayer.play(); // Inicia la reproducción de la nueva canción
            playPauseBtn.innerHTML = '⏸'; // Actualiza el botón de play/pause
            renderCarousel(); // Vuelve a renderizar el carrusel para actualizar las posiciones
            
            // Elimina la clase temporal después de un breve momento
            // (necesario si la tarjeta se reutiliza o para limpiar el DOM)
            setTimeout(() => {
                 prevActiveCard.classList.remove('rotating-out-temporary');
            }, 50); // Un pequeño retraso después del render
        }, 300); // Duración de la animación rotating-out-temporary en CSS
    } else {
        // Primera carga o si no hay tarjeta activa (ej. al refrescar)
        loadSong(newIndex);
        audioPlayer.play();
        playPauseBtn.innerHTML = '⏸';
        renderCarousel();
    }
}