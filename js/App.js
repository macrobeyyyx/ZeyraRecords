import MusicService from './MusicService.js';
import MusicPlayer from './MusicPlayer.js';
import LyricsService from './LyricsService.js';
import LyricsModal from './LyricsModal.js';

export default class App {
    constructor() {
        this.initApp();
    }

    async initApp() {
        try {
            // DOM'un yüklendiğinden emin olun
            if (document.readyState === 'loading') {
                await new Promise(resolve => 
                    document.addEventListener('DOMContentLoaded', resolve)
                );
            }

            // Gerekli DOM öğelerinin varlığını kontrol edin
            const lyricsButton = document.getElementById('lyricsButton');
            const trackList = document.getElementById('trackList');

            if (!lyricsButton || !trackList) {
                console.error('Gerekli DOM öğeleri bulunamadı');
                return;
            }

            this.musicService = new MusicService();
            this.musicPlayer = new MusicPlayer();
            this.lyricsService = new LyricsService(this.musicService);
            
            this.lyricsModal = new LyricsModal(
                this.musicPlayer, 
                this.lyricsService
            );

            // Lyrics butonuna event listener ekleyin
            lyricsButton.addEventListener('click', () => {
                console.log('Lyrics button clicked');
                if (this.lyricsModal && typeof this.lyricsModal.show === 'function') {
                    this.lyricsModal.show();
                } else {
                    console.error('Lyrics modal gösterilemiyor');
                }
            });

            const tracks = await this.musicService.loadTracks();
            this.renderTracks(tracks);
            this.setupEventListeners();

        } catch (error) {
            console.error('Uygulama başlatılırken hata:', error);
        }
    }


    renderTracks(tracks) {
        const trackList = document.getElementById('trackList');
        if (!trackList) {
            console.error('Track list bulunamadı');
            return;
        }

        if (!tracks || tracks.length === 0) {
            trackList.innerHTML = '<p>Şarkı bulunamadı</p>';
            return;
        }

        trackList.innerHTML = tracks.map(track => `
            <div class="track-card" data-track-id="${track.id}">
                <img src="${track.cover || 'assets/default-cover.jpg'}" alt="${track.title}">
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.album}</p>
                    <p>${track.artist}</p>
                </div>
                <button class="play-btn" data-action="play">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `).join('');
        function createTrackCard(track) {
            const card = document.createElement('div');
            card.classList.add('track-card');
            card.innerHTML = `
                <img src="${track.cover}" alt="${track.title}">
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
                <button class="favorite-btn" data-track-id="${track.id}">
                    <i class="fas fa-heart ${favoriteManager.favorites.some(f => f.id === track.id) ? 'active' : ''}"></i>
                </button>
            `;
        
            const favoriteBtn = card.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', () => {
                favoriteManager.addToFavorites(track);
            });
        
            return card;
        }
        this.setupTrackListeners();
    }

    setupTrackListeners() {
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', () => {
                const trackCard = button.closest('.track-card');
                const trackId = parseInt(trackCard.dataset.trackId);
                const track = this.musicService.getTrackById(trackId);
                
                if (track) {
                    this.musicPlayer.loadTrack(track);
                    this.musicPlayer.play();
                }
            });
        });
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                const filteredTracks = this.musicService.searchTracks(query);
                this.renderTracks(filteredTracks);
            });
        }
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
