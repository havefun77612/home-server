/**
 * SUEZ STREAM - Video Player Manager
 * يتحكم في مشغل الفيديو، الأنيميشن الخاص به، وإدارة الذاكرة.
 */

export const Player = {
    // جلب عناصر المشغل من واجهة الـ HTML
    elements: {
        modal: document.getElementById('playerModal'),
        video: document.getElementById('mainVideoPlayer'),
        title: document.getElementById('nowPlayingTitle'),
        closeBtn: document.getElementById('closePlayerBtn')
    },

    /**
     * تهيئة المشغل وربط أحداث الإغلاق
     */
    init() {
        // الإغلاق عند الضغط على زر X
        this.elements.closeBtn.addEventListener('click', () => this.close());
        
        // الإغلاق عند الضغط على الخلفية السوداء (خارج إطار الفيديو)
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.close();
        });

        // الإغلاق عند الضغط على زر Escape في الكيبورد
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.modal.classList.contains('hidden')) {
                this.close();
            }
        });
    },

    /**
     * فتح مشغل الفيديو
     * @param {string} url رابط الفيديو
     * @param {string} movieTitle اسم الفيلم
     */
    open(url, movieTitle) {
        this.elements.title.textContent = movieTitle;
        this.elements.video.src = url;
        
        // إظهار النافذة
        this.elements.modal.classList.remove('hidden');
        
        // تأخير بسيط لإضافة تأثير الظهور التدريجي (Fade-in)
        setTimeout(() => {
            this.elements.modal.classList.remove('opacity-0');
            this.elements.modal.classList.add('opacity-100');
        }, 10);

        // تشغيل الفيديو تلقائياً
        this.elements.video.play().catch(err => {
            console.warn("⚠️ تم منع التشغيل التلقائي من قبل المتصفح", err);
        });
    },

    /**
     * إغلاق مشغل الفيديو
     */
    close() {
        // إيقاف الفيديو
        this.elements.video.pause();
        
        // تأثير الاختفاء التدريجي (Fade-out)
        this.elements.modal.classList.remove('opacity-100');
        this.elements.modal.classList.add('opacity-0');
        
        // انتظار انتهاء الأنيميشن قبل إخفاء العنصر بالكامل وتفريغ الذاكرة
        setTimeout(() => {
            this.elements.modal.classList.add('hidden');
            
            // 💡 خطوة هامة جداً: إزالة الرابط لمنع الفيديو من التحميل في الخلفية
            this.elements.video.removeAttribute('src'); 
            this.elements.video.load();
        }, 300); // 300ms تعادل مدة الـ duration في Tailwind
    }
};