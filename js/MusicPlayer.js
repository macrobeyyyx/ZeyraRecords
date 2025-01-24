export default class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.playlist = [];

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initPlayer());
        } else {
            this.initPlayer();
        }
    }

    initPlayer() {
        try {
            this.initializeElements();
            this.setupEventListeners();
        } catch (error) {
            console.error('Müzik çalar başlatılırken hata:', error);
        }
    }
    loadTrack(track) {
        if (!track) {
            console.error('Geçersiz şarkı');
            return;
        }

        this.currentTrack = track;
        this.audio.src = track.trackUrl;

        if (this.coverEl) this.coverEl.src = track.cover || 'assets/default-cover.jpg';
        if (this.titleEl) this.titleEl.textContent = track.title || 'Bilinmeyen Şarkı';
        if (this.artistEl) this.artistEl.textContent = track.artist || 'Bilinmeyen Sanatçı';
    }

    // Yeni eklenen metod
    getCurrentTrack() {
        return this.currentTrack;
    }

    // Diğer metodlar...
    initializeElements() {
        this.coverEl = document.querySelector('.track-cover');
        this.titleEl = document.querySelector('.track-title');
        this.artistEl = document.querySelector('.track-artist');
        this.albumEl = document.querySelector('.track-album');
        this.playPauseBtn = document.getElementById('playPauseButton');
        this.prevBtn = document.getElementById('prevButton');
        this.nextBtn = document.getElementById('nextButton');
        
        this.progressSlider = document.getElementById('progressSlider');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');

        this.volumeSlider = document.getElementById('volumeSlider');
        this.muteBtn = document.getElementById('muteButton');
    }

    setupEventListeners() {
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.setDuration());
        this.audio.addEventListener('ended', () => this.playNextTrack());

        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.playPreviousTrack());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.playNextTrack());
        }

        if (this.progressSlider) {
            this.progressSlider.addEventListener('input', (e) => {
                const time = (e.target.value / 100) * this.audio.duration;
                this.audio.currentTime = time;
            });
        }

        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.audio.volume = e.target.value / 100;
            });
        }

        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }
    }

    loadTrack(track) {
        if (!track) {
            console.error('Geçersiz şarkı');
            return;
        }

        this.currentTrack = track;
        this.audio.src = track.trackUrl;

        if (this.coverEl) this.coverEl.src = track.cover || 'assets/default-cover.jpg';
        if (this.titleEl) this.titleEl.textContent = track.title || 'Bilinmeyen Şarkı';
        if (this.artistEl) this.artistEl.textContent = track.artist || 'Bilinmeyen Sanatçı';
        if (this.albumEl) this.albumEl.textContent = track.album || 'Bilinmeyen Albüm';
    }

    play() {
        if (this.audio) {
            this.audio.play()
                .then(() => {
                    if (this.playPauseBtn) {
                        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    }
                })
                .catch(error => console.error('Oynatma hatası:', error));
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            if (this.playPauseBtn) {
                this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    updateProgress() {
        if (this.progressSlider && this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressSlider.value = progress;
        }

        if (this.currentTimeEl) {
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    setDuration() {
        if (this.durationEl) {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    toggleMute() {
        if (this.audio) {
            this.audio.muted = !this.audio.muted;
            
            if (this.muteBtn) {
                const muteIcon = this.muteBtn.querySelector('i');
                muteIcon.classList.toggle('fa-volume-up');
                muteIcon.classList.toggle('fa-volume-mute');
            }
        }
    }

    playNextTrack() {
        if (this.playlist.length === 0) return;

        const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack.id);
        const nextIndex = (currentIndex + 1) % this.playlist.length;
        
        this.loadTrack(this.playlist[nextIndex]);
        this.play();
    }

    playPreviousTrack() {
        if (this.playlist.length === 0) return;

        const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack.id);
        const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length;
        
        this.loadTrack(this.playlist[prevIndex]);
        this.play();
    }

    setPlaylist(tracks) {
        this.playlist = tracks;
        if (tracks.length > 0) {
            this.loadTrack(tracks[0]);
        }
    }
}