// js/core.js
const Core = {
    // وظيفة لاكتشاف الملفات دون الحاجة لـ API من الراوتر
    async autoDiscover() {
        const foundFiles = [];
        const promises = [];

        // سنقوم بعمل فحص متوازي لسرعة التنفيذ
        for (let i = 1; i <= CONFIG.SCAN_RANGE; i++) {
            promises.push(this.probeAllExtensions(i));
        }

        const results = await Promise.all(promises);
        return results.filter(file => file !== null);
    },

    async probeAllExtensions(id) {
        for (const ext of CONFIG.EXTENSIONS) {
            const url = `${CONFIG.BASE_URL}${id}${ext}`;
            const isAlive = await this.checkUrl(url);
            if (isAlive) {
                // محاولة جلب بيانات وصفية من TMDB بناءً على الرقم كـ ID (اختياري)
                const meta = await this.getQuickMeta(id);
                return { id, url, ext, meta };
            }
        }
        return null;
    },

    // فحص الرابط باستخدام Image لأنه يتخطى بعض قيود CORS الصارمة عن الـ Fetch
    checkUrl(url) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = url;
            video.preload = 'metadata';
            video.onloadedmetadata = () => resolve(true);
            video.onerror = () => resolve(false);
            // وقت انتظار أقصى ثانية واحدة لكل ملف
            setTimeout(() => resolve(false), 1500);
        });
    },

    async getQuickMeta(id) {
        try {
            // محاولة جلب اسم وفيلم عشوائي من قائمة الأفلام الشائعة لملء البيانات
            const res = await fetch(`https://api.themoviedb.org/3/movie/${id + 100}?api_key=${CONFIG.TMDB_KEY}&language=ar`);
            if (res.ok) return await res.json();
        } catch (e) { return null; }
        return null;
    }
};