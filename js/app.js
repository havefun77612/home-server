// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
    // تشغيل الأيقونات
    if (window.lucide) lucide.createIcons();

    const loader = document.getElementById('loader');
    
    console.log("Starting Auto-Discovery on Network...");

    try {
        // فحص الفلاشة تلقائياً
        const discoveredFiles = await Core.autoDiscover();

        if (discoveredFiles.length > 0) {
            loader.classList.add('hidden');
            // عرض الملفات واحداً تلو الآخر
            for (const file of discoveredFiles) {
                await UI.renderMovie(file);
            }
        } else {
            loader.innerHTML = `
                <div class="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
                    <i data-lucide="info" class="mx-auto mb-2 text-red-500"></i>
                    <p class="text-white font-bold">لم نجد ملفات فيديو (1-50)</p>
                    <p class="text-xs text-slate-400 mt-2">تأكد من تفعيل Insecure Content من إعدادات المتصفح (علامة القفل).</p>
                </div>
            `;
            lucide.createIcons();
        }
    } catch (e) {
        console.error("App Initialization Error:", e);
    }
});

function toggleView(view) {
    const lib = document.getElementById('librarySection');
    const bro = document.getElementById('browserSection');
    
    if (view === 'library') {
        lib.classList.remove('hidden');
        bro.classList.add('hidden');
    } else {
        lib.classList.add('hidden');
        bro.classList.remove('hidden');
    }
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mainPlayer');
    player.pause();
    player.src = "";
    modal.classList.add('hidden');
}