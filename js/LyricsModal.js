export default class LyricsModal {
    constructor(musicPlayer, lyricsService) {
        this.musicPlayer = musicPlayer;
        this.lyricsService = lyricsService;
        this.selectedLines = []; // Dizi olarak tanımlandı

        this.initializeDOM();
        this.setupEventListeners();
    }

    initializeDOM() {
        this.lyricsModal = document.getElementById("lyricsModal");
        this.closeButton = this.lyricsModal.querySelector(".close-button");
        this.modalTrackTitle = document.getElementById("modalTrackTitle");
        this.modalTrackArtist = document.getElementById("modalTrackArtist");
        this.modalTrackCover = document.getElementById("modalTrackCover");
        this.lyricsContainer = document.getElementById("lyricsContainer");
        this.shareButton = document.getElementById("shareButton");
    }

    setupEventListeners() {
        this.closeButton.addEventListener('click', () => this.hide());
        this.shareButton.addEventListener('click', () => this.shareSelectedLyrics());
    }

    async show() {
        const currentTrack = this.musicPlayer.getCurrentTrack();
        
        if (!currentTrack) {
            console.error("Şu anda çalan şarkı yok");
            return;
        }

        // Modal içeriğini doldur
        this.modalTrackTitle.textContent = currentTrack.title;
        this.modalTrackArtist.textContent = currentTrack.artist;
        this.modalTrackCover.src = currentTrack.cover;

        // Seçimleri sıfırla
        this.selectedLines = []; // Seçimleri sıfırla
        this.shareButton.disabled = true;

        // Şarkı sözlerini getir
        try {
            const lyrics = await this.lyricsService.getLyrics(currentTrack.id);
            this.displayLyrics(lyrics);
        } catch (error) {
            this.lyricsContainer.textContent = "Şarkı sözleri alınamadı.";
        }

        this.lyricsModal.style.display = "block";
    }

    displayLyrics(lyrics) {
        // Lyrics'i satırlara böl
        const lines = lyrics.split('\n')
            .filter(line => line.trim() !== '' && line.length > 10);
        
        // Lyrics konteynerini temizle
        this.lyricsContainer.innerHTML = '';

        // Her satır için bir div oluştur
        lines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line;
            lineElement.classList.add('lyrics-line');
            lineElement.dataset.index = index;
            
            lineElement.addEventListener('click', () => this.handleLineClick(lineElement));
            
            this.lyricsContainer.appendChild(lineElement);
        });
    }

    handleLineClick(lineElement) {
        // Satırı seç veya seçimi kaldır
        lineElement.classList.toggle('selected');

        // Seçilen satırları güncelle
        if (lineElement.classList.contains('selected')) {
            this.selectedLines.push(lineElement.textContent);
        } else {
            this.selectedLines = this.selectedLines.filter(
                line => line !== lineElement.textContent
            );
        }

        // Maksimum 3 satır seçimine izin ver
        if (this.selectedLines.length > 3) {
            const firstSelected = this.lyricsContainer.querySelector('.lyrics-line.selected');
            if (firstSelected) {
                firstSelected.classList.remove('selected');
                this.selectedLines.shift();
            }
        }

        // Paylaşım butonunu etkinleştir/devre dışı bırak
        this.shareButton.disabled = this.selectedLines.length === 0;
    }

    shareSelectedLyrics() {
        if (this.selectedLines.length === 0) {
            alert('Lütfen paylaşmak için en az bir satır seçin.');
            return;
        }

        const selectedLyricsText = this.selectedLines.join('\n');

        // Paylaşım işlemi
        this.lyricsService.shareCustomLyrics(
            this.musicPlayer.getCurrentTrack(), 
            selectedLyricsText
        );
    }

    hide() {
        this.lyricsModal.style.display = "none";
    }
}