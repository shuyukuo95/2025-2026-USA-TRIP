// main.js

import App from './App.vue'
// 假設您使用 build tool，這裡會導入您的組件
// 但若使用 CDN，則所有組件邏輯需在 App.vue 或在此處定義

const { createApp, reactive, computed } = Vue;

// --- 核心狀態管理 (簡化) ---
const store = reactive({
    currentTab: 'schedule', // 'schedule', 'info', 'shopping', 'expense'
    currentDate: '2025-12-27',
    // 您的詳細行程數據結構將在這裡
    trips: {
        // ... (省略複雜行程數據，請自行填入結構)
    },
    // ... 其他狀態 (購物清單, 花費, 匯率等)
});

// 將 store 注入到應用程式中
const app = createApp({
    components: {
        // App.vue 內容
    },
    setup() {
        return { store }
    }
});

// --- 導航到 Google Maps 的核心函數 ---
// 由於這是跨組件使用的核心功能，放在這裡
window.navigateToGoogleMap = (address, name) => {
    // 針對手機 App 環境優化，嘗試使用 App scheme
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const destination = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    if (isMobile) {
        // 嘗試使用 Google Maps App 連結 (iOS/Android)
        window.open(`comgooglemaps://?daddr=${destination}&directionsmode=driving`, '_blank');
    } else {
        // 桌面瀏覽器
        window.open(mapUrl, '_blank');
    }
};

// 由於 CDN 環境無法使用 import/export，這裡假定您將 App 內容寫在這裡
// ------------------------------------------------------------------------------------------------

// 這裡我們將 App 組件的模板和邏輯直接定義在 App 變數中
const AppTemplate = `
    <div class="flex flex-col h-full font-sans">
        <header class="p-4 bg-yellow-400 text-white shadow-lg z-20">
            <h1 class="text-xl font-extrabold tracking-widest text-blue-800">CA VIBE TRIP</h1>
        </header>

        <main class="flex-grow overflow-y-auto pb-20 bg-gray-50">
            <div class="p-4">
                <ScheduleTab v-if="store.currentTab === 'schedule'" :trips="store.trips" />
                <InfoTab v-if="store.currentTab === 'info'" />
                <ShoppingTab v-if="store.currentTab === 'shopping'" />
                <ExpenseTab v-if="store.currentTab === 'expense'" />
            </div>
        </main>

        <div class="fixed bottom-4 right-4 z-50">
            <div class="bg-blue-700 p-2 rounded-full shadow-2xl flex space-x-2">
                <TabButton icon="fa-map-marker-alt" label="行程" tab="schedule" :current="store.currentTab" @change="tab => store.currentTab = tab" />
                <TabButton icon="fa-info-circle" label="資訊" tab="info" :current="store.currentTab" @change="tab => store.currentTab = tab" />
                <TabButton icon="fa-shopping-basket" label="購物" tab="shopping" :current="store.currentTab" @change="tab => store.currentTab = tab" />
                <TabButton icon="fa-money-bill-wave" label="花費" tab="expense" :current="store.currentTab" @change="tab => store.currentTab = tab" />
            </div>
        </div>
    </div>
`;

// 為了讓 App 跑起來，我們需要定義核心組件
// (在實際專案中，它們會是獨立的 .vue 文件)

// --- 核心組件定義 ---

// Tab 按鈕組件
const TabButton = defineComponent({
    props: ['icon', 'label', 'tab', 'current'],
    template: `
        <button @click="$emit('change', tab)"
            class="p-3 rounded-full transition duration-300 transform hover:scale-105"
            :class="tab === current ? 'bg-yellow-400 text-blue-700 shadow-md' : 'text-white hover:bg-blue-600'">
            <i :class="['fas', icon, 'text-xl']"></i>
            <span class="sr-only">{{ label }}</span>
        </button>
    `
});

// 行程卡片組件 (只展示核心結構和導航功能)
const ScheduleCard = defineComponent({
    props: ['item', 'prevAddress'],
    template: `
        <div class="bg-white p-4 rounded-xl shadow-md mb-3 border-l-4 border-yellow-400 relative">
            <div v-if="item.type !== 'flight' && prevAddress" class="text-xs text-gray-500 mb-2">
                <i class="fas fa-car mr-1"></i> <span class="font-bold text-blue-600">35 min</span> from previous location
            </div>
            
            <div @click="navigateToGoogleMap(item.address, item.name)" class="cursor-pointer">
                <h3 class="text-lg font-bold text-blue-800">{{ item.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                    <i class="fas fa-clock mr-1"></i> {{ item.time || '全天' }}
                </p>
                <p v-if="item.note" class="text-xs italic text-gray-500 mt-1">備註: {{ item.note }}</p>
            </div>
            
            <div class="absolute top-4 right-4 text-2xl text-yellow-500 hover:text-yellow-600 cursor-pointer" 
                 @click="navigateToGoogleMap(item.address, item.name)">
                <i class="fas fa-location-arrow"></i>
            </div>
        </div>
    `
});

// 行程表分頁 (ScheduleTab)
const ScheduleTab = defineComponent({
    // (1) 日期選單 (橫向滑動)
    // (10) 天氣資訊
    // (2) 下拉分類欄
    // (4) 拖曳排序 (需要第三方庫，此處省略)
    // (5) 新增行程 "+" 按鈕
    components: { ScheduleCard },
    template: `
        <div class="space-y-4">
            <div class="flex overflow-x-auto space-x-3 pb-2 hide-scrollbar">
                <button v-for="date in ['Sat 27', 'Sun 28', 'Mon 29', 'Tue 30', 'Wed 31', 'Thu 1', 'Fri 2', 'Sat 3']" 
                    :key="date"
                    :class="date.includes('27') ? 'bg-blue-700 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200'"
                    class="flex-shrink-0 p-3 rounded-xl transition duration-200 text-center w-16">
                    <span class="text-sm font-semibold block">{{ date.split(' ')[0] }}</span>
                    <span class="text-2xl font-extrabold block">{{ date.split(' ')[1] }}</span>
                </button>
            </div>
            
            <div class="p-4 bg-white rounded-xl shadow-lg flex justify-between items-center border-l-4 border-blue-400">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-sun text-4xl text-yellow-500"></i>
                    <div>
                        <p class="text-2xl font-bold text-blue-800">22°C</p>
                        <p class="text-sm text-gray-500">體感 25°C - LAX</p>
                    </div>
                </div>
                <select class="p-2 border rounded-lg text-sm bg-gray-50">
                    <option>所有分類</option>
                    <option>景點</option>
                    <option>美食</option>
                    </select>
            </div>

            <div class="mt-4 space-y-4">
                <div class="bg-blue-100 p-4 rounded-xl shadow-inner border-l-4 border-blue-500">
                    <p class="text-lg font-bold text-blue-800"><i class="fas fa-plane-departure mr-2"></i> 航班資訊 (JL016)</p>
                    <p class="text-sm text-gray-700 mt-1">NRT 17:05 → LAX 9:50 (飛行 9h45m)</p>
                </div>
                
                <ScheduleCard :item="{ name: 'Randy\'s Donuts 🍩', address: '805 W Manchester Blvd, Inglewood, CA 90301', note: '打卡經典甜甜圈' }" prevAddress="LAX Airport" />
                <ScheduleCard :item="{ name: 'Griffith Observatory', address: '2800 E Observatory Rd, Los Angeles, CA 90027', note: '俯瞰洛杉磯' }" prevAddress="Randy's Donuts" />
            </div>

            <button class="fixed bottom-20 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition duration-300">
                <i class="fas fa-plus text-xl"></i>
            </button>
        </div>
    `
});

// 資訊分頁 (InfoTab)
const InfoTab = defineComponent({
    template: `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-blue-800 border-b-2 pb-2 border-yellow-400">資訊總覽 <i class="fas fa-i-cursor ml-2"></i></h2>
            
            <div class="bg-white p-4 rounded-xl shadow-md">
                <h3 class="text-xl font-semibold text-blue-700 mb-3">即時匯率換算 (USD → TWD)</h3>
                <div class="flex items-center space-x-2">
                    <input type="number" value="100" class="w-24 p-2 border rounded-lg text-lg text-center" />
                    <span class="text-lg font-bold"> USD ≈ </span>
                    <span class="text-2xl font-extrabold text-red-600"> 3,180 TWD</span>
                </div>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-md space-y-4">
                <h3 class="text-xl font-semibold text-blue-700 border-b pb-2">✈️ 航班資訊</h3>
                <div class="border-l-4 border-yellow-500 pl-3">
                    <p class="font-bold">去程 (12/27): JL016</p>
                    <p class="text-sm">NRT 17:05 → LAX 9:50</p>
                    <p class="text-xs text-gray-500">飛行時間: 9h 45m</p>
                </div>
                <div class="border-l-4 border-yellow-500 pl-3">
                    <p class="font-bold">回程 (1/3): JL57</p>
                    <p class="text-sm">SFO 11:40 → NRT 16:00+1</p>
                    <p class="text-xs text-gray-500">飛行時間: 約 10h 20m</p>
                </div>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-md space-y-3">
                <h3 class="text-xl font-semibold text-blue-700 border-b pb-2">🏨 住宿資訊</h3>
                <div class="border-l-4 border-blue-500 pl-3">
                    <p class="font-bold">Sheraton Park Hotel</p>
                    <p class="text-sm text-gray-600">1855 S Harbor Blvd, Anaheim</p>
                    <button @click="navigateToGoogleMap('1855 S Harbor Blvd, Anaheim, CA 92802', 'Sheraton Park')" class="text-xs text-yellow-600 font-semibold mt-1">導航 <i class="fas fa-directions"></i></button>
                </div>
                </div>
            
            <div class="bg-white p-4 rounded-xl shadow-md">
                <h3 class="text-xl font-semibold text-blue-700 border-b pb-2">🚗 租車資訊</h3>
                <p class="font-bold">SIXT Booking Ref: 9728012386</p>
                <p class="text-sm text-gray-600">LAX 取車/SFO 還車</p>
                <button @click="navigateToGoogleMap('LAX Rental Car Center', 'SIXT LAX')" class="text-xs text-yellow-600 font-semibold mt-1">導航至 LAX 租車處 <i class="fas fa-directions"></i></button>
            </div>
            
            <div class="bg-red-50 p-4 rounded-xl shadow-md border-l-4 border-red-500">
                <h3 class="text-xl font-semibold text-red-700 mb-2">🚨 緊急聯絡</h3>
                <p class="font-bold">警察 / 救護車: 911</p>
            </div>
        </div>
    `
});

// 購物清單分頁 (ShoppingTab)
const ShoppingTab = defineComponent({
    template: `
        <div class="space-y-4">
            <h2 class="text-2xl font-bold text-blue-800 border-b-2 pb-2 border-yellow-400">購物清單 <i class="fas fa-shopping-basket ml-2"></i></h2>
            
            <div class="bg-white p-4 rounded-xl shadow-md flex items-center mb-3">
                <div class="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-sm text-gray-500 border border-dashed">
                    <i class="fas fa-camera text-xl"></i>
                </div>
                <div>
                    <p class="font-bold text-lg text-blue-700">McConnell's 冰淇淋</p>
                    <p class="text-sm text-gray-500">Third Street Promenade</p>
                </div>
            </div>
            <button class="fixed bottom-20 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition duration-300">
                <i class="fas fa-plus text-xl"></i>
            </button>
        </div>
    `
});

// 花費分頁 (ExpenseTab)
const ExpenseTab = defineComponent({
    template: `
        <div class="space-y-4">
            <h2 class="text-2xl font-bold text-blue-800 border-b-2 pb-2 border-yellow-400">花費記錄 <i class="fas fa-money-bill-wave ml-2"></i></h2>

            <div class="bg-blue-700 text-white p-4 rounded-xl shadow-lg text-center">
                <p class="text-sm opacity-80">總花費 (TWD)</p>
                <p class="text-4xl font-extrabold">$125,480</p>
            </div>
            
            <div class="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-lg font-bold text-blue-700">迪士尼門票</p>
                        <p class="text-xs text-gray-500">12/28 | 門票 | 信用卡</p>
                    </div>
                    <p class="text-xl font-extrabold text-red-600">$5,800</p>
                </div>
            </div>
            
            <button class="fixed bottom-20 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition duration-300">
                <i class="fas fa-plus text-xl"></i>
            </button>
        </div>
    `
});

// 將所有組件註冊到 Vue 實例中
app.component('TabButton', TabButton);
app.component('ScheduleTab', ScheduleTab);
app.component('InfoTab', InfoTab);
app.component('ShoppingTab', ShoppingTab);
app.component('ExpenseTab', ExpenseTab);

// 最終掛載 App
app.mount('#app > div'); // 掛載到 App 模擬容器內
