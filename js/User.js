class UserProfile {
    constructor() {
        this.profile = this.loadProfile();
    }

    loadProfile() {
        return JSON.parse(localStorage.getItem('zeyraUserProfile')) || {
            username: null,
            email: null,
            listenHistory: [],
            favoriteGenres: {},
            totalListenTime: 0
        };
    }

    updateListenHistory(track) {
        this.profile.listenHistory.push({
            trackId: track.id,
            timestamp: Date.now(),
            duration: track.duration
        });

        this.profile.totalListenTime += track.duration;
        this.updateFavoriteGenres(track.genre);
        this.saveProfile();
    }

    updateFavoriteGenres(genre) {
        this.profile.favoriteGenres[genre] = 
            (this.profile.favoriteGenres[genre] || 0) + 1;
    }

    saveProfile() {
        localStorage.setItem('zeyraUserProfile', JSON.stringify(this.profile));
    }

    getTopGenres(limit = 3) {
        return Object.entries(this.profile.favoriteGenres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([genre, count]) => ({ genre, count }));
    }
}