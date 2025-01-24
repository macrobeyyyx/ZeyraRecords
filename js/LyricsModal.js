export default class LyricsService {
    constructor(musicService) {
        this.musicService = musicService;
        
        this.config = {
            canvas: {
                width: 1080,
                height: 1920
            },
            palette: {
                background: {
                    gradient: [
                        'rgba(29, 185, 84, 0.9)',   // Spotify Green
                        'rgba(25, 20, 20, 0.8)'     // Dark Background
                    ]
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: 'rgba(255, 255, 255, 0.7)'
                }
            },
            typography: {
                title: {
                    size: 70,
                    weight: 'bold',
                    font: 'Arial'
                },
                artist: {
                    size: 50,
                    weight: 'normal',
                    font: 'Arial'
                },
                lyrics: {
                    size: 45,
                    weight: 'bold',
                    font: 'Arial'
                }
            },
            layout: {
                coverSize: 800,
                spacing: {
                    coverTop: 200,
                    titleFromCover: 50,
                    titleSpacing: 50, // Yeni eklenen boşluk ayarı
                    betweenElements: 30
                }
            }
        };
    }

    async createLyricsShareImage(track, selectedLines) {
        return new Promise((resolve, reject) => {
            if (!this._validateInput(track, selectedLines)) {
                return reject(new Error("Geçersiz girdi"));
            }

            const canvas = this._createCanvas();
            const ctx = canvas.getContext('2d');

            this._prepareCanvasBackground(ctx, canvas);

            const coverImage = this._loadCoverImage(track.cover);
            coverImage.onload = () => {
                this._renderImageContent(ctx, coverImage, track, selectedLines, canvas);
                canvas.toBlob(blob => resolve(blob), 'image/png');
            };
            coverImage.onerror = () => reject(new Error('Kapak resmi yüklenemedi'));
        });
    }

    _validateInput(track, selectedLines) {
        return track && 
               selectedLines && 
               Array.isArray(selectedLines) && 
               selectedLines.length > 0;
    }

    _createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.config.canvas.width;
        canvas.height = this.config.canvas.height;
        return canvas;
    }

    _prepareCanvasBackground(ctx, canvas) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        this.config.palette.background.gradient.forEach((color, index) => {
            gradient.addColorStop(index, color);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    _loadCoverImage(coverUrl) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = coverUrl || 'default-cover.png';
        return img;
    }

    _renderImageContent(ctx, coverImage, track, selectedLines, canvas) {
        const { coverSize, spacing } = this.config.layout;
        const centerX = canvas.width / 2;
    
        // Cover Image
        this._drawRoundedCoverImage(
            ctx, 
            coverImage, 
            centerX - coverSize/2, 
            spacing.coverTop, 
            coverSize
        );
    
        // Track Information - Boşluğu artırdık
        this._renderTrackInfo(
            ctx, 
            track, 
            centerX, 
            spacing.coverTop + coverSize + spacing.titleFromCover + 50 // +50 ekledik
        );
    
        // Lyrics
        this._renderLyrics(
            ctx, 
            selectedLines, 
            centerX, 
            spacing.coverTop + coverSize + spacing.titleFromCover + 250 + 50 // Buna da +50 ekledik
        );
    
        // Branding
        this._addBranding(ctx, canvas);
    }

    _drawRoundedCoverImage(ctx, image, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 50);
        ctx.clip();

        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;

        ctx.drawImage(image, x, y, size, size);
        ctx.restore();
    }

    _renderTrackInfo(ctx, track, centerX, startY) {
        const { title, artist, album } = this.config.typography;
        const { palette } = this.config;

        // Title
        ctx.font = `${title.weight} ${title.size}px ${title.font}`;
        ctx.fillStyle = palette.text.primary;
        ctx.textAlign = 'center';
        this._wrapText(ctx, track.title, centerX, startY, 900, 80);

        // Artist
        ctx.font = `${artist.weight} ${artist.size}px ${artist.font}`;
        ctx.fillStyle = palette.text.secondary;
        ctx.fillText(track.artist, centerX, startY + 100);

        // Album
        ctx.font = `${artist.weight} 40px ${artist.font}`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(track.album || "Bilinmeyen Albüm", centerX, startY + 160);
    }

    _renderLyrics(ctx, selectedLines, centerX, startY) {
        const { lyrics } = this.config.typography;
        const { palette } = this.config;

        ctx.font = `${lyrics.weight} ${lyrics.size}px ${lyrics.font}`;
        ctx.fillStyle = palette.text.primary;
        ctx.textAlign = 'center';

        selectedLines.forEach((line, index) => {
            this._wrapText(
                ctx, 
                `"${line}"`, 
                centerX, 
                startY + (index * 100), 
                900, 
                60
            );
        });
    }

    _addBranding(ctx, canvas) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('ZeyraRecords', canvas.width / 2, canvas.height - 100);
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    async getLyrics(trackId) {
        try {
            return await this.musicService.getLyrics(trackId) || "Şarkı sözleri bulunamadı.";
        } catch (error) {
            console.error('Şarkı sözleri alınırken hata:', error);
            return "Şarkı sözleri alınamadı.";
        }
    }
    async shareCustomLyrics(track, lines) {
        try {
            const selectedLines = Array.isArray(lines) ? lines : [lines];
            
            if (!this._validateInput(track, selectedLines)) {
                throw new Error("Geçersiz girdi: Şarkı veya şarkı sözleri eksik");
            }
    
            const shareImage = await this.createLyricsShareImage(track, selectedLines);
            await this._shareWithOptimalMethod(track, selectedLines, shareImage);
        } catch (error) {
            this._handleSharingError(error);
        }
    }
    
    async _shareWithOptimalMethod(track, selectedLines, shareImage) {
        const shareText = this._generateShareText(track, selectedLines);
    
        try {
            if (navigator.share && navigator.canShare) {
                const imageFile = new File([shareImage], 'lyrics_share.png', { type: 'image/png' });
                
                await navigator.share({
                    title: `${track.title} - Şarkı Sözleri`,
                    text: shareText,
                    files: [imageFile]
                });
            } else {
                // Clipboard ve fallback mekanizmaları
                await this._fallbackShare(track, selectedLines, shareImage);
            }
        } catch (error) {
            this._handleSharingError(error);
        }
    }
    
    async _fallbackShare(track, selectedLines, shareImage) {
        const shareText = this._generateShareText(track, selectedLines);
    
        try {
            // Clipboard'a metin kopyalama
            await navigator.clipboard.writeText(shareText);
    
            // Bildirim veya toast mesajı
            this._showShareNotification(track);
    
            // Opsiyonel: Resmi indirme seçeneği
            this._offerImageDownload(shareImage);
        } catch (error) {
            this._handleSharingError(error);
        }
    }
    
    _generateShareText(track, selectedLines) {
        return `🎵 "${track.title}" - ${track.artist}
    
    ${selectedLines.map(line => `"${line}"`).join('\n')}
    
    #ZeyraRecords #Müzik`;
    }
    
    _offerImageDownload(shareImage) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(shareImage);
        link.download = 'lyrics_share.png';
        link.click();
    }
    
    _showShareNotification(track) {
        // Toast veya bildirim sistemi
        const notification = {
            title: 'Paylaşım Başarılı',
            body: `${track.title} şarkısının sözleri kopyalandı`
        };
    
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, { body: notification.body });
        }
    }
    
    _handleSharingError(error) {
        console.error('Paylaşım hatası:', error);
        
        // Kullanıcı dostu hata yönetimi
        const errorMessages = {
            'AbortError': 'Paylaşım iptal edildi',
            'NotAllowedError': 'Paylaşıma izin verilmedi',
            'default': 'Paylaşımda bir sorun oluştu'
        };
    
        const message = errorMessages[error.name] || errorMessages.default;
        
        // Toast veya alert ile kullanıcıya bilgilendirme
        this._showErrorNotification(message);
    }
    
    _showErrorNotification(message) {
        // Örnek toast veya alert mekanizması
        console.warn(message);
        // alert(message); // Basit kullanım
    }
}
