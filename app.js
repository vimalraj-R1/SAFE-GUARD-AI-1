/**
 * ==========================================================================
 * GUARDIANSHIELD WEB INTERFACE CORE APPLICATION CONTROLLER
 * ==========================================================================
 */

const translations = {
    en: {
        authTitle: "Secure Identity Access",
        authSub: "Authenticate credentials to initiate live gateway protocols",
        authSubmit: "Initialize Core Session",
        liveStatus: "GPS Network Secured",
        mapHeader: "Safe Route Navigation & Live Telemetry Stream",
        sosHeader: "Emergency Dispatch Node",
        sosBtnText: "SOS",
        sosBtnSub: "TAP ACTIVE",
        sosDesc: "Activating initiates local environment encryption loops, locks localized data packets, and signals law enforcement nodes instantly.",
        aiWelcome: "Hello! I am parsing alternative safe navigation lines dynamically. Ask me about public lighting matrix metrics, or notify guardians instantly.",
        aiInput: "Inquire spatial route security index...",
        sosTriggered: "DISPATCHED",
        sosCancel: "TAP TO CANCEL"
    },
    ta: {
        authTitle: "பாதுகாப்பான உள்நுழைவு",
        authSub: "உங்கள் கணக்கை அணுக நற்சான்றிதழ்களைச் சரிபார்க்கவும்",
        authSubmit: "அமைப்பைத் தொடங்கு",
        liveStatus: "ஜிபிஎஸ் நெட்வொர்க் பாதுகாக்கப்பட்டது",
        mapHeader: "பாதுகாப்பான வழிசெலுத்தல் மற்றும் நேரடி இருப்பிட கண்காணிப்பு",
        sosHeader: "அவசரகால உதவி மையம்",
        sosBtnText: "அபாயம்",
        sosBtnSub: "இயக்க அழுத்தவும்",
        sosDesc: "இதை அழுத்தினால் உங்கள் சுற்றுப்புற ஆடியோ பதிவு செய்யப்பட்டு, அவசரகால தொடர்புகளுக்கு நேரடி தகவல் உடனடியாக அனுப்பப்படும்.",
        aiWelcome: "வணக்கம்! நான் உங்கள் பாதுகாப்பு AI துணையாள். தற்போதைய பாதையின் பாதுகாப்பு நிலவரம் பற்றி என்னிடம் கேட்கலாம்.",
        aiInput: "பாதுகாப்பு விவரங்களை இங்கே கேளுங்கள்...",
        sosTriggered: "அனுப்பப்பட்டது",
        sosCancel: "நிறுத்த அழுத்தவும்"
    },
    hi: {
        authTitle: "सुरक्षित पहचान पहुंच",
        authSub: "लाइव गेटवे प्रोटोकॉल शुरू करने के लिए क्रेडेंशियल प्रमाणित करें",
        authSubmit: "कोर सत्र प्रारंभ करें",
        liveStatus: "जीपीएस नेटवर्क सुरक्षित",
        mapHeader: "सुरक्षित मार्ग नेविगेशन और लाइव टेलीमेट्री स्ट्रीम",
        sosHeader: "आपातकालीन प्रेषण नोड",
        sosBtnText: "आपातकाल",
        sosBtnSub: "दबाएं",
        sosDesc: "सक्रिय करने पर स्थानीय वातावरण एन्क्रिप्शन लूप शुरू हो जाता है, डेटा पैकेट लॉक हो जाते हैं, और कानून प्रवर्तन को तुरंत संकेत जाता है।",
        aiWelcome: "नमस्ते! मैं सुरक्षित नेविगेशन लाइनों का विश्लेषण कर रहा हूँ। प्रकाश व्यवस्था या अभिभावकों को सूचित करने के बारे में पूछें।",
        aiInput: "स्थान सुरक्षा सूचकांक के बारे में पूछें...",
        sosTriggered: "सक्रिय हुआ",
        sosCancel: "रद्द करने के लिए दबाएं"
    }
};

let activeLanguage = 'en';
let isSosDispatched = false;
let trackingMap = null;
let vehicleMarker = null;

const safePolylineCoords = [
    [13.0827, 80.2707],
    [13.0865, 80.2745],
    [13.0910, 80.2790],
    [13.0955, 80.2865]
];

// Switch Language Context & Transition Layouts
function setSystemLanguage(langCode) {
    activeLanguage = langCode;
    
    document.getElementById('lblAuthTitle').textContent = translations[langCode].authTitle;
    document.getElementById('lblAuthSub').textContent = translations[langCode].authSub;
    document.getElementById('btnAuthSubmit').textContent = translations[langCode].authSubmit;
    document.getElementById('lblLiveStatus').textContent = translations[langCode].liveStatus;
    document.getElementById('lblMapHeader').textContent = translations[langCode].mapHeader;
    document.getElementById('lblSosHeader').textContent = translations[langCode].sosHeader;
    document.getElementById('lblSosDesc').textContent = translations[langCode].sosDesc;
    document.getElementById('lblAiGreeting').textContent = translations[langCode].aiWelcome;
    document.getElementById('chatInput').placeholder = translations[langCode].aiInput;
    
    if(!isSosDispatched) {
        document.getElementById('txtSosDisplay').textContent = translations[langCode].sosBtnText;
        document.getElementById('txtSosSubDisplay').textContent = translations[langCode].sosBtnSub;
    } else {
        document.getElementById('txtSosDisplay').textContent = translations[langCode].sosTriggered;
        document.getElementById('txtSosSubDisplay').textContent = translations[langCode].sosCancel;
    }

    document.getElementById('splashScreen').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('authScreen').classList.remove('hidden');
}

// Authentication Form Transition Handler
function handleAuthSubmit(event) {
    event.preventDefault();
    document.getElementById('authScreen').classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        initializeMapEngine();
    }, 400);
}

function logOut() {
    document.getElementById('authScreen').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('splashScreen').classList.remove('opacity-0', 'pointer-events-none');
}

// Map Engine & Dynamic Mock Coordinates Stream Tracking 
function initializeMapEngine() {
    if (trackingMap) return;

    const mapCenter = [13.0827, 80.2707];
    trackingMap = L.map('map', { zoomControl: false }).setView(mapCenter, 14);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(trackingMap);

    vehicleMarker = L.circleMarker(mapCenter, {
        radius: 9,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
    }).addTo(trackingMap).bindPopup("<b>Telemetry Track Active</b><br>Encryption: AES-256").openPopup();

    L.polyline(safePolylineCoords, {
        color: '#10b981',
        weight: 5,
        opacity: 0.65,
        dashArray: '8, 12'
    }).addTo(trackingMap);

    let telemetryStepIdx = 0;
    setInterval(() => {
        if(!isSosDispatched && vehicleMarker) {
            telemetryStepIdx = (telemetryStepIdx + 1) % safePolylineCoords.length;
            vehicleMarker.setLatLng(safePolylineCoords[telemetryStepIdx]);
        }
    }, 4500);
}

// Trigger State Loops for the Core SOS Button System
function toggleSosTrigger() {
    const ringElement = document.getElementById('sosRing');
    const buttonElement = document.getElementById('sosBtn');
    const displayTxt = document.getElementById('txtSosDisplay');
    const subDisplayTxt = document.getElementById('txtSosSubDisplay');

    if (!isSosDispatched) {
        isSosDispatched = true;
        ringElement.classList.remove('hidden');
        ringElement.classList.add('sos-active-ring');
        buttonElement.classList.remove('from-red-700', 'to-red-500');
        buttonElement.classList.add('from-slate-700', 'to-slate-600', 'border-red-500');
        
        displayTxt.textContent = translations[activeLanguage].sosTriggered;
        subDisplayTxt.textContent = translations[activeLanguage].sosCancel;

        if(vehicleMarker) {
            vehicleMarker.setStyle({ fillColor: '#ef4444' });
            vehicleMarker.getPopup().setContent("<b class='text-red-500'>CRITICAL DISPATCH LATCH ACTIVATED</b><br>Streaming metrics...").openPopup();
            trackingMap.setView(vehicleMarker.getLatLng(), 16);
        }
        injectSystemNotificationLog("🚨 [CRITICAL ALERT]: Active SOS loop initialized. Data vaults syncing directly with emergency contact systems.");
    } else {
        isSosDispatched = false;
        ringElement.classList.add('hidden');
        ringElement.classList.remove('sos-active-ring');
        buttonElement.classList.remove('from-slate-700', 'to-slate-600', 'border-red-500');
        buttonElement.add('from-red-700', 'to-red-500');
        
        displayTxt.textContent = translations[activeLanguage].sosBtnText;
        subDisplayTxt.textContent = translations[activeLanguage].sosBtnSub;

        if(vehicleMarker) {
            vehicleMarker.setStyle({ fillColor: '#10b981' });
            vehicleMarker.getPopup().setContent("<b>Telemetry Track Active</b><br>Status: Standby Guard");
        }
        injectSystemNotificationLog("🛡️ [STANDBY SYSTEM]: Emergency alert cancelled. Reverting context tracking back to green standard loops.");
    }
}

// Natural Language AI Simulation Component
function handleAiChatSubmit(event) {
    event.preventDefault();
    const inputField = document.getElementById('chatInput');
    const msgText = inputField.value.trim();
    if (!msgText) return;

    appendMessageNode(msgText, true);
    inputField.value = '';

    setTimeout(() => {
        evaluateAiResponse(msgText);
    }, 750);
}

function appendMessageNode(text, isUserControlled) {
    const logBox = document.getElementById('chatLog');
    const cleanWrapperNode = document.createElement('div');
    cleanWrapperNode.className = `flex max-w-[85%] ${isUserControlled ? 'ml-auto justify-end' : ''}`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = isUserControlled 
        ? 'bg-indigo-600 border border-indigo-500 text-white p-3 rounded-2xl rounded-tr-none leading-relaxed'
        : 'bg-slate-700/60 border border-slate-600/40 text-slate-200 p-3 rounded-2xl rounded-tl-none leading-relaxed';
    
    messageBubble.textContent = text;
    cleanWrapperNode.appendChild(messageBubble);
    logBox.appendChild(cleanWrapperNode);
    logBox.scrollTop = logBox.scrollHeight;
}

function injectSystemNotificationLog(systemAlertText) {
    const logBox = document.getElementById('chatLog');
    const noticeWrapper = document.createElement('div');
    noticeWrapper.className = 'flex w-full';
    
    const alertContainer = document.createElement('div');
    alertContainer.className = 'w-full bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-xl text-[11px] font-mono leading-relaxed shadow-inner';
    alertContainer.textContent = systemAlertText;
    
    noticeWrapper.appendChild(alertContainer);
    logBox.appendChild(noticeWrapper);
    logBox.scrollTop = logBox.scrollHeight;
}

function evaluateAiResponse(inputPhrase) {
    let coreBotOutputStr = "Context logs noted. I'm cross-verifying open commercial zone lighting data metrics along your forward vector lines.";
    const processedNormalCaseStr = inputPhrase.toLowerCase();

    if(processedNormalCaseStr.includes('help') || processedNormalCaseStr.includes('danger')) {
        coreBotOutputStr = "High priority danger threat parsed. Tap the big red SOS core button directly if you feel immediately physically threatened to call emergency vectors.";
    } else if (processedNormalCaseStr.includes('route') || processedNormalCaseStr.includes('safe')) {
        coreBotOutputStr = "Alternative secure navigation metrics computed. Rerouted vectors prioritize primary grid roads with verified active street cameras and continuous foot traffic.";
    }

    appendMessageNode(coreBotOutputStr, false);
}
