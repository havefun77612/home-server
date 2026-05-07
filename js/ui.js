/**
 * SUEZ STREAM - UI & Visuals Manager
 * مسؤول عن بناء واجهة المستخدم، الكروت، وتوليد البوسترات الحية بشكل آمن.
 */

import { CONFIG } from './config.js';

export const UI = {
    elements: {
        grid: document.getElementById('mediaGrid'),
        loading: document.getElementById('loadingStatus'),
        emptyState: document.getElementById('emptyState')
    },

    /**
     * عرض أو إخفاء مؤشر التحميل
     */
    toggleLoading(show) {
        if (show) {
            this.elements.loading.classList.remove('hidden');
            this.elements.emptyState.classList.add('hidden');
            this.elements.grid.innerHTML = '';
        } else {
            this.elements.loading.classList.add('hidden');
        }
    },

    /**
     * تنظيف اسم الملف ليكون مقروءاً (إزالة الامتداد والشرطات السفلية)
     * مثال: "The_Matrix_1080p.mp4" يتحول إلى "The Matrix 1080p"
     */
    cleanTitle(filename) {
        let title = filename.replace(/\.[^/.]+$/, ""); // إزالة الامتداد
        title = title.replace(/[._]/g, " "); // استبدال الشرطات والنقاط بمسافات
        return title.trim();
    },

    /**
     * رسم شبكة الأفلام في الصفحة الرئيسية
     */
    renderLibrary(movies) {
        this.toggleLoading(false);
        this.elements.grid.innerHTML = '';

        if (!movies || movies.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            return;
        }

        movies.forEach(movie => {
            const cleanName = this.cleanTitle(movie.name);
            // بناء كارت الفيلم (يحتوي على صورة افتراضية رمادية لحين توليد البوستر الحي)
            const cardHtml = `
                <div class="movie-card glass-panel group relative overflow-hidden cursor-pointer" data-url="${movie.url}" data-title="${cleanName}">
                    <!-- حاوية الصورة المصغرة -->
                    <div class="aspect-[2/3] w-full bg-gray-800 relative">
                        <img id="thumb_${movie.id}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%231f2937'/%3E%3C/svg%3E" 
                             class="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="${cleanName}">
                        
                        <!-- غطاء التشغيل (يظهر عند تمرير الماوس) -->
                        <div class="play-overlay absolute inset-0 bg-black/60 flex items-center justify-center">
                            <i class="fa-solid fa-play text-4xl text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-black drop-shadow-2xl"></i>
                        </div>
                    </div>
                    
                    <!-- معلومات الفيلم -->
                    <div class="p-3 bg-gradient-to-t from-slate-900 to-transparent absolute bottom-0 w-full">
                        <h3 class="font-semibold text-sm truncate text-white drop-shadow-md" title="${cleanName}">${cleanName}</h3>
                        <p class="text-xs text-gray-400 mt-1 flex justify-between">
                            <span><i class="fa-solid fa-film"></i> MP4</span>
                            <span>${movie.size || ''}</span>
                        </p>
                    </div>
                </div>
            `;
            this.elements.grid.insertAdjacentHTML('beforeend', cardHtml);
        });

        // بعد رسم كل الكروت بالصور الافتراضية، نبدأ في توليد البوسترات الحية بالترتيب
        this.processThumbnailsQueue(movies);
    },

    /**
     * المعالج المتسلسل (Queue System) لتوليد البوسترات
     * نعالج كل فيديو على حدة لكي لا ينهار خادم HTTP الضعيف الخاص بالراوتر
     */
    async processThumbnailsQueue(movies) {
        console.log(`🎬 جاري توليد البوسترات لـ ${movies.length} فيديو...`);
        for (const movie of movies) {
            try {
                const thumbUrl = await this.generateThumbnail(movie.url);
                const imgElement = document.getElementById(`thumb_${movie.id}`);
                if (imgElement && thumbUrl) {
                    imgElement.src = thumbUrl;
                    // تأثير ظهور تدريجي للبوستر
                    imgElement.classList.add('animate-pulse');
                    setTimeout(() => imgElement.classList.remove('animate-pulse'), 1000);
                }
            } catch (error) {
                console.warn(`لم نتمكن من توليد بوستر للفيديو: ${movie.name}`);
                // في حالة الفشل، نضع أيقونة بديلة
                const imgElement = document.getElementById(`thumb_${movie.id}`);
                if(imgElement) imgElement.src = 'https://via.placeholder.com/480x720/1f2937/ffffff?text=No+Cover';
            }
        }
    },

    /**
     * المحرك السري: يلتقط صورة (Snapshot) من الفيديو باستخدام Canvas
     */
    generateThumbnail(videoUrl) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.crossOrigin = 'anonymous'; // هام لتجنب مشاكل Canvas CORS
            video.muted = true;
            video.preload = 'metadata'; // تحميل البيانات الوصفية فقط لتوفير الباندويث

            // مؤقت لإنهاء العملية إذا استغرق الفيديو وقت طويل (تجنباً للتعليق)
            const timeout = setTimeout(() => {
                video.removeAttribute('src');
                reject('Timeout');
            }, 10000);

            // عندما تصبح بيانات الفيديو جاهزة
            video.addEventListener('loadedmetadata', () => {
                // ننتقل إلى الثانية المحددة في الإعدادات (مثلاً الثانية 10)
                // وإذا كان الفيديو أقصر من 10 ثواني، نأخذ من المنتصف
                video.currentTime = Math.min(CONFIG.THUMBNAIL.SEEK_TIME, video.duration / 2);
            });

            // عندما يصل الفيديو للثانية المحددة
            video.addEventListener('seeked', () => {
                clearTimeout(timeout); // إلغاء المؤقت
                
                try {
                    const canvas = document.createElement('canvas');
                    // الحفاظ على أبعاد الفيديو ولكن تصغير الدقة لتوفير الذاكرة
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    canvas.width = CONFIG.THUMBNAIL.WIDTH_PROXY;
                    canvas.height = CONFIG.THUMBNAIL.WIDTH_PROXY / aspectRatio;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.THUMBNAIL.QUALITY);
                    
                    // تنظيف الذاكرة (Memory Cleanup)
                    video.removeAttribute('src');
                    video.load();
                    
                    resolve(dataUrl);
                } catch (e) {
                    reject(e);
                }
            });

            video.addEventListener('error', () => {
                clearTimeout(timeout);
                reject('Video Error');
            });
        });
    }
};