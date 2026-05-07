// ui.js
const UI = {
    async renderMovie(file) {
        const grid = document.getElementById('movieGrid');
        const card = document.createElement('div');
        card.className = "movie-card glass rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-slate-900/50";
        
        // إنشاء عنصر فيديو خفي لتوليد لقطة (Thumbnail)
        const thumbUrl = await this.generateThumbnail(file.url);

        card.innerHTML = `
            <div class="relative aspect-video">
                <img src="${thumbUrl}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <i data-lucide="play-circle" class="w-12 h-12 text-white"></i>
                </div>
            </div>
            <div class="p-4 text-right">
                <h3 class="font-bold text-sm truncate text-white" title="${file.name}">${file.name}</h3>
                <p class="text-[10px] text-blue-400 mt-1 uppercase">${file.rawName.split('.').pop()}</p>
            </div>
        `;
        
        card.onclick = () => this.play(file.url, file.name);
        grid.appendChild(card);
        if (window.lucide) lucide.createIcons();
    },

    generateThumbnail(url) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = "anonymous";
            video.currentTime = 10; // التقاط لقطة من الثانية العاشرة
            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 180;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL());
            };
            video.onerror = () => resolve('https://via.placeholder.com/320x180?text=No+Preview');
        });
    },

    play(url, title) {
        const modal = document.getElementById('playerModal');
        const player = document.getElementById('mainPlayer');
        player.src = url;
        document.getElementById('playerTitle').innerText = title;
        modal.classList.remove('hidden');
        player.play();
    }
};