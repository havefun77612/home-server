async function getMetaData(movieTitle) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${CONFIG.TMDB_KEY}&query=${encodeURIComponent(movieTitle)}&language=ar`);
    const data = await response.json();
    return data.results[0] || null;
}

async function scanDrive() {
    const grid = document.getElementById('movieGrid');
    
    for (let id in CONFIG.LIBRARY_MAP) {
        const title = CONFIG.LIBRARY_MAP[id];
        const meta = await getMetaData(title);
        
        // محاولة إيجاد الامتداد الصحيح (Brute-force check)
        let finalUrl = "";
        for (let ext of CONFIG.EXTENSIONS) {
            let testUrl = `${CONFIG.BASE_URL}${id}.${ext}`;
            let exists = await fetch(testUrl, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
            if (exists) { 
                finalUrl = testUrl; 
                break; 
            }
        }

        if (finalUrl) {
            renderCard(id, title, meta, finalUrl);
        }
    }
}