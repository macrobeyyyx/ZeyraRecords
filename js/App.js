import MusicService from './MusicService.js';
import MusicPlayer from './MusicPlayer.js';
export default class App {
    constructor() {
        // DOM yüklendiğinden emin olun
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initApp());
        } else {
            this.initApp();
        }
    }

    initApp() {
        try {
            this.musicService = new MusicService();
            this.musicPlayer = new MusicPlayer();
            
            this.searchInput = document.getElementById('searchInput');
            this.trackList = document.getElementById('trackList');

            if (this.searchInput && this.trackList) {
                this.init();
            } else {
                console.error('Gerekli DOM öğeleri bulunamadı');
            }
        } catch (error) {
            console.error('Uygulama başlatılırken hata:', error);
        }
    }

    async init() {
        try {
            const tracks = await this.musicService.loadTracks();
            this.renderTracks(tracks);
            this.setupEventListeners();
            this.setupTrackListeners();
        } catch (error) {
            console.error('Uygulama başlatılırken hata:', error);
            this.showErrorMessage();
        }
    }

    renderTracks(tracks) {
        if (!tracks || tracks.length === 0) {
            this.showErrorMessage('Şarkı bulunamadı');
            return;
        }

        this.trackList.innerHTML = tracks.map(track => `
            <div class="track-card" data-track-id="${track.id}">
                <img src="${track.cover || 'assets/default-cover.jpg'}" alt="${track.title}">
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
                <div class="track-actions">
                    <button class="play-btn" data-action="play">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.setupTrackListeners();
    }

    setupTrackListeners() {
        const trackCards = document.querySelectorAll('.track-card');
        
        if (trackCards.length === 0) {
            console.warn('Şarkı kartları bulunamadı');
            return;
        }

        trackCards.forEach(card => {
            const playButton = card.querySelector('.play-btn');
            
            if (!playButton) {
                console.warn('Oynatma butonu bulunamadı');
                return;
            }

            playButton.addEventListener('click', () => {
                try {
                    const trackId = parseInt(card.dataset.trackId);
                    const track = this.musicService.getTrackById(trackId);
                    
                    if (track) {
                        this.musicPlayer.loadTrack(track);
                        this.musicPlayer.play();
                    } else {
                        console.warn(`Şarkı ID'si ile eşleşen şarkı bulunamadı: ${trackId}`);
                    }
                } catch (error) {
                    console.error('Şarkı oynatma hatası:', error);
                }
            });
        });
    }

    setupEventListeners() {
        if (!this.searchInput) {
            console.warn('Arama girişi bulunamadı');
            return;
        }

        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const filteredTracks = this.musicService.searchTracks(query);
            this.renderTracks(filteredTracks);
        });
    }

    showErrorMessage(message = 'Şarkılar yüklenemedi') {
        if (!this.trackList) {
            console.error('Track list bulunamadı');
            return;
        }

        this.trackList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    try {
        new App();
    } catch (error) {
        console.error('Uygulama başlatma hatası:', error);
    }
});