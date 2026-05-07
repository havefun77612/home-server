/**
 * SUEZ STREAM - Main Application Controller
 * العقل المدبر الذي يربط واجهة المستخدم، محرك البحث، والمشغل معاً.
 */

import { MediaScanner } from './core.js';
import { UI } from './ui.js';
import { Player } from './player.js';

const App = {
    /**
     * دالة البدء التي تعمل عند تحميل الصفحة
     */
    async init() {
        console.log("🚀 SUEZ STREAM Initialized...");
        
        // 1. تهيئة مشغل الفيديو
        Player.init();

        // 2. ربط أزرار الواجهة بالأحداث (Events)
        this.bindEvents();

        // 3. بدء عملية البحث عن الملفات فوراً
        await this.loadMedia();
    },

    /**
     * جلب الملفات ورسمها على الشاشة
     */
    async loadMedia() {
        UI.toggleLoading(true); // إظهار مؤشر التحميل
        
        try {
            // الاتصال بـ core.js لجلب الملفات
            const mediaList = await MediaScanner.scanForMedia();
            // إرسال الملفات لـ ui.js لرسمها وتوليد البوسترات
            UI.renderLibrary(mediaList);
        } catch (error) {
            console.error("❌ حدث خطأ غير متوقع أثناء فحص الشبكة:", error);
            UI.toggleLoading(false);
            UI.elements.emptyState.classList.remove('hidden');
        }
    },

    /**
     * إدارة أحداث المستخدم (الضغط، البحث، التحديث)
     */
    bindEvents() {
        // 1. حدث الضغط على كارت لتشغيل الفيلم
        // نستخدم (Event Delegation) بوضع الحدث على الشبكة كاملة لتوفير الذاكرة
        UI.elements.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.movie-card');
            if (card) {
                const url = card.getAttribute('data-url');
                const title = card.getAttribute('data-title');
                if (url) Player.open(url, title);
            }
        });

        // 2. حدث إعادة الفحص (Rescan)
        document.getElementById('rescanBtn').addEventListener('click', () => {
            this.loadMedia();
        });

        // 3. حدث البحث المباشر في المكتبة المحلية
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.filterCards(searchTerm);
            });
        }
    },

    /**
     * فلترة الكروت المعروضة بناءً على البحث
     * 💡 نستخدم طريقة (إخفاء/إظهار CSS) بدلاً من إعادة الرسم (Re-render)
     * لكي لا نفقد البوسترات التي تعب الراوتر في توليدها!
     */
    filterCards(term) {
        const cards = document.querySelectorAll('.movie-card');
        let hasVisibleCards = false;

        cards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            if (title.includes(term)) {
                card.style.display = 'block';
                hasVisibleCards = true;
            } else {
                card.style.display = 'none';
            }
        });

        // إذا لم توجد نتائج بحث، نظهر رسالة "فارغ"
        if (!hasVisibleCards && cards.length > 0) {
            UI.elements.emptyState.classList.remove('hidden');
        } else if (cards.length > 0) {
            UI.elements.emptyState.classList.add('hidden');
        }
    }
};

// تشغيل المنصة بمجرد أن يقوم المتصفح ببناء شجرة الـ HTML (DOM)
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});