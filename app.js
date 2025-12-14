// app.js

// --- 應用程式狀態 ---
let appState = {
    currentTab: 'schedule',
    currentDate: DATES[0], // 預設為第一天
    isMapLoaded: false,
    googleMap: null,
    directionsService: null,
    directionsRenderer: null,
};

// --- 輔助函數 ---

// 根據行程類型返回對應的 Icon
function getItemIcon(type) {
    switch (type) {
        case 'attraction': return 'fa-camera-retro'; // 景點
        case 'accommodation': return 'fa-bed';      // 住宿
        case 'food': return 'fa-utensils';          // 美食
        case 'shopping': return 'fa-shopping-bag';   // 購物
        case 'flight': return 'fa-plane-departure'; // 航班
        case 'rental': return 'fa-car';             // 租車/交通
        default: return 'fa-dot-circle';
    }
}

// 獲取星期幾 (例如 'Sat')
function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// (9) 導航至 Google Maps
window.navigateToGoogleMap = (address) => {
    if (!address) return alert('地址資訊不完整。');
    const destination = encodeURIComponent(address);
    // 優先嘗試使用 App Scheme (在手機上會跳轉到 App)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
};


// --- 核心渲染函數 ---

// 渲染底部 Tab 導航
function renderTabNav() {
    const navContainer = document.getElementById('tab-nav');
    navContainer.innerHTML = ''; // 清空舊內容
    
    const tabs = [
        { id: 'schedule', icon: 'fa-map-marker-alt', label: '行程表' },
        { id: 'info', icon: 'fa-info-circle', label: '資訊' },
        { id: 'shopping', icon: 'fa-shopping-basket', label: '購物清單' },
        { id: 'expense', icon: 'fa-money-bill-wave', label: '花費' },
    ];

    tabs.forEach(tab => {
        const isActive = appState.currentTab === tab.id;
        const button = document.createElement('button');
        button.innerHTML = `<i class="fas ${tab.icon} text-xl"></i>`;
        button.className = `p-3 rounded-full transition duration-300 transform hover:scale-105 ${
            isActive ? 'bg-yellow-400 text-blue-700 shadow-md' : 'text-white hover:bg-blue-600'
        }`;
        button.title = tab.label;
        button.addEventListener('click', () => {
            appState.currentTab = tab.id;
            renderAppContent();
            renderTabNav(); // 更新按鈕樣式
        });
        navContainer.appendChild(button);
    });
}

// 渲染每日行程卡片 (Schedule Card)
function renderScheduleItem(item, prevAddress) {
    const isFlight = item.type === 'flight';
    const card = document.createElement('div');
    card.className = `p-4 rounded-xl shadow-md mb-4 relative ${isFlight ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white border-l-4 border-yellow-400'}`;

    let html = '';

    // (6) (7) 顯示交通時間
    if (!isFlight && prevAddress) {
        // !!! 此處需呼叫 Google Directions API 計算交通時間 (非同步操作) !!!
        // 由於 Directions API 是非同步的，這裡先使用 placeholder
        html += `<div class="text-xs text-gray-500 mb-2">
                    <i class="fas fa-car mr-1"></i> <span class="font-bold text-blue-600">Calculating...</span> from previous location
                 </div>`;
        
        // 實際開發時，您需要在這裡調用 calculateRoute(prevAddress, item.address)
    }

    // 行程內容
    html += `
        <div class="cursor-pointer" onclick="navigateToGoogleMap('${item.address}')">
            <h3 class="text-lg font-bold text-blue-800 flex items-center">
                <i class="fas ${getItemIcon(item.type)} mr-2 text-yellow-500"></i> ${item.name}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
                <i class="fas fa-clock mr-1"></i> ${item.time || '全天'}
            </p>
            <p class="text-xs italic text-gray-500 mt-1">${item.note || ''}</p>
        </div>
        <div class="absolute top-4 right-4 text-2xl text-yellow-500 hover:text-yellow-600 cursor-pointer" 
             onclick="navigateToGoogleMap('${item.address}')">
            <i class="fas fa-location-arrow"></i>
        </div>
    `;

    card.innerHTML = html;
    return card;
}


// 渲染每日行程表
function renderScheduleTab() {
    const container = document.createElement('div');
    container.className = 'space-y-4';
    
    const daySchedule = TRIP_SCHEDULE[appState.currentDate] || [];

    // --- (1) 日期橫向選單 ---
    const dateNavHtml = DATES.map(date => {
        const isCurrent = date === appState.currentDate;
        const [year, month, day] = date.split('-');
        const weekday = getDayOfWeek(date);

        return `
            <button data-date="${date}"
                class="flex-shrink-0 p-3 rounded-xl transition duration-200 text-center w-16 tab-date-button ${
                    isCurrent ? 'bg-blue-700 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200'
                }">
                <span class="text-sm font-semibold block">${weekday}</span>
                <span class="text-2xl font-extrabold block">${day}</span>
            </button>
        `;
    }).join('');

    container.innerHTML += `
        <div class="flex overflow-x-auto space-x-3 pb-2 hide-scrollbar">${dateNavHtml}</div>
        
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
            </select>
        </div>
        
        <div id="schedule-list" class="mt-4"></div>
        
        <button class="fixed bottom-20 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition duration-300">
            <i class="fas fa-plus text-xl"></i>
        </button>
    `;

    // 處理日期切換事件
    container.querySelectorAll('.tab-date-button').forEach(button => {
        button.addEventListener('click', (e) => {
            appState.currentDate = e.currentTarget.dataset.date;
            renderAppContent(); // 重新渲染整個行程表
        });
    });

    const scheduleList = container.querySelector('#schedule-list');
    
    // 渲染單個行程卡片
    let prevAddress = null;
    daySchedule.forEach((item, index) => {
        // (7) 處理第一個行程的起點
        if (index === 0) {
            // 找出前一晚的住宿地址作為起點 (簡化：這裡只取前一晚最後一個住宿地點)
            const prevDayIndex = DATES.indexOf(appState.currentDate) - 1;
            if (prevDayIndex >= 0) {
                const prevDate = DATES[prevDayIndex];
                const prevDayItems = TRIP_SCHEDULE[prevDate] || [];
                const lastAccommodation = prevDayItems.find(i => i.type === 'accommodation');
                if (lastAccommodation) {
                    prevAddress = lastAccommodation.address;
                }
            } else if (item.type === 'flight') {
                 // 第一天，從航班抵達地 LAX 開始計算
                prevAddress = item.address; 
            }
        }
        
        scheduleList.appendChild(renderScheduleItem(item, prevAddress));
        
        // 更新下一個行程的起點地址
        prevAddress = item.address;
    });

    return container;
}

// 渲染資訊分頁
function renderInfoTab() {
    const container = document.createElement('div');
    container.className = 'space-y-6';

    let html = `
        <h2 class="text-2xl font-bold text-blue-800 border-b-2 pb-2 border-yellow-400">資訊總覽 <i class="fas fa-i-cursor ml-2"></i></h2>
        
        <div class="bg-white p-4 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold text-blue-700 mb-3">即時匯率換算 (USD → TWD)</h3>
            <div class="flex items-center space-x-2">
                <input id="jpy-input" type="number" value="1000" class="w-24 p-2 border rounded-lg text-lg text-center" oninput="calculateExchangeRate()" />
                <span class="text-lg font-bold"> JPY ≈ </span>
                <span id="twd-output" class="text-2xl font-extrabold text-red-600"> 210 TWD</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">（假設今日匯率：1 JPY ≈ 0.21 TWD）</p>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-md space-y-4">
            <h3 class="text-xl font-semibold text-blue-700 border-b pb-2">✈️ 航班資訊</h3>
            ${[FLIGHT_INFO.outbound, FLIGHT_INFO.return].map(flight => `
                <div class="border-l-4 border-yellow-500 pl-3">
                    <p class="font-bold">${flight === FLIGHT_INFO.outbound ? '去程' : '回程'} (${flight.from} → ${flight.to}): ${flight.flight}</p>
                    <p class="text-sm">${flight.from} ${flight.depart} → ${flight.to} ${flight.arrive}</p>
                    <p class="text-xs text-gray-500">飛行時間: ${flight.duration}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="bg-white p-4 rounded-xl shadow-md space-y-3">
            <h3 class="text-xl font-semibold text-blue-700 border-b pb-2">🏨 住宿資訊</h3>
            ${ACCOMMODATIONS.map(acc => `
                <div class="border-l-4 border-blue-500 pl-3">
                    <p class="font-bold">${acc.name} (${acc.date})</p>
                    <p class="text-sm text-gray-600">${acc.address}</p>
                    <p class="text-sm text-gray-600">電話: ${acc.phone}</p>
                    <button onclick="navigateToGoogleMap('${acc.address}')" class="text-xs text-yellow-600 font-semibold mt-1">導航 <i class="fas fa-directions"></i></button>
                </div>
            `).join('')}
        </div>
        
        <div class="bg-white p-4 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold text-blue-700 border-b pb-2">🚗 租車資訊</h3>
            <p class="font-bold">${RENTAL_INFO.company} Booking Ref: ${RENTAL_INFO.ref}</p>
            <p class="text-sm text-gray-600">取車: ${RENTAL_INFO.pickup} / 還車: ${RENTAL_INFO.dropoff}</p>
            <button onclick="navigateToGoogleMap('${RENTAL_INFO.pickup}')" class="text-xs text-yellow-600 font-semibold mt-1">導航至取車處 <i class="fas fa-directions"></i></button>
        </div>
        
        <div class="bg-red-50 p-4 rounded-xl shadow-md border-l-4 border-red-500">
            <h3 class="text-xl font-semibold text-red-700 mb-2">🚨 緊急聯絡</h3>
            <p class="font-bold">警察 / 救護車: 911 (美國)</p>
        </div>
    `;
    container.innerHTML = html;
    return container;
}

// 匯率換算邏輯 (簡單模擬)
window.calculateExchangeRate = () => {
    const jpyInput = document.getElementById('jpy-input');
    const twdOutput = document.getElementById('twd-output');
    const jpyAmount = parseFloat(jpyInput.value) || 0;
    const rate = 0.21; // 模擬匯率
    const twdAmount = jpyAmount * rate;
    if (twdOutput) {
        twdOutput.textContent = `${Math.round(twdAmount).toLocaleString()} TWD`;
    }
};


// 渲染購物清單 (Shopping Tab)
function renderShoppingTab() {
    // 實作購物清單渲染邏輯
    const container = document.createElement('div');
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-blue-800 border-b-2 pb-2 border-yellow-400">購物清單 <i class="fas fa-shopping-basket ml-2"></i></h2>
        <p class="text-gray-600 mt-4">此處將列出想購買的物品清單。</p>
        <button class="fixed bottom-20 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition duration-300">
            <i class="fas fa-plus text-xl"></i>
        </button>
    `;
    return container;
}

// 渲染花費紀錄 (Expense Tab)
function renderExpenseTab() {
    // 實作花費紀錄渲染邏輯
    const container = document.createElement('div');
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-blue-800 border-b-2 pb-2 border-yellow-400">花費記錄 <i class="fas fa-money-bill-wave ml-2"></i></h2>
        <div class="bg-blue-700 text-white p-4 rounded-xl shadow-lg text-center mt-4">
            <p class="text-sm opacity-80">總花費 (TWD)</p>
            <p class="text-4xl font-extrabold">$0</p>
        </div>
        <p class="text-gray-600 mt-4">此處將新增和顯示旅遊花費記錄。</p>
        <button class="fixed bottom-20 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition duration-300">
            <i class="fas fa-plus text-xl"></i>
        </button>
    `;
    return container;
}


// 根據當前 Tab 渲染內容
function renderAppContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = ''; // 清空內容

    switch (appState.currentTab) {
        case 'schedule':
            mainContent.appendChild(renderScheduleTab());
            break;
        case 'info':
            mainContent.appendChild(renderInfoTab());
            // 初始化匯率換算
            setTimeout(calculateExchangeRate, 100); 
            break;
        case 'shopping':
            mainContent.appendChild(renderShoppingTab());
            break;
        case 'expense':
            mainContent.appendChild(renderExpenseTab());
            break;
    }
}


// --- Google Maps 初始化 ---
window.initMap = () => {
    appState.isMapLoaded = true;
    console.log("Google Maps API loaded.");

    // 在這裡可以初始化 Directions Service (導航服務)
    if (window.google && window.google.maps) {
        appState.directionsService = new window.google.maps.DirectionsService();
        // 由於我們只在卡片點擊時跳轉，不需要渲染器，但如果您想在 App 內顯示地圖，則需要：
        // appState.directionsRenderer = new window.google.maps.DirectionsRenderer(); 
    }
};


// --- 啟動應用程式 ---
document.addEventListener('DOMContentLoaded', () => {
    renderTabNav();
    renderAppContent();
});
