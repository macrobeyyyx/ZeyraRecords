export default class MusicService {
    constructor() {
        this.tracks = [];
    }

    async loadTracks() {
        try {
            const response = await fetch('zeyrasongs/songs.json');
            const data = await response.json();
            
            this.tracks = data.tracks.map(track => ({
                ...track,
                cover: track.cover || 'assets/default-cover.jpg',
                lyrics: track.lyrics || 'Şarkı sözleri bulunamadı.'
            }));

            return this.tracks;
        } catch (error) {
            console.error('Şarkıları yüklerken hata:', error);
            return [];
        }
    }

    searchTracks(query) {
        if (!query) return this.tracks;
        
        return this.tracks.filter(track => 
            track.title.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase())
        );
    }

    getTrackById(id) {
        return this.tracks.find(track => track.id === id);
    }

    async getLyrics(trackId) {
        const track = this.getTrackById(trackId);
        return track ? track.lyrics : null;
    }
}