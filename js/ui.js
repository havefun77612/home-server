// js/ui.js
const UI = {
    async renderMovie(file) {
        const grid = document.getElementById('movieGrid');
        const title = file.meta ? file.meta.title : `فيلم محلي - رقم ${file.id}`;
        const description = file.meta ? file.meta.overview : "تم اكتشاف هذا الملف تلقائياً من الفلاشة.";
        
        // توليد لقطة من الفيديو نفسه كبوستر
        const posterUrl = await this.getVideoThumbnail(file.url);

        const card = document.createElement('div');
        card.className = "movie-card glass rounded-2xl overflow-hidden cursor-pointer group border border-white/5 bg-slate-900/40 hover:border-blue-500/50 transition-all duration-500";
        card.innerHTML = `
            <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${posterUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent opacity-90"></div>
                <div class="absolute bottom-4 right-4 bg-blue-600 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <i data-lucide="play" class="fill-current text-white w-6 h-6"></i>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-sm truncate text-blue-400">${title}</h3>
                <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">${file.id}${file.ext}</p>
            </div>
        `;

        card.onclick = () => this.openPlayer(file.url, title, description);
        grid.appendChild(card);
        if (window.lucide) lucide.createIcons();
    },

    // وظيفة سحرية لتوليد بوستر من الفيديو مباشرة (زي VLC)
    getVideoThumbnail(url) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = "anonymous"; // محاولة تخطي قيود الصور
            video.currentTime = 20; // لقطة من الثانية 20
            video.muted = true;
            
            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 450;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL());
            };
            
            video.onerror = () => {
                // لو فشل جلب لقطة (بسبب CORS)، نضع بوستر افتراضي أنيق
                resolve(`https://api.dicebear.com/7.x/initials/svg?seed=${url}&backgroundColor=003087`);
            };
        });
    },

    openPlayer(url, title, desc) {
        const modal = document.getElementById('playerModal');
        const player = document.getElementById('mainPlayer');
        player.src = url;
        document.getElementById('playerTitle').innerText = title;
        document.getElementById('playerDesc').innerText = desc;
        modal.classList.remove('hidden');
        player.play().catch(() => {
            // حل نهائي لو المتصفح منع التشغيل المباشر داخل الـ Modal
            if (confirm("المتصفح يمنع تشغيل الفيديو داخل الصفحة. هل تريد فتحه في نافذة مستقلة؟")) {
                window.open(url, '_blank');
            }
        });
    }
};