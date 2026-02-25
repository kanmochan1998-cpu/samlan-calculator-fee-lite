/**
 * SAMLAN NP FEE CALCULATOR (Multi-Language & Compact UI Version)
 * Author: Nopphakao
 */
// --- DATABASE SETUP ---
const db = new Dexie("SamlanDB");
db.version(1).stores({ transactions: '++id, timestamp' });

// --- CONFIGURATION ---
const feeItems = [
    // 1. หมวดบุคคล
    { id: 'adult_thai', price: 20, type: 'person', unit_key: 'person', name_th: 'ผู้ใหญ่ไทย', name_en: 'Adult (Thai)', name_cn: '泰国成人' },
    { id: 'child_thai', price: 10, type: 'person', unit_key: 'person', name_th: 'เด็กไทย', name_en: 'Child (Thai)', name_cn: '泰国儿童' },
    { id: 'adult_foreign', price: 100, type: 'person', unit_key: 'person', name_th: 'ผู้ใหญ่ต่างชาติ', name_en: 'Adult (Foreign)', name_cn: '外国成人' },
    { id: 'child_foreign', price: 50, type: 'person', unit_key: 'person', name_th: 'เด็กต่างชาติ', name_en: 'Child (Foreign)', name_cn: '外国儿童' },

    // 2. หมวดยานพาหนะ
    { id: 'moto', price: 20, type: 'vehicle', unit_key: 'vehicle', name_th: 'จักรยานยนต์', name_en: 'Motorcycle', name_cn: '摩托车' },
    { id: 'car4', price: 30, type: 'vehicle', unit_key: 'vehicle', name_th: 'รถยนต์ 4 ล้อ', name_en: 'Car (4 Wheels)', name_cn: '4轮汽车' },
    { id: 'car6', price: 100, type: 'vehicle', unit_key: 'vehicle', name_th: 'รถยนต์ 6 ล้อ', name_en: 'Car (6 Wheels)', name_cn: '6轮汽车' },
    { id: 'car_heavy', price: 200, type: 'vehicle', unit_key: 'vehicle', name_th: 'มากกว่า 6 ล้อ', name_en: 'Truck (>6 Wheels)', name_cn: '大型卡车' },

    // 3. หมวดยกเว้น 
    { id: 'adult_thai_free', price: 0, type: 'exemption', unit_key: 'person', name_th: 'ผู้ใหญ่ไทย', name_en: 'Adult (Thai) Free', name_cn: '泰国成人(免票)' },
    { id: 'child_thai_free', price: 0, type: 'exemption', unit_key: 'person', name_th: 'เด็กไทย', name_en: 'Child (Thai) Free', name_cn: '泰国儿童(免票)' },
    { id: 'free_elderly', price: 0, type: 'exemption', unit_key: 'person', name_th: 'ผู้สูงอายุไทย', name_en: 'Elderly (60+)', name_cn: '老年人(免票)' },
    { id: 'free_disabled', price: 0, type: 'exemption', unit_key: 'person', name_th: 'ผู้พิการ', name_en: 'Disabled', name_cn: '残疾人(免票)' },
    { id: 'free_monk', price: 0, type: 'exemption', unit_key: 'monk', name_th: 'นักบวช', name_en: 'Monk', name_cn: '僧侣(免票)' },
    { id: 'free_car', price: 0, type: 'exemption', unit_key: 'vehicle', name_th: 'รถยนต์ 4 ล้อ', name_en: 'Exempt Vehicle', name_cn: '4轮汽车(免费)' },

    { id: 'free_motorcycle', price: 0, type: 'exemption', unit_key: 'vehicle', name_th: 'จักรยานยนต์', name_en: 'Exempt Motorcycle', name_cn: '摩托车(免费)' },
    { id: 'free_car6', price: 0, type: 'exemption', unit_key: 'vehicle', name_th: 'รถยนต์ 6 ล้อ', name_en: 'Free Car (6 Wheels)', name_cn: '6轮汽车(免费)' },
    { id: 'free_car6-10', price: 0, type: 'exemption', unit_key: 'vehicle', name_th: 'มากกว่า 6 ล้อ', name_en: 'Free Truck (>6 Wheels)', name_cn: '大型卡车(免费)' },

    // 4. หมวดที่พัก 
    { id: 'camp_fee', price: 30, type: 'sleep', unit_key: 'person', name_th: 'ค่ากางเต็นท์', name_en: 'Camping Fee', name_cn: '露营费' },
    { id: 'tent_rent', price: 225, type: 'sleep', unit_key: 'tent', name_th: 'เช่าเต็นท์', name_en: 'Rent Tent', name_cn: '租用帐篷' },
    { id: 'sleeping_bag', price: 30, type: 'sleep', unit_key: 'bag', name_th: 'ถุงนอน', name_en: 'Sleeping Bag', name_cn: '睡袋' },
    { id: 'mat', price: 20, type: 'sleep', unit_key: 'mat', name_th: 'แผ่นรองนอน', name_en: 'Mat', name_cn: '防潮垫' },
    { id: 'pillow', price: 10, type: 'sleep', unit_key: 'pillow', name_th: 'หมอน', name_en: 'Pillow', name_cn: '枕头' }
];

const translations = {
    th: {
        appTitle: 'น้ำตกสามหลั่น', appSubtitle: 'National Park Fee', btnReset: 'รีเซ็ต',
        nights: 'คืน:', totalItems: 'รายการรวม:', currency: 'บาท', btnCalculate: 'คิดเงิน', btnMenu: 'เมนู',
        statusEmpty: 'ว่าง', statusSaved: 'บันทึกแล้ว', historyTitle: 'ประวัติและสรุปยอด',
        btnClearHistory: 'ล้างประวัติ', btnExportCSV: 'ส่งออก CSV', latestItems: 'รายการล่าสุด',
        modalCashOnly: '⚠️ รับเฉพาะเงินสด', modalTotalPay: 'ยอดที่ต้องชำระ', modalReceived: 'รับมา',
        modalChange: 'เงินทอน', modalBtnExact: 'ชำระพอดี (Exact)', modalBtnExactSelected: '✅ ชำระพอดี', modalBtnFinish: 'เสร็จสิ้น',
        modalErrorNoItem: 'กรุณาเลือกรายการก่อนครับ', modalErrorNotEnough: 'เงินไม่พอครับ',
        dailyTotal: 'รายได้รวมวันนี้', dailySleep: 'ที่พัก & ค้างแรม', dailyVehicle: 'ยานพาหนะ (รวม)', dailyPerson: 'บุคคล (รวม)', dailyCampers: 'ผู้ค้างแรม',
        btnHideRare: 'ซ่อนรายการที่พบไม่บ่อย', btnHidingRare: 'กำลังซ่อนรายการที่พบไม่บ่อย',
        cats: { person: 'บุคคล', vehicle: 'ยานพาหนะ', sleep: 'ค้างแรม & อุปกรณ์', exemption: 'ยกเว้นค่าธรรมเนียม' },
        units: { person: 'คน', vehicle: 'คัน', tent: 'หลัง', bag: 'ใบ', mat: 'แผ่น', pillow: 'ใบ', monk: 'รูป', free: 'ฟรี' }
    },
    en: {
        appTitle: 'Namtok Samlan', appSubtitle: 'National Park Fee', btnReset: 'Reset',
        nights: 'Nights:', totalItems: 'Total Items:', currency: 'THB', btnCalculate: 'Pay', btnMenu: 'Menu',
        statusEmpty: 'Empty', statusSaved: 'Saved', historyTitle: 'History & Summary',
        btnClearHistory: 'Clear History', btnExportCSV: 'Export CSV', latestItems: 'Recent Transactions',
        modalCashOnly: '⚠️ Cash Only', modalTotalPay: 'Total to Pay', modalReceived: 'Received',
        modalChange: 'Change', modalBtnExact: 'Exact Amount', modalBtnExactSelected: '✅ Exact Amount', modalBtnFinish: 'Finish',
        modalErrorNoItem: 'Please select items first.', modalErrorNotEnough: 'Not enough money.',
        dailyTotal: 'Today Revenue', dailySleep: 'Camping & Rentals', dailyVehicle: 'Vehicles (All)', dailyPerson: 'Entrance (All)', dailyCampers: 'Campers',
        btnHideRare: 'Hide Rare Items', btnHidingRare: 'Hiding Rare Items',
        cats: { person: 'Entrance Fee', vehicle: 'Vehicles', sleep: 'Camping & Rental', exemption: 'Exemptions' },
        units: { person: ' ', vehicle: ' ', tent: ' ', bag: ' ', mat: ' ', pillow: ' ', monk: ' ', free: ' ' }
    },
    cn: {
        appTitle: '三兰瀑布', appSubtitle: '国家公园门票', btnReset: '重置',
        nights: '晚数:', totalItems: '总项目:', currency: '泰铢', btnCalculate: '结账', btnMenu: '菜单',
        statusEmpty: '空', statusSaved: '已保存', historyTitle: '历史记录与摘要',
        btnClearHistory: '清除历史', btnExportCSV: '导出 CSV', latestItems: '最近交易',
        modalCashOnly: '⚠️ 仅收现金', modalTotalPay: '应付总额', modalReceived: '已收',
        modalChange: '找零', modalBtnExact: '正好金额', modalBtnExactSelected: '✅ 正好金额', modalBtnFinish: '完成',
        modalErrorNoItem: '请先选择项目。', modalErrorNotEnough: '金额不足。',
        dailyTotal: '今日总收入', dailySleep: '住宿 & 租赁', dailyVehicle: '车辆 (全部)', dailyPerson: '门票 (全部)', dailyCampers: '露营者',
        btnHideRare: '隐藏不常用项目', btnHidingRare: '正在隐藏不常用项目',
        cats: { person: '门票', vehicle: '车辆', sleep: '住宿 & 租赁', exemption: '免票' },
        units: { person: '人', vehicle: '辆', tent: '顶', bag: '个', mat: '张', pillow: '个', monk: '位', free: '免费' }
    }
};

const langIcons = { th: 'TH', en: 'EN', cn: 'CN' };

// --- APP CONTROLLER ---
const app = {
    cart: {}, cartNights: {}, currentNights: 1,
    langs: ['th', 'en', 'cn'], currentLangIndex: 0,
    patterns: {}, pressTimer: null, isLongPress: false,

    // 1. เพิ่มตัวแปรสำหรับซ่อนการ์ด และรายชื่อ ID ที่พบไม่บ่อย
    hideRareItems: false,
    rareItemIds: [
        'adult_foreign', 'child_foreign', 
        'car6', 'car_heavy', 
        'adult_thai_free', 'child_thai_free', 
        'free_disabled', 'free_monk', 
        'free_car6', 'free_car6-10'
    ],

    // 2. เพิ่มฟังก์ชันสลับการซ่อน
    toggleRareItems() {
        this.hideRareItems = !this.hideRareItems;
        localStorage.setItem('samlan_hide_rare', this.hideRareItems);
        if (navigator.vibrate) navigator.vibrate(20);
        this.renderItems(); // วาดหน้าจอใหม่ทันที
    },
init() {
        // --- ระบบความจำโหมดกลางคืน (Dark Mode) ---
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (localStorage.getItem('samlan_hide_rare') !== null) {
            this.hideRareItems = localStorage.getItem('samlan_hide_rare') === 'true';
        }

        this.renderAllText();
        this.renderNightButtons();
        this.renderItems();
        window.addEventListener('scroll', () => this.handleScroll());
        
        const savedPatterns = localStorage.getItem('samlan_patterns');
        if (savedPatterns) {
            this.patterns = JSON.parse(savedPatterns);
            ['c1', 'c2', 'c3'].forEach(id => this.renderPatternButton(id));
        }

        // --- โหลดชื่อเจ้าหน้าที่ และสร้างดรอปดาวน์วันที่ ---
        this.loadOfficerName();
        this.history.populateDateDropdown();
    },

    // --- ฟังก์ชันสลับโหมดกลางคืน ---
    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (navigator.vibrate) navigator.vibrate(20);
    },

    // --- ฟังก์ชันบันทึกชื่อเจ้าหน้าที่แบบถาวร ---
    saveOfficerName(name) {
        localStorage.setItem('samlan_officer', name);
    },
    loadOfficerName() {
        const name = localStorage.getItem('samlan_officer') || '';
        const el = document.getElementById('officer-name');
        if(el) el.value = name;
        return name;
    },

    toggleLanguage() {
        this.currentLangIndex = (this.currentLangIndex + 1) % this.langs.length;
        this.renderAllText();
        this.renderItems();
        if(!document.getElementById('paymentModal').classList.contains('hidden')) {
            paymentModal.renderList();
            paymentModal.renderMoneyButtons();
            paymentModal.updateDisplay();
        }
        if(!document.getElementById('historyOverlay').classList.contains('hidden')) {
            this.history.render();
        }
        if (navigator.vibrate) navigator.vibrate(20);
    },

    getCurrentLang() {
        return this.langs[this.currentLangIndex];
    },

    renderAllText() {
        const lang = this.getCurrentLang();
        const t = translations[lang];
        
        // Update all toggle buttons
        document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
            btn.innerText = langIcons[lang];
        });

        const setText = (id, text) => { const el = document.getElementById(id); if(el) el.innerText = text; };
        
        setText('nav-title', t.appTitle); setText('nav-subtitle', t.appSubtitle);
        setText('btn-reset', t.btnReset); setText('txt-nights', t.nights);
        setText('txt-total-items', t.totalItems); setText('txt-currency-main', t.currency);
        setText('btn-main-calc', t.btnCalculate); setText('txt-menu', t.btnMenu);
        setText('txt-cash-only', t.modalCashOnly); setText('txt-total-pay', t.modalTotalPay);
        setText('modal-currency', t.currency); setText('txt-received', t.modalReceived);
        setText('txt-change', t.modalChange); setText('btn-finish', t.modalBtnFinish);
        setText('txt-history-title', t.historyTitle); setText('txt-btn-clear', t.btnClearHistory);
        setText('txt-btn-export', t.btnExportCSV); setText('txt-latest-items', t.latestItems);

        // Update C1-C3 texts
        ['c1', 'c2', 'c3'].forEach(id => {
            const btn = document.getElementById(`btn-${id}`);
            if(btn) {
                const textEl = btn.querySelector('.status-text');
                if(textEl) textEl.innerText = this.patterns[id] ? t.statusSaved : t.statusEmpty;
            }
        });
    },

    startPress(id) {
        const e = window.event;
        // ถ้าเป็นการทัชหน้าจอ ให้แอปจำไว้ว่าเครื่องนี้เป็นระบบสัมผัส
        if (e && e.type === 'touchstart') this.isTouch = true;
        // ถ้ามีสัญญาณเมาส์ผีส่งตามมา ให้บล็อกทิ้ง (return ออกไปเลย)
        if (e && e.type && e.type.includes('mouse') && this.isTouch) return;

        this.isLongPress = false; 
        this.pressTimer = setTimeout(() => {
            this.isLongPress = true; this.savePattern(id);
        }, 800); 
    },

    endPress(id) {
        const e = window.event;
        // บล็อกสัญญาณเมาส์ผีตอนปล่อยนิ้ว หรือตอนไปกดปุ่มอื่น
        if (e && e.type && e.type.includes('mouse') && this.isTouch) return;

        if (this.pressTimer) { clearTimeout(this.pressTimer); this.pressTimer = null; }
        const btn = document.getElementById(`btn-${id}`); if (btn) btn.blur(); 
        
        if (!this.isLongPress) {
            this.usePattern(id);
        }
        this.isLongPress = false; 
    },

    savePattern(id) {
        const hasItems = Object.values(this.cart).some(qty => qty > 0);
        
        if (hasItems) {
            // บันทึกข้อมูล
            this.patterns[id] = { cart: JSON.parse(JSON.stringify(this.cart)), nights: JSON.parse(JSON.stringify(this.cartNights)) };
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            // ลบข้อมูล
            delete this.patterns[id];
            if (navigator.vibrate) navigator.vibrate([50]);
        }
        
        // บันทึกลงถังความจำถาวรทันที
        localStorage.setItem('samlan_patterns', JSON.stringify(this.patterns));
        
        // เรียกใช้ฟังก์ชันวาดปุ่มที่สร้างไว้
        this.renderPatternButton(id); 
    },

    // ฟังก์ชันวาดปุ่ม C1-C3 (ใช้ทั้งตอนกดบันทึก และตอนโหลดแอป)
    renderPatternButton(id) {
        const btn = document.getElementById(`btn-${id}`);
        if (!btn) return;
        
        const hasData = !!this.patterns[id];
        const t = translations[this.getCurrentLang()];

        if (hasData) {
            // โค้ดสีตามปุ่ม
            let colorClass = id === 'c1' ? 'border-blue-300 bg-blue-100 text-blue-600 shadow-blue-100' : 
                             id === 'c2' ? 'border-orange-300 bg-orange-100 text-orange-600 shadow-orange-100' : 
                                           'border-purple-300 bg-purple-100 text-purple-600 shadow-purple-100';

            btn.className = `flex flex-col items-center justify-center py-2 rounded-xl border border-b-4 shadow-md active:shadow-none active:border-b-0 active:translate-y-1 transition-all select-none ${colorClass}`;
            btn.innerHTML = `<span class="text-xs font-black mb-0.5">C${id.slice(1)}</span><span class="text-[8px] font-bold opacity-90 status-text">${t.statusSaved}</span>`;
        } else {
            // โค้ดสีปุ่มว่าง
            btn.className = 'flex flex-col items-center justify-center py-2 rounded-xl border border-slate-200 border-b-4 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-md active:shadow-none active:border-b active:translate-y-0.5 transition-all select-none outline-none ring-0';
            btn.innerHTML = `<span class="text-xs font-bold text-slate-500 dark:text-slate-300 mb-0.5">C${id.slice(1)}</span><span class="text-[8px] text-slate-400 status-text">${t.statusEmpty}</span>`;
        }
    },

    usePattern(id) {
        if (!this.patterns[id]) return;
        this.cart = JSON.parse(JSON.stringify(this.patterns[id].cart));
        this.cartNights = JSON.parse(JSON.stringify(this.patterns[id].nights));
        this.renderItems();
        if (navigator.vibrate) navigator.vibrate(30);
        
        // เพิ่มตัวหน่วงเวลา 0.3 วินาที ป้องกันบั๊ก "นิ้วกดทะลุ" (Ghost Click) ไปโดนปุ่มเสร็จสิ้น
        setTimeout(() => {
            paymentModal.open();
        }, 300);
    },

    reset() {
        this.cart = {}; this.cartNights = {}; this.currentNights = 1;
        this.renderNightButtons(); this.renderItems();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateCart(id, change) {
        if (!this.cart[id]) this.cart[id] = 0;
        const item = feeItems.find(i => i.id === id);

        if (change > 0) {
            if (item.type === 'sleep') {
                if (this.cart[id] === 0) { this.cartNights[id] = this.currentNights; this.cart[id]++; } 
                else if (this.cartNights[id] !== this.currentNights) { this.cartNights[id] = this.currentNights; this.renderItems(); return; } 
                else { this.cart[id]++; }
            } else {
                this.cartNights[id] = 1; this.cart[id]++;
            }
        } else {
            if (this.cart[id] > 0) this.cart[id]--;
            if (this.cart[id] === 0) delete this.cartNights[id];
        }
        if (navigator.vibrate) navigator.vibrate(10);
        this.renderItems();
    },

    setNight(n) {
        this.currentNights = n; this.renderNightButtons();
        if (navigator.vibrate) navigator.vibrate(20);
    },

    renderNightButtons() {
        const container = document.getElementById('night-selector-container');
        if (!container) return;
        container.innerHTML = '';
        [1, 2, 3, 4, 5].forEach(n => {
            const btn = document.createElement('button');
            const isActive = n === this.currentNights;
            btn.className = `w-10 h-10 rounded-full font-bold transition-all text-m border ${isActive ? 'bg-orange-400 text-white shadow-xl heartbeat-active' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`;
            btn.innerText = n; btn.onclick = () => this.setNight(n);
            container.appendChild(btn);
        });
    },

    renderItems() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';
        const lang = this.getCurrentLang();
        const t = translations[lang];

        ['person', 'vehicle', 'exemption', 'sleep'].forEach(group => {
            let items = feeItems.filter(i => i.type === group);
            
            // 3. กรองการ์ดที่พบไม่บ่อยออก (ถ้าโหมดซ่อนเปิดอยู่ และการ์ดนั้นไม่ได้ถูกกดเลือกไว้)
            if (this.hideRareItems) {
                items = items.filter(item => !this.rareItemIds.includes(item.id) || (this.cart[item.id] > 0));
            }

            if (items.length === 0) return;

            let color = group === 'person' ? 'text-emerald-600' : (group === 'vehicle' ? 'text-blue-600' : (group === 'sleep' ? 'text-orange-600' : 'text-purple-600'));
            
            const section = document.createElement('div');
            section.className = 'mb-2';
            section.id = `group-${group}`;
            
            // 4. สร้างส่วนหัวของหมวดหมู่ พร้อมปุ่มซ่อน (จะแทรกปุ่มเฉพาะหมวด 'person' เท่านั้น)
            let headerHTML = `<div class="flex justify-between items-end mb-1 border-b pb-1 dark:border-slate-700">
                <h3 class="font-bold text-3xl ${color} leading-none">${t.cats[group]}</h3>`;
            
            if (group === 'person') {
                const isHidden = this.hideRareItems;
                
                // ใช้ Tailwind ทำสีไล่เฉดมรกตไปฟ้าน้ำทะเล พร้อมเรียกใช้อนิเมชั่น dukdik-active
                const btnStyle = isHidden 
                    ? "px-3 py-1.5 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-200 dark:shadow-none dukdik-active border-0" 
                    : "px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 active:scale-95 transition-all";
                
                const btnText = isHidden ? t.btnHidingRare : t.btnHideRare;
                
                headerHTML += `<button onclick="app.toggleRareItems()" class="${btnStyle}">${btnText}</button>`;
            }
            
            headerHTML += `</div>`;

            if (group === 'sleep') {
                headerHTML += `
                <div class="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">🌙</span>
                        <span id="txt-nights" class="text-sm font-bold text-blue-800 dark:text-blue-200">${t.nights}</span>
                    </div>
                    <div class="flex gap-1.5 overflow-x-auto no-scrollbar" id="night-selector-container"></div>
                </div>`;
            }
            section.innerHTML = headerHTML;
            
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 md:grid-cols-4 gap-3';

            items.forEach(item => {
                const qty = this.cart[item.id] || 0;
                const isActive = qty > 0;
                
                // --- LITE MODE: ใช้แค่กรอบสีทึบ (Solid Border) แทนเงาเรืองแสง ---
                let glow = isActive 
                    ? `border-2 ${
                        group === 'person' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/50' :
                        group === 'vehicle' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' :
                        group === 'sleep' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50' :
                        'border-purple-500 bg-purple-50 dark:bg-purple-900/50'
                      }` 
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 border';

                // ควบคุมภาษา
                let primaryName = lang === 'th' ? item.name_th : (lang === 'en' ? item.name_en : item.name_cn);
                let secondaryName = lang === 'th' ? item.name_en : item.name_th;
                let unitText = t.units[item.unit_key] || item.unit;
                let priceText = item.price === 0 ? t.units.free : item.price;

                const card = document.createElement('div');
                
                // --- LITE MODE: ตัด hover เด้งๆ และเงาฟุ้งๆ ทิ้ง เน้นความเบา ---
                card.className = `relative rounded-xl p-3 h-24 ${glow} active:bg-slate-100 dark:active:bg-slate-700 cursor-pointer select-none flex flex-col justify-between`;
                card.onclick = () => this.updateCart(item.id, 1);
            
                const priceColor = item.type === 'person' ? 'text-emerald-600 dark:text-emerald-400' : item.type === 'vehicle' ? 'text-blue-500 dark:text-blue-400' : item.type === 'sleep' ? 'text-orange-600 dark:text-orange-400' : item.type === 'exemption' ? 'text-purple-600 dark:text-purple-400' : item.price === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400';

                // --- LITE MODE: เอาคลาส heartbeat-active ออกจากป้ายจำนวนคืน ---
                card.innerHTML = `
                    ${(item.type === 'sleep' && isActive) ? 
                        `<div class="absolute -top-2 -left-2 bg-orange-500 text-white px-2 h-6 flex items-center justify-center rounded-full font-bold text-[10px] z-10">
                            ${this.cartNights[item.id]} ${t.nights.replace(':','')}
                        </div>` 
                    : ''}
                    <div class="flex flex-col overflow-hidden">
                        <span class="font-bold text-sm leading-tight truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}">${primaryName}</span>
                        <span class="text-[9px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">${secondaryName}</span>
                    </div>
                    
                    <div class="flex items-end justify-between mt-1">
                        <div class="flex flex-col">                           
                             <span class="text-xl font-black ${priceColor}">${priceText}</span>
                        </div>
                        
                        <div class="flex flex-col items-end leading-none">
                            <div class="flex items-baseline gap-1">
                                <span class="text-3xl font-black ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-200 dark:text-slate-500'}">${qty}</span>
                                <span class="text-[12px] font-bold ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-500'} mb-0.5">${unitText}</span>
                            </div>
                        </div>
                    </div>
                    ${isActive ? `<button onclick="event.stopPropagation(); app.updateCart('${item.id}', -1)" class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-bold active:bg-red-600 z-10">-</button>` : ''}
                `;
                grid.appendChild(card);
            });
            section.appendChild(grid);
            container.appendChild(section);
        });
        this.updateTotal();
        this.renderNightButtons();
    },

    updateTotal() {
        let count = 0, price = 0;
        for (const [id, qty] of Object.entries(this.cart)) {
            const item = feeItems.find(i => i.id === id);
            const nights = this.cartNights[id] || 1;
            price += (item.price * qty * nights); count += qty;
        }
        document.getElementById('total-count').innerText = count;
        document.getElementById('total-price').innerText = price.toLocaleString();
        return price;
    },

    handleScroll() {
        
    },

    toggleMenu() {
        if (navigator.vibrate) navigator.vibrate(10);
        this.history.open(); 
    },

   history: { 
        currentDate: new Date().toISOString().split('T')[0], // เก็บวันที่กำลังดูอยู่
        chartInstance: null,

        // 1. สร้างตัวเลือกวันที่ย้อนหลัง 7 วัน
        populateDateDropdown() {
            const select = document.getElementById('history-date-select');
            if(!select) return;
            select.innerHTML = '';
            for(let i=0; i<7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('sv-SE'); 
                const options = { day: 'numeric', month: 'short', year: 'numeric' };
                const displayStr = i === 0 ? `วันนี้ (${d.toLocaleDateString('th-TH', options)})` : d.toLocaleDateString('th-TH', options);
                select.innerHTML += `<option value="${dateStr}">${displayStr}</option>`;
            }
        },

        // 2. เมื่อเปลี่ยนวันที่ ให้โหลดข้อมูลใหม่
        changeDate(dateStr) {
            this.currentDate = dateStr;
            this.render();
        },

        async save() {
            const total = app.updateTotal(); 
            const received = paymentModal.received;
            const change = received - total;
            const saleData = {
                timestamp: new Date().toISOString(), 
                display_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                display_date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }), 
                items: { ...app.cart }, nights: { ...app.cartNights },
                total: total, received: received, change: change, status: 'success'
            };
            try { await db.transactions.add(saleData); } catch (e) { console.error("Save Failed: ", e); }
        },

        open() {
            document.getElementById('historyOverlay').classList.remove('hidden');
            document.getElementById('historyOverlay').classList.remove('translate-y-full'); // เอาลงมาบรรทัดเดียวกันเลย ไม่ต้องมี setTimeout

           this.currentDate = new Date().toLocaleDateString('sv-SE');
            const select = document.getElementById('history-date-select');
            if(select) select.value = this.currentDate;
            this.render();
        },

        close() {
            document.getElementById('historyOverlay').classList.add('translate-y-full');
            document.getElementById('historyOverlay').classList.add('hidden'); // ปิดทันที 0 วินาที
        },

        async render() {
            // ดึงข้อมูล "เฉพาะวันที่เลือก"
            const start = new Date(this.currentDate); start.setHours(0,0,0,0);
            const end = new Date(this.currentDate); end.setHours(23,59,59,999);
            
            let logs = await db.transactions.where('timestamp').between(start.toISOString(), end.toISOString()).toArray();
            logs = logs.reverse(); // ใหม่ล่าสุดขึ้นก่อน

            const listContainer = document.getElementById('history-list');
            listContainer.innerHTML = '';
            const lang = app.getCurrentLang();
            const t = translations[lang];

            if(logs.length === 0) {
                listContainer.innerHTML = `<div class="text-center text-slate-400 py-6 font-bold">ไม่มีรายการในวันที่เลือก</div>`;
            }

            logs.forEach(log => {
                if (log.status === 'void') return;
                const card = document.createElement('div');
                card.className = 'bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl p-4 shadow-sm relative overflow-hidden mb-3';
                
                let itemsHTML = '';
                for (const [itemId, qty] of Object.entries(log.items)) {
                    if (qty > 0) {
                        const item = feeItems.find(i => i.id === itemId);
                        const nights = log.nights[itemId] || 1;
                        let name = item ? (lang === 'th' ? item.name_th : (lang === 'en' ? item.name_en : item.name_cn)) : itemId;
                        itemsHTML += `
                            <div class="flex justify-between text-base mb-1">
                                <span class="text-slate-700 dark:text-slate-300">
                                    ${name} x${qty}
                                    ${nights > 1 ? `<small class="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-xs font-bold ml-1">${nights} ${t.nights.replace(':','')}</small>` : ''}
                                </span>
                            </div>`;
                    }
                }

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-400 font-light">#${log.id}</span>
                            <span class="text-sm font-bold text-slate-600 dark:text-slate-400">📅 ${log.display_date} <span class="text-slate-300 mx-1">|</span> ⏰ ${log.display_time} น.</span>
                        </div>
                        <span class="font-black text-emerald-600 dark:text-emerald-400 text-xl">${log.total.toLocaleString()}.-</span>
                    </div>
                    <div class="border-t border-dashed border-slate-200 dark:border-slate-700 my-2 pt-2">${itemsHTML}</div>
                    <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                        <span>${t.modalReceived}: ${log.received.toLocaleString()} | ${t.modalChange}: ${log.change.toLocaleString()}</span>
                        <button onclick="app.history.deleteRecord(${log.id})" class="text-red-500 hover:text-red-700 font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg border border-red-100 dark:border-red-800 active:scale-95 transition">🗑️</button>
                    </div>
                `;
                listContainer.appendChild(card);
            });
            this.updateDailySummary(logs);
        },

        async deleteRecord(id) {
            if (confirm("ยืนยันการลบรายการนี้? / Confirm delete?")) { await db.transactions.delete(id); this.render(); if (navigator.vibrate) navigator.vibrate(50); }
        },

        async clearAll() {
            if (!confirm("⚠️ ลบประวัติการขาย 'ทั้งหมด' ใช่หรือไม่? / Clear ALL history?")) return;
            try { await db.transactions.clear(); this.render(); } catch (e) { console.error("Error:", e); }
        },

        async updateDailySummary(dateLogs) {
            let logsToProcess = dateLogs;
            if (!logsToProcess) {
                const start = new Date(this.currentDate); start.setHours(0,0,0,0);
                const end = new Date(this.currentDate); end.setHours(23,59,59,999);
                logsToProcess = await db.transactions.where('timestamp').between(start.toISOString(), end.toISOString()).toArray();
            }

            let totalRevenue = 0;
            const lang = app.getCurrentLang();
            const t = translations[lang];
            
            let statsVehicles = { 'moto': { id: 'moto', count: 0 }, 'car4': { id: 'car4', count: 0 }, 'car6': { id: 'car6', count: 0 }, 'car_heavy': { id: 'car_heavy', count: 0 } };
            let statsPeople = { 'adult_thai': { id: 'adult_thai', count: 0 }, 'child_thai': { id: 'child_thai', count: 0 }, 'adult_foreign': { id: 'adult_foreign', count: 0 }, 'child_foreign': { id: 'child_foreign', count: 0 } };
            let statsExemptions = { 'free_elderly': { id: 'free_elderly', count: 0 }, 'free_disabled': { id: 'free_disabled', count: 0 }, 'free_monk': { id: 'free_monk', count: 0 } };
            let statsCamping = { revenue: 0, peopleCount: 0, items: {} };
            
            feeItems.forEach(item => { if (item.type === 'sleep' && item.id !== 'camp_fee') statsCamping.items[item.id] = 0; });

            logsToProcess.forEach(l => {
                if (l.status === 'void') return;
                totalRevenue += l.total;
                for (const [id, qty] of Object.entries(l.items)) {
                    if (qty > 0) {
                        const item = feeItems.find(i => i.id === id); if (!item) continue;
                        const nights = l.nights[id] || 1;
                        if (id.includes('moto') || id.includes('motorcycle')) statsVehicles['moto'].count += qty;
                        else if (id === 'car4' || id === 'free_car') statsVehicles['car4'].count += qty;
                        else if (id === 'car6' || id === 'free_car6') statsVehicles['car6'].count += qty;
                        else if (id === 'car_heavy' || id === 'free_car6-10') statsVehicles['car_heavy'].count += qty;
                        else if (item.type === 'sleep') {
                            statsCamping.revenue += (item.price * qty * nights);
                            if (id === 'camp_fee') statsCamping.peopleCount += qty; else statsCamping.items[id] = (statsCamping.items[id] || 0) + qty;
                        }
                        else {
                            if (id === 'adult_thai' || id === 'adult_thai_free') statsPeople['adult_thai'].count += qty;
                            else if (id === 'child_thai' || id === 'child_thai_free') statsPeople['child_thai'].count += qty;
                            else if (id === 'adult_foreign') statsPeople['adult_foreign'].count += qty;
                            else if (id === 'child_foreign') statsPeople['child_foreign'].count += qty;
                            else if (statsExemptions[id] !== undefined) statsExemptions[id].count += qty;
                        }
                    }
                }
            });

            const getItemName = (id) => {
                const item = feeItems.find(i => i.id === id);
                return item ? (lang === 'th' ? item.name_th : (lang === 'en' ? item.name_en : item.name_cn)) : '';
            };

            const createRow = (name, count, unit, textColor = "text-slate-600 dark:text-slate-400", borderColor = "border-slate-100") => {
                const countStyle = count > 0 ? `font-bold ${textColor.replace('text-slate-600', 'text-slate-800').replace('text-slate-400', 'text-slate-200')}` : "font-normal text-slate-300 dark:text-slate-600";
                return `<div class="flex justify-between items-center py-1.5 border-b ${borderColor} last:border-0"><span class="text-sm ${textColor}">${name}</span><span class="${countStyle}">${count} <span class="text-xs font-normal opacity-60">${unit}</span></span></div>`;
            };

            let vehicleHTML = ''; for (const [k, v] of Object.entries(statsVehicles)) vehicleHTML += createRow(getItemName(v.id), v.count, t.units.vehicle, "text-blue-700 dark:text-blue-300", "border-blue-100 dark:border-blue-900/30");
            
            let sleepHTML = '';
            const campCountStyle = statsCamping.peopleCount > 0 ? "font-bold text-orange-900 dark:text-orange-100" : "font-normal text-slate-300 dark:text-slate-600";
            sleepHTML += `<div class="flex justify-between items-center py-1.5 border-b border-orange-200 dark:border-orange-800/50"><span class="text-sm font-bold text-orange-800 dark:text-orange-200">${t.dailyCampers}</span><span class="${campCountStyle}">${statsCamping.peopleCount} <span class="text-xs font-normal opacity-60">${t.units.person}</span></span></div>`;
            for (const [id, count] of Object.entries(statsCamping.items)) {
                const item = feeItems.find(i => i.id === id);
                sleepHTML += createRow(getItemName(id), count, t.units[item.unit_key], "text-orange-700 dark:text-orange-300", "border-orange-100 dark:border-orange-900/30");
            }

            let peopleHTML = '';
            for (const [k, v] of Object.entries(statsPeople)) peopleHTML += createRow(getItemName(v.id), v.count, t.units.person, "text-emerald-700 dark:text-emerald-300", "border-emerald-50 dark:border-slate-700/50");
            for (const [k, v] of Object.entries(statsExemptions)) peopleHTML += createRow(getItemName(v.id), v.count, t.units.person, "text-purple-700 dark:text-purple-300", "border-slate-100 dark:border-slate-700/50");

            const summaryContainer = document.getElementById('daily-summary');
            if(summaryContainer) {
                summaryContainer.className = "bg-white/95 backdrop-blur dark:bg-slate-800/95 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-4";
                summaryContainer.innerHTML = `
                    <div class="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-600">
                        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">${t.dailyTotal}</p>
                        <p class="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-700">${totalRevenue.toLocaleString()}.-</p>
                    </div>
                    <div class="bg-orange-100 dark:bg-orange-900/30 rounded-2xl border border-orange-100 dark:border-orange-800/50 overflow-hidden">
                        <div class="bg-orange-100/50 dark:bg-orange-800/30 p-2 px-4 flex justify-between items-center"><span class="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wide">${t.dailySleep} (${statsCamping.revenue.toLocaleString()}.-)</span></div>
                        <div class="p-4 pt-2 space-y-0.5">${sleepHTML}</div>
                    </div>
                    <div class="bg-blue-100 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800/50 p-4 space-y-0.5">
                        <p class="text-[10px] text-blue-500 dark:text-blue-300 font-bold uppercase tracking-wide mb-2">${t.dailyVehicle}</p>
                        ${vehicleHTML}
                    </div>
                    <div class="bg-green-100 dark:bg-green-900/30 rounded-2xl border border-green-100 dark:border-green700/20 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 space-y-0.5">
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-2">${t.dailyPerson}</p>
                        ${peopleHTML}
                    </div>`;
            }
            setTimeout(() => {
            this.renderChart(logsToProcess);
        }, 50);
        },

        // ฟังก์ชันวาดกราฟเส้น (รวมคนทั้งหมด พื้นที่สีส้ม)
        renderChart(logs) {
            const ctx = document.getElementById('touristChart');
            if (!ctx) return;

            const hourlyData = {};
            for (let i = 6; i <= 18; i++) hourlyData[i] = { total: 0 };

            const personIds = [ 'adult_thai', 'child_thai', 'adult_foreign', 'child_foreign', 'adult_thai_free', 'child_thai_free', 'free_elderly', 'free_disabled', 'free_monk' ];

            logs.forEach(log => {
                if (log.status === 'void') return;
                const hour = new Date(log.timestamp).getHours();
                if (!hourlyData[hour]) hourlyData[hour] = { total: 0 };

                for (const [id, qty] of Object.entries(log.items)) {
                    if (qty <= 0) continue;
                    if (personIds.includes(id)) hourlyData[hour].total += qty;
                }
            });

            const labels = [];
            const dataTotal = [];

            let minHour = 8, maxHour = 17;
            const activeHours = Object.keys(hourlyData).map(Number).filter(h => hourlyData[h].total > 0);
            if (activeHours.length > 0) {
                minHour = Math.min(8, Math.min(...activeHours));
                maxHour = Math.max(17, Math.max(...activeHours));
            }

            for (let i = minHour; i <= maxHour; i++) {
                labels.push(`${i}:00`);
                dataTotal.push(hourlyData[i] ? hourlyData[i].total : 0); 
            }

            if (this.chartInstance) this.chartInstance.destroy();

            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{ 
                        label: 'นักท่องเที่ยว', data: dataTotal, borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.25)', 
                        fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#ffffff', pointBorderColor: '#f97316'
                    }]
                },
                options: {
                    animation: false,
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }, x: { grid: { display: false } } },
                    plugins: { legend: { display: false }, tooltip: { titleFont: { family: 'Kanit' }, bodyFont: { family: 'Kanit', size: 14 }, displayColors: false, callbacks: { label: function(c) { return c.parsed.y + ' คน'; } } } }
                }
            });
        },

       // --- ส่งออก CSV (แบบใหม่: คน/คืน + ชื่อเจ้าหน้าที่) ---
        async exportCSV() {
            const start = new Date(this.currentDate); start.setHours(0,0,0,0);
            const end = new Date(this.currentDate); end.setHours(23,59,59,999);
            const logs = await db.transactions.where('timestamp').between(start.toISOString(), end.toISOString()).toArray();
            
            if (logs.length === 0) return alert("ยังไม่มีข้อมูลในวันที่เลือกครับ");
            
            const officerName = localStorage.getItem('samlan_officer') || 'ไม่มีชื่อ';
            const t = translations['th']; // ดึงคำแปลภาษาไทยมาใช้สำหรับหน่วย
            
            let csvContent = "\uFEFF"; 
            let headers = ["ID", "Date", "Time", "Total", "Received", "Change", "Status", "Officer"];
            const itemIds = feeItems.map(item => item.id);
            
            // แก้ไขตรงนี้: เพิ่มหน่วย (คน/คืน, หลัง/คืน ฯลฯ) เข้าไปในหัวคอลัมน์ของหมวดที่พักและอุปกรณ์
            const itemNames = feeItems.map(item => {
                if (item.type === 'sleep') {
                    let unitText = t.units[item.unit_key] || 'หน่วย';
                    return `"${item.name_th} (${unitText}/คืน)"`;
                }
                return `"${item.name_th}"`;
            });

            headers = headers.concat(itemNames);
            csvContent += headers.join(",") + "\n";

            logs.forEach(log => {
                let statusText = log.status === 'void' ? 'Void' : 'Success';
                let row = [ log.id, `"${log.display_date}"`, `"${log.display_time}"`, log.total, log.received, log.change, statusText, `"${officerName}"` ];
                
                itemIds.forEach(id => { 
                    let qty = log.items[id] || 0;
                    const item = feeItems.find(i => i.id === id);
                    
                    // ปรับสูตรคน/คืน (คูณจำนวนคืน)
                    if (item && item.type === 'sleep' && qty > 0) {
                        const nights = log.nights[id] || 1;
                        qty = qty * nights; 
                    }
                    row.push(qty); 
                });
                csvContent += row.join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url); link.setAttribute("download", `รายงานรายได้_สามหลั่น_${this.currentDate}.csv`);
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        },

        // --- ส่งออก PDF (ตามวันที่เลือก + ชื่อเจ้าหน้าที่) ---
        async exportPDF() {
            try {
                const start = new Date(this.currentDate); start.setHours(0,0,0,0);
                const end = new Date(this.currentDate); end.setHours(23,59,59,999);
                const todayLogs = await db.transactions.where('timestamp').between(start.toISOString(), end.toISOString()).toArray();

                let totalRevenue = 0; let itemSummary = {}; const lang = 'th';

                feeItems.forEach(item => {
                    let itemName = item.name_th;
                    if (item.id === 'camp_fee') itemName = 'ค่าตอบแทนที่พัก'; 
                    let unitText = item.unit;
                    if (translations && translations[lang] && translations[lang].units) unitText = translations[lang].units[item.unit_key] || item.unit;
                    if (item.type === 'sleep') unitText += '/คืน';

                    itemSummary[item.id] = { name: itemName, unit: unitText, qty: 0, revenue: 0, isFree: item.price === 0, price: item.price, type: item.type };
                });

                todayLogs.forEach(log => {
                    if (log.status === 'void') return;
                    totalRevenue += log.total;
                    for (const [id, qty] of Object.entries(log.items)) {
                        if (qty > 0 && itemSummary[id]) {
                            const nights = log.nights[id] || 1;
                            if (itemSummary[id].type === 'sleep') itemSummary[id].qty += (qty * nights);
                            else itemSummary[id].qty += qty;
                            itemSummary[id].revenue += (itemSummary[id].price * qty * nights);
                        }
                    }
                });

                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const selectedDateFormal = start.toLocaleDateString('th-TH', options);
                const timeFormal = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

                // ดึงชื่อเจ้าหน้าที่มาแสดง
                const officerName = localStorage.getItem('samlan_officer') || '';
                const sigLine = officerName ? `( ${officerName} )` : '( ....................................................... )';
                const sigTitle = officerName ? `ผู้บันทึก` : '';

                let tablePaidHTML = ''; let tableFreeHTML = ''; let orderPaid = 1, orderFree = 1;
                const allItems = Object.values(itemSummary);

                allItems.forEach(item => {
                    if (!item.isFree) {
                        tablePaidHTML += `<tr><td style="border: 1px solid black; padding: 4px; text-align: center;">${orderPaid++}</td><td style="border: 1px solid black; padding: 4px; text-align: left; padding-left: 8px;">${item.name}</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${item.qty} ${item.unit}</td><td style="border: 1px solid black; padding: 4px; text-align: right; padding-right: 8px;">${item.revenue.toLocaleString()}</td></tr>`;
                    } else {
                        tableFreeHTML += `<tr style="color: #333;"><td style="border: 1px solid black; padding: 4px; text-align: center;">${orderFree++}</td><td style="border: 1px solid black; padding: 4px; text-align: left; padding-left: 8px;">${item.name} (ยกเว้น)</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${item.qty} ${item.unit}</td><td style="border: 1px solid black; padding: 4px; text-align: center;">-</td></tr>`;
                    }
                });

                const printHTML = `
                    <style>@media print { html, body { height: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; } #print-section { max-height: 27cm !important; overflow: hidden !important; } tr { page-break-inside: avoid !important; } }</style>
                    <div style="font-family: 'Sarabun', sans-serif; color: black; background: white; line-height: 1.3;">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">รายงานสรุปการจัดเก็บเงินรายได้อุทยานแห่งชาติ</h1>
                            <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">อุทยานแห่งชาติน้ำตกสามหลั่น</h2>
                            <p style="font-size: 12px; margin: 0;">ประจำวันที่ ${selectedDateFormal} (พิมพ์เมื่อเวลา ${timeFormal} น.)</p>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 5px 0;">1. สรุปรายการจัดเก็บค่าธรรมเนียม (รายได้)</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead><tr style="background-color: #f3f4f6;"><th style="border: 1px solid black; padding: 4px; width: 50px; text-align: center;">ลำดับ</th><th style="border: 1px solid black; padding: 4px; text-align: left; padding-left: 8px;">รายการ</th><th style="border: 1px solid black; padding: 4px; width: 80px; text-align: center;">จำนวน</th><th style="border: 1px solid black; padding: 4px; width: 110px; text-align: right; padding-right: 8px;">จำนวนเงิน (บาท)</th></tr></thead>
                                <tbody>${tablePaidHTML}</tbody>
                                <tfoot><tr><td colspan="3" style="border: 1px solid black; padding: 4px; text-align: right; font-weight: bold; padding-right: 15px;">รวมเงินรายได้ทั้งสิ้น</td><td style="border: 1px solid black; padding: 4px; text-align: right; font-weight: bold; text-decoration: underline; padding-right: 8px;">${totalRevenue.toLocaleString()}</td></tr></tfoot>
                            </table>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 5px 0;">2. สรุปรายการยกเว้นค่าธรรมเนียม</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead><tr style="background-color: #f3f4f6;"><th style="border: 1px solid black; padding: 4px; width: 50px; text-align: center;">ลำดับ</th><th style="border: 1px solid black; padding: 4px; text-align: left; padding-left: 8px;">รายการ</th><th style="border: 1px solid black; padding: 4px; width: 80px; text-align: center;">จำนวน</th><th style="border: 1px solid black; padding: 4px; width: 110px; text-align: center;">หมายเหตุ</th></tr></thead>
                                <tbody>${tableFreeHTML}</tbody>
                            </table>
                        </div>
                        
                        <table style="width: 100%; margin-top: 40px; font-size: 13px; border: none;">
                            <tr>
                                <td style="width: 50%;"></td>
                                <td style="text-align: center;">
                                    <p style="margin: 0 0 30px 0;">ลงชื่อ ....................................................... ${sigTitle}</p>
                                    <p style="margin: 0 0 5px 0;">${sigLine}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                `;

                let printContainer = document.getElementById('print-section');
                if (!printContainer) { printContainer = document.createElement('div'); printContainer.id = 'print-section'; printContainer.className = 'hidden font-sans'; document.body.appendChild(printContainer); }
                printContainer.innerHTML = printHTML;
                
                const originalTitle = document.title; 
                document.title = `รายงานรายได้_สามหลั่น_${this.currentDate}`;
                window.print();
                setTimeout(() => { document.title = originalTitle; }, 1000);
            } catch (error) { console.error("เกิดข้อผิดพลาดในการสร้าง PDF:", error); alert("เกิดข้อผิดพลาด: " + error.message); }
        }
    }
}; // --- App Ending---
    

// --- PAYMENT MODAL ---
const paymentModal = {
    received: 0, billCounts: {}, 

    open() {
        app.updateTotal();
        const hasItems = Object.values(app.cart).some(qty => qty > 0);
        if (!hasItems) return alert(translations[app.getCurrentLang()].modalErrorNoItem);

        this.received = 0; this.billCounts = {}; 
        this.renderList(); this.renderMoneyButtons(); this.updateDisplay();
        document.getElementById('paymentModal').classList.remove('hidden');
        document.getElementById('modal-panel').classList.remove('translate-y-full'); // ไม่ต้องรอ 10ms
    },

   close() {
        document.getElementById('modal-panel').classList.add('translate-y-full');
        document.getElementById('paymentModal').classList.add('hidden'); // ปิดทันที 0 วินาที
    },

    renderList() {
        const list = document.getElementById('summary-list');
        list.innerHTML = '';
        const lang = app.getCurrentLang();
        const t = translations[lang];

        for (const [id, qty] of Object.entries(app.cart)) {
            if (qty > 0) {
                const item = feeItems.find(i => i.id === id);
                const nights = app.cartNights[id] || 1;
                const total = item.price * qty * nights;
                const name = lang === 'th' ? item.name_th : (lang === 'en' ? item.name_en : item.name_cn);
                const unit = t.units[item.unit_key] || item.unit;

                const row = document.createElement('div');
                row.className = 'flex justify-between items-center py-3 border-b border-dashed border-slate-200 dark:border-slate-700';
                row.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col">
                            <span class="font-bold text-lg text-slate-800 dark:text-slate-100">${name}</span>
                            <span class="text-sm text-slate-900 dark:text-slate-300">
                                ${qty} ${unit} <span class="text-slate-500 ml-1">(@${item.price})</span>
                                ${item.type === 'sleep' ? ` <span class="ml-1 bg-orange-100 text-orange-600 px-1.5 rounded text-xs font-bold">x${nights} ${t.nights.replace(':','')}</span>` : ''}
                            </span>
                        </div>
                    </div>
                    <div class="font-black text-xl ${total === 0 ? 'text-purple-600' : 'text-slate-900 dark:text-white'}">
                        ${total === 0 ? t.units.free : total.toLocaleString()}
                    </div>
                `;
                list.appendChild(row);
            }
        }
    },

    renderMoneyButtons() {
        const container = document.getElementById('money-buttons-container');
        if (!container) return;
        container.innerHTML = '';
        const t = translations[app.getCurrentLang()];
        
        const currentTotal = app.updateTotal();
        const isExact = (this.received === currentTotal) && (this.received > 0) && (Object.keys(this.billCounts).length === 0);

        const denoms = [1000, 500, 100, 50, 20, 10, 5];
        denoms.forEach(n => {
            const count = this.billCounts[n] || 0;
            const btn = document.createElement('button');
            if (isExact) {
                btn.className = 'relative bg-slate-100 dark:bg-slate-700 py-3 rounded-xl font-bold transition btn-disabled'; btn.disabled = true; 
            } else {
                btn.className = 'relative bg-slate-100 dark:bg-slate-700 py-3 rounded-xl font-bold active:scale-95 transition'; btn.onclick = () => this.addMoney(n); 
            }
            btn.innerHTML = `${n}${count > 0 ? `<span class="absolute -top-2 -right-1 bg-blue-500 text-white text-l px-1.5 py-0.5 rounded-full shadow-md animate-bounce">x${count}</span>` : ''}`;
            container.appendChild(btn);
        });

        const clearBtn = document.createElement('button');
        clearBtn.className = 'bg-red-100 text-red-600 py-3 rounded-xl font-bold active:scale-95 transition';
        clearBtn.innerText = 'C'; clearBtn.onclick = () => this.clearMoney();
        container.appendChild(clearBtn);

        const exactBtn = document.createElement('button');
        let baseClass = 'col-span-4 bg-blue-100 text-blue-600 py-3 rounded-xl font-bold transition-all mt-1';
        if (isExact) {
            exactBtn.className = `${baseClass} heartbeat-active border-2 border-blue-300`;
            exactBtn.innerText = t.modalBtnExactSelected;
        } else {
            exactBtn.className = `${baseClass} hover:bg-blue-200 active:scale-95`;
            exactBtn.innerText = t.modalBtnExact;
        }
        exactBtn.onclick = () => this.payExact();
        container.appendChild(exactBtn);
    },

    addMoney(n) { 
        this.received += n; this.billCounts[n] = (this.billCounts[n] || 0) + 1; 
        this.updateDisplay(); this.renderMoneyButtons();
        if (navigator.vibrate) navigator.vibrate(10);
    },

    payExact() { 
        this.received = app.updateTotal(); this.billCounts = {}; 
        this.updateDisplay(); this.renderMoneyButtons();
    },

    clearMoney() { 
        this.received = 0; this.billCounts = {}; 
        this.updateDisplay(); this.renderMoneyButtons();
    },

   updateDisplay() {
        const total = app.updateTotal();
        const change = this.received - total;
        document.getElementById('modal-total-display').innerText = total.toLocaleString();
        document.getElementById('display-received').innerText = this.received.toLocaleString();
        
        const el = document.getElementById('display-change');
        const labelChange = document.getElementById('txt-change'); // ดึงป้ายกำกับมาเพื่อเปลี่ยนข้อความ
        
        // กำหนดคำแปลสำหรับคำว่า "ขาดอีก"
        const lang = app.getCurrentLang();
        const t = translations[lang];
        const textMissing = lang === 'th' ? 'ขาดอีก' : (lang === 'en' ? 'Short' : '还差');

        if (change < 0) {
            // กรณีเงินรับมา "น้อยกว่า" ยอดรวม (ขาดอีก) -> แสดงสีแดง
            el.innerText = (total - this.received).toLocaleString();
            el.className = 'text-3xl font-extrabold text-red-500';
            labelChange.innerText = textMissing;
            labelChange.className = 'text-3xl text-red-500 font-bold';
        } else {
            // กรณีเงินรับมา "พอดี" หรือ "มากกว่า" (เงินทอน) -> แสดงสีเขียว
            el.innerText = change.toLocaleString();
            el.className = 'text-3xl font-extrabold text-emerald-500';
            labelChange.innerText = t.modalChange; // ดึงคำว่า "เงินทอน" หรือ "Change" จาก translations
            labelChange.className = 'text-3xl text-emerald-500 font-bold';
        }
    },

    async finish() { 
        if (this.received < app.updateTotal()) return alert(translations[app.getCurrentLang()].modalErrorNotEnough);
        await app.history.save();
        this.close(); 
        app.reset();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
