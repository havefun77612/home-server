// core.js المعدل للـ Production
const Core = {
    async autoDiscoverFiles() {
        const foundFiles = [];
        // بما إننا مش عارفين الأسامي، هنفحص الأرقام (1-50) 
        // ونحاول نجيب "العنوان" من الـ Metadata بتاع الملف نفسه لو أمكن
        for (let i = 1; i <= 50; i++) {
            for (const ext of CONFIG.EXTENSIONS) {
                const url = `${CONFIG.BASE_URL}${i}${ext}`;
                // فحص بـ Image object لأنه أسرع وأقل قيوداً من الـ Fetch
                const exists = await this.probeResource(url);
                if (exists) {
                    foundFiles.push({
                        id: i,
                        name: `Video File ${i}`, // للأسف المتصفح مش هيعرف الاسم الحقيقي بدون API
                        url: url
                    });
                    break;
                }
            }
        }
        return foundFiles;
    },

    probeResource(url) {
        return new Promise((resolve) => {
            const v = document.createElement('video');
            v.src = url;
            v.preload = 'metadata';
            v.onloadedmetadata = () => resolve(true);
            v.onerror = () => resolve(false);
            setTimeout(() => resolve(false), 1000); // Timeout بعد ثانية
        });
    }
};