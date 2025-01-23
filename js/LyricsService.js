export default class LyricsService {
    constructor(musicService) {
        this.musicService = musicService;
    }

    async createSpotifyStyleShareImage(track, selectedLines) {
        // Validate input
        if (!track || !selectedLines || !Array.isArray(selectedLines)) {
            throw new Error("Invalid input: track and selectedLines are required");
        }

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1DB954');
            gradient.addColorStop(1, '#191414');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = track.cover || 'default-cover.png';

            img.onload = () => {
                const coverSize = 800;
                const coverX = (canvas.width - coverSize) / 2;
                const coverY = 200;

                // Rounded cover image
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(coverX + 50, coverY);
                ctx.arcTo(coverX + coverSize, coverY, coverX + coverSize, coverY + coverSize, 50);
                ctx.arcTo(coverX + coverSize, coverY + coverSize, coverX, coverY + coverSize, 50);
                ctx.arcTo(coverX, coverY + coverSize, coverX, coverY, 50);
                ctx.arcTo(coverX, coverY, coverX + coverSize, coverY, 50);
                ctx.clip();

                ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
                ctx.restore();

                // Track info
                ctx.font = 'bold 70px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'white';
                this.wrapText(ctx, track.title, canvas.width / 2, 1050, canvas.width - 100, 80);

                ctx.font = '50px Arial';
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fillText(track.artist, canvas.width / 2, 1150);

                ctx.font = '40px Arial';
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fillText(track.album || "Bilinmeyen Albüm", canvas.width / 2, 1220);

                // Selected lyrics
                ctx.font = 'bold 50px Arial';
                ctx.fillStyle = 'white';
                selectedLines.forEach((line, index) => {
                    this.wrapText(
                        ctx, 
                        `"${line}"`, 
                        canvas.width / 2, 
                        1300 + (index * 100), 
                        canvas.width - 100, 
                        60
                    );
                });

                // Zeyra logo
                ctx.font = '30px Arial';
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillText('ZeyraRecords', canvas.width / 2, canvas.height - 100);

                canvas.toBlob(blob => {
                    resolve(blob);
                }, 'image/png');
            };

            img.onerror = () => {
                reject(new Error('Cover image could not be loaded'));
            };
        });
    }

    wrapText(context, text, x, y, maxWidth, lineHeight) {
        if (!text) return;
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

async shareCustomLyrics(track, lines) {
    try {
        const selectedLines = Array.isArray(lines) ? lines : [lines];
        
        if (!track || selectedLines.length === 0) {
            throw new Error("Geçersiz girdi: Şarkı veya şarkı sözleri eksik");
        }

        const shareImage = await this.createSpotifyStyleShareImage(track, selectedLines);

        const shareText = `🎵 "${track.title}" - ${track.artist}

${selectedLines.map(line => `"${line}"`).join('\n')}

#ZeyraRecords #Müzik`;
        
        if (navigator.share) {
            // Convert blob to File
            const imageFile = new File([shareImage], 'lyrics_share.png', { type: 'image/png' });
            
            await navigator.share({
                title: `${track.title} - Şarkı Sözleri`,
                text: shareText,
                files: [imageFile]
            });
        } else {
            await navigator.clipboard.writeText(shareText);
            this.showShareNotification(track);
        }
    } catch (error) {
        console.error('Paylaşım hatası:', error);
        this.showShareError(error);
    }
}
    showShareNotification(track) {
        const notification = document.createElement('div');
        notification.className = 'spotify-share-notification';
        notification.innerHTML = `
            <img src="${track.cover}" alt="${track.title}">
            <div class="notification-content">
                <h3>Şarkı sözleri paylaşıldı</h3>
                <p>${track.title} - ${track.artist}</p>
            </div>
            <i class="fas fa-share-alt"></i>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    showShareError(error) {
        const errorNotification = document.createElement('div');
        errorNotification.className = 'share-error';
        errorNotification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${error ? error.message : 'Paylaşım başarısız oldu'}</span>
        `;
        
        document.body.appendChild(errorNotification);
        
        setTimeout(() => {
            errorNotification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(errorNotification);
            }, 500);
        }, 2000);
    }

    async getLyrics(trackId) {
        try {
            const lyrics = await this.musicService.getLyrics(trackId);
            return lyrics || "Şarkı sözleri bulunamadı.";
        } catch (error) {
            console.error('Şarkı sözleri alınırken hata:', error);
            return "Şarkı sözleri alınamadı.";
        }
    }
}