// app.js
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
    
    // نظام البحث الحي
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.movie-card');
        cards.forEach(card => {
            const title = card.dataset.title.toLowerCase();
            card.style.display = title.includes(term) ? 'block' : 'none';
        });
    });
});

async function initApp() {
    const grid = document.getElementById('movieGrid');
    const loader = document.getElementById('loader');
    
    for (const [id, movieName] of Object.entries(CONFIG.LIBRARY_MAP)) {
        const movieData = await fetchTMDB(movieName);
        const validUrl = await findValidExtension(id);
        
        if (validUrl) {
            renderMovie(id, movieName, movieData, validUrl);
        }
    }
    loader.classList.add('hidden');
}

async function fetchTMDB(title) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${CONFIG.TMDB_KEY}&query=${encodeURIComponent(title)}&language=ar`);
        const data = await res.json();
        return data.results[0] || null;
    } catch { return null; }
}

async function findValidExtension(id) {
    for (const ext of CONFIG.EXTENSIONS) {
        const url = `${CONFIG.BASE_URL}${id}.${ext}`;
        try {
            // إضافة mode: 'no-cors' لتجنب المنع، لكن لاحظ أنها قد لا تعطي ok دائماً
            // الحل الأضمن هو استخدام الوسم <img> أو <video> مباشرة للفحص
            const img = new Image();
            img.src = url; 
            // إذا كان المسار صحيحاً، المتصفح سيحاول تحميله
            return url; 
        } catch (e) { continue; }
    }
}

function renderMovie(id, originalTitle, meta, url) {
    const grid = document.getElementById('movieGrid');
    const poster = meta ? `https://image.tmdb.org/t/p/w500${meta.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    
    const card = document.createElement('div');
    card.className = "movie-card glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group shadow-lg border border-white/5";
    card.dataset.title = meta ? meta.title : originalTitle;
    
    card.innerHTML = `
        <div class="relative overflow-hidden">
            <img src="${poster}" alt="${originalTitle}" class="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-4 right-4 bg-blue-600 p-2 rounded-full shadow-lg transform translate-y-12 group-hover:translate-y-0 transition-transform">
                <i data-lucide="play" class="w-5 h-5 fill-current"></i>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-bold truncate text-sm sm:text-base">${meta ? meta.title : originalTitle}</h3>
            <p class="text-xs text-slate-500 mt-1">${meta ? meta.release_date.split('-')[0] : 'ملف محلي'}</p>
        </div>
    `;
    
    card.onclick = () => openPlayer(url, meta ? meta.title : originalTitle, meta ? meta.overview : 'لا يوجد وصف متاح لهذا الملف.');
    grid.appendChild(card);
    lucide.createIcons();
}

// تبديل الواجهات
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

function loadWeb(url) {
    document.getElementById('webFrame').src = url;
}

// مشغل الفيديو
function openPlayer(url, title, desc) {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mainPlayer');
    document.getElementById('playerTitle').innerText = title;
    document.getElementById('playerDesc').innerText = desc;
    
    player.src = url;
    modal.classList.remove('hidden');
    player.play();
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mainPlayer');
    player.pause();
    player.src = "";
    modal.classList.add('hidden');
}