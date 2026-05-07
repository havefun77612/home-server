// app.js - المحرك الرئيسي للنظام
document.addEventListener('DOMContentLoaded', async () => {
    // 1. تهيئة الأيقونات (Lucide Icons)
    if (window.lucide) {
        lucide.createIcons();
    }

    const loader = document.getElementById('loader');
    const movieGrid = document.getElementById('movieGrid');

    console.log("جاري فحص الفلاشة تلقائياً...");

    try {
        // 2. استدعاء وظيفة الاكتشاف التلقائي من ملف core.js
        // الوظيفة دي بتقرأ صفحة الراوتر وتطلع منها روابط الملفات والأسماء
        const files = await Core.autoDiscoverFiles();

        if (files && files.length > 0) {
            // إخفاء اللودر بمجرد إيجاد ملفات
            loader.classList.add('hidden');

            // 3. معالجة كل ملف تم إيجاده
            for (const file of files) {
                // استدعاء وظيفة العرض من ملف ui.js
                // الوظيفة دي بتعمل الكارت، بتولد البوستر من الفيديو، وبتضيفه للشبكة
                await UI.renderMovie(file);
            }
            
            console.log(`تم اكتشاف ${files.length} ملف فيديو بنجاح.`);
        } else {
            // في حالة عدم وجود ملفات أو فشل الوصول للراوتر
            loader.innerHTML = `
                <div class="text-center p-10 bg-red-900/20 border border-red-500/50 rounded-2xl">
                    <i data-lucide="alert-triangle" class="mx-auto text-red-500 mb-4 w-12 h-12"></i>
                    <p class="text-white font-bold">لم يتم العثور على ملفات أو تعذر الوصول للراوتر</p>
                    <p class="text-sm text-slate-400 mt-2">تأكد من تفعيل HTTP Sharing في إعدادات الراوتر ومن أنك سمحت بالـ Insecure Content في المتصفح.</p>
                    <button onclick="location.reload()" class="mt-4 bg-white/10 px-4 py-2 rounded-lg text-xs">إعادة المحاولة</button>
                </div>
            `;
            lucide.createIcons();
        }
    } catch (error) {
        console.error("خطأ أثناء تشغيل التطبيق:", error);
        loader.innerText = "حدث خطأ تقني أثناء تحميل المكتبة.";
    }
});

/**
 * وظيفة التبديل بين قسم المكتبة وقسم المتصفح
 * @param {string} view - اسم القسم المراد عرضه ('library' أو 'browser')
 */
function toggleView(view) {
    const libSection = document.getElementById('librarySection');
    const broSection = document.getElementById('browserSection');

    if (view === 'library') {
        libSection.classList.remove('hidden');
        broSection.classList.add('hidden');
    } else if (view === 'browser') {
        libSection.classList.add('hidden');
        broSection.classList.remove('hidden');
    }
    
    // تحديث الأيقونات في حالة وجودها داخل الأقسام المبدلة
    if (window.lucide) lucide.createIcons();
}

/**
 * وظيفة إغلاق مشغل الفيديو وتنظيف المصدر
 */
function closePlayer() {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mainPlayer');
    
    // إيقاف الفيديو وتفريغ المصدر لتحرير الرامات
    player.pause();
    player.src = "";
    
    modal.classList.add('hidden');
}

// إضافة حدث لإغلاق المشغل عند الضغط على زر Escape في الكيبورد
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closePlayer();
    }
});