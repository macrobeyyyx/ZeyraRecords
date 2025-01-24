import MusicService from './MusicService.js';
import MusicPlayer from './MusicPlayer.js';
import LyricsService from './LyricsService.js';
import LyricsModal from './LyricsModal.js';

// Favori Yönetimi Sınıfı
class FavoriteManager {
    constructor() {
        this.favorites = this.getFavorites();
    }

    addToFavorites(track) {
        if (!this.favorites.some(fav => fav.id === track.id)) {
            this.favorites.push(track);
            this.saveFavorites();
            this.updateFavoriteUI(track);
        }
    }

    removeFromFavorites(trackId) {
        this.favorites = this.favorites.filter(fav => fav.id !== trackId);
        this.saveFavorites();
        this.updateFavoriteUI();
    }

    saveFavorites() {
        localStorage.setItem('zeyraFavorites', JSON.stringify(this.favorites));
    }

    getFavorites() {
        return JSON.parse(localStorage.getItem('zeyraFavorites')) || [];
    }

    updateFavoriteUI(track) {
        const favoriteBtn = document.querySelector(`[data-track-id="${track.id}"] .favorite-btn`);
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active');
        }
    }

    trackListenCount(track) {
        const listenCounts = JSON.parse(localStorage.getItem('zeyraListenCounts')) || {};
        listenCounts[track.id] = (listenCounts[track.id] || 0) + 1;
        localStorage.setItem('zeyraListenCounts', JSON.stringify(listenCounts));
    }

    getTopTracks(limit = 10) {
        const listenCounts = JSON.parse(localStorage.getItem('zeyraListenCounts')) || {};
        return Object.entries(listenCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([trackId, count]) => ({
                trackId,
                count
            }));
    }
}