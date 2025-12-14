// data.js

// 將日期從行程資訊中提取出來，用來生成日期選單
const DATES = [
    '2025-12-27', '2025-12-28', '2025-12-29', '2025-12-30',
    '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03'
];

// 行程數據結構
const TRIP_SCHEDULE = {
    '2025-12-27': [
        // (8) 第一天的第一個行程是航班
        { id: 1, type: 'flight', name: 'JL016 (Tokyo → LA)', time: '17:05 → 9:50', note: '飛行時間 9h 45m', address: 'LAX' },
        { id: 2, type: 'rental', name: 'SIXT LAX 取車', time: '10:30', note: 'SIXT booking ref 9728012386', address: 'LAX Car Rental Center' },
        { id: 3, type: 'food', name: "Randy's Donuts 🍩", time: '11:30', note: '打卡經典甜甜圈', address: '805 W Manchester Blvd, Inglewood, CA 90301' },
        { id: 4, type: 'attraction', name: 'Lake Hollywood Park', time: '14:00', note: '遠眺 Hollywood 字樣', address: '3200 Canyon Lake Dr, Los Angeles, CA 90068' },
        { id: 5, type: 'attraction', name: 'Griffith Observatory', time: '16:30', note: '俯瞰洛杉磯', address: '2800 E Observatory Rd, Los Angeles, CA 90027' },
        { id: 6, type: 'attraction', name: 'Santa Monica Beach & Pier', time: '19:00', note: '日落海灘', address: '200 Santa Monica Pier, Santa Monica, CA 90401' },
        { id: 7, type: 'food', name: "Johnnie's Pastrami", time: '20:30', note: '猶太人燻牛肉三明治', address: '4017 Sepulveda Blvd, Culver City, CA 90230' },
        { id: 8, type: 'accommodation', name: 'Sheraton Park Hotel', time: '22:00', note: '入住', address: '1855 S Harbor Blvd, Anaheim, CA 92802' },
    ],
    '2025-12-28': [
        { id: 1, type: 'attraction', name: 'Disneyland Adventure Park', time: '全天', note: '迪士尼樂園', address: '1313 Disneyland Dr, Anaheim, CA 92802' },
        { id: 2, type: 'food', name: 'Joe’s Italian Ice', time: '20:00', note: '冰淇淋', address: '15545 Jeffrey Rd, Irvine, CA 92618' },
        { id: 3, type: 'accommodation', name: 'Sheraton Park Hotel', time: '22:00', note: '回飯店', address: '1855 S Harbor Blvd, Anaheim, CA 92802' },
    ],
    // ... 其他日期行程 (為簡潔省略)
};

const ACCOMMODATIONS = [
    { name: 'Sheraton Park Hotel at the Anaheim Resort', date: '12/27-12/29', address: '1855 S Harbor Blvd, Anaheim, CA 92802', phone: '+1 714-750-1811' },
    { name: 'Airbnb Oceano', date: '12/29-12/30', address: '1350 St Oceano CA 93445', phone: 'N/A' },
    { name: "Riu Plaza Fisherman's Wharf", date: '12/31-1/1', address: '2500 Mason St, San Francisco, CA 94133', phone: '+1 415-392-5500' },
    { name: 'Airbnb Ward St', date: '1/1-1/3', address: 'Ward St San Francisco', phone: 'N/A' },
];

const FLIGHT_INFO = {
    outbound: { flight: 'JL016', from: 'NRT', to: 'LAX', depart: '17:05 (12/27)', arrive: '9:50 (12/27)', duration: '9h 45m' },
    return: { flight: 'JL57', from: 'SFO', to: 'NRT', depart: '11:40 (1/3)', arrive: '16:00+1 (1/4)', duration: '10h 20m' },
};

const RENTAL_INFO = {
    company: 'SIXT',
    ref: '9728012386',
    pickup: 'LAX Car Rental Center',
    dropoff: 'SFO Airport',
};
