const defaultLanguage = document.documentElement.getAttribute('lang')
const gamePromoConfigs = {
    MyCloneArmy: {
        appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
        promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767',
        eventsDelay: 120000,
        attemptsNumber: 11
    },
    ChainCube2048: {
        appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
        promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    TrainMiner: {
        appToken: '82647f43-3f87-402d-88dd-09a90025313f',
        promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    BikeRide3D: {
        appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
        promoId: '43e35910-c168-4634-ad4f-52fd764a843f',
        eventsDelay: 20000,
        attemptsNumber: 22
    },
    MergeAway: {
        appToken: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
        promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    TwerkRace: {
        appToken: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    Polysphere: {
        appToken: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        promoId: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        eventsDelay: 20000,
        attemptsNumber: 20
    },
};

let currentAppConfig = gamePromoConfigs.MyCloneArmy;
var currentLanguage;
var keygenActive = false;

document.addEventListener('DOMContentLoaded', () => {
    const gameSelect = document.getElementById('gameSelect');

    gameSelect.addEventListener('change', () => {
        const selectedGame = gameSelect.value;
        currentAppConfig = gamePromoConfigs[selectedGame];
    });
});

async function loadTranslations(language) {
    try {
        const response = await fetch(`locales/${language}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        alert('Failed to load translations. Check the console for details.');
        throw error;
    }
}

async function getTranslation(key) {
    const translations = await loadTranslations(currentLanguage);
    return translations[key] || key;
}

function applyTranslations(translations) {
    document.querySelector('h1').innerText = translations.title;
    document.getElementById('keyCountLabel').innerText = keygenActive
        ? translations.selectKeyCountLabel_selected + document.getElementById('keyCountSelect').value
        : translations.selectKeyCountLabel;
    document.getElementById('startBtn').innerText = translations.generateButton;
    document.getElementById('generatedKeysTitle').innerText = translations.generatedKeysTitle;
    document.getElementById('creatorChannelBtn').innerText = translations.footerButton;
    document.getElementById('copyAllBtn').innerText = translations.copyAllKeysButton;
    document.getElementById('gameSelectLabel').innerText = translations.selectGameLabel;

    document.querySelectorAll('.copyKeyBtn').forEach(button => {
        button.innerText = translations.copyKeyButton || 'Copy Key';
    });
}


document.getElementById('startBtn').addEventListener('click', async () => {
    const startBtn = document.getElementById('startBtn');
    const keyCountSelect = document.getElementById('keyCountSelect');
    const keyCountLabel = document.getElementById('keyCountLabel');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const keyContainer = document.getElementById('keyContainer');
    const keysList = document.getElementById('keysList');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const generatedKeysTitle = document.getElementById('generatedKeysTitle');
    const keyCount = parseInt(keyCountSelect.value);
    document.getElementById("gameSelect").disabled = true;

    progressBar.style.width = '0%';
    progressText.innerText = '0%';
    progressContainer.classList.remove('hidden');
    keyContainer.classList.add('hidden');
    generatedKeysTitle.classList.add('hidden');
    keysList.innerHTML = '';
    keyCountSelect.classList.add('hidden');
    keyCountLabel.innerText = await getTranslation('selectKeyCountLabel_selected') + keyCount;
    startBtn.classList.add('hidden');
    copyAllBtn.classList.add('hidden');
    startBtn.disabled = true;

    let progress = 0;
    keygenActive = true;

    const updateProgress = (increment) => {
        const steps = 10;
        const stepIncrement = increment / steps;
        let step = 0;

        const increaseProgress = () => {
            if (!keygenActive) return;
            if (step < steps) {
                progress += stepIncrement;
                progressBar.style.width = `${progress}%`;
                progressText.innerText = `${Math.round(progress)}%`;
                step++;
                setTimeout(increaseProgress, 2000 / steps + Math.random() * 1000);
            }
        };

        increaseProgress();
    };

    const generateKeyProcess = async () => {
        const clientId = generateClientId();
        let clientToken;
        try {
            clientToken = await login(clientId);
        } catch (error) {
            alert(`Failed to log in: ${error.message}`);
            startBtn.disabled = false;
            return null;
        }
        
        for (let i = 0; i < currentAppConfig.attemptsNumber; i++) {
            await sleep(currentAppConfig.eventsDelay * delayRandom());
            const hasCode = await emulateProgress(clientToken);
            updateProgress((100 / currentAppConfig.attemptsNumber) / keyCount);
            if (hasCode) {
                break;
            }
        }

        try {
            const key = await generateKey(clientToken);
            return key;
        } catch (error) {
            alert(`Failed to generate key: ${error.message}`);
            return null;
        }
    };

    const keys = await Promise.all(Array.from({ length: keyCount }, generateKeyProcess));

    keygenActive = false;

    progressBar.style.width = '100%';
    progressText.innerText = '100%';

    if (keys.length > 1) {
        const keyItemsPromises = keys.filter(key => key).map(async (key, index) => {
            const copyKeyButtonText = await getTranslation('copyKeyButton');
            return `
                <div class="key-item">
                    <div class="key-number">${index + 1}</div>
                    <input type="text" value="${key}" readonly>
                    <button class="copyKeyBtn copy-button" data-key="${key}">${copyKeyButtonText}</button>
                </div>
            `;
        });
        const keyItemsHtml = await Promise.all(keyItemsPromises);
        keysList.innerHTML = keyItemsHtml.join('');
        copyAllBtn.classList.remove('hidden');
    } else if (keys.length === 1) {
        keysList.innerHTML = `
            <div class="key-item">
                <div class="key-number">1</div>
                <input type="text" value="${keys[0]}" readonly>
                <button class="copyKeyBtn copy-button" data-key="${keys[0]}">${await getTranslation('copyKeyButton')}</button>
            </div>
        `;
    }

    keyContainer.classList.remove('hidden');
    generatedKeysTitle.classList.remove('hidden');
    keyCountLabel.innerText = await getTranslation('selectKeyCountLabel');
    document.getElementById("gameSelect").disabled = false;
    document.querySelectorAll('.copyKeyBtn').forEach(button => {
        button.addEventListener('click', (event) => {
            const key = event.target.getAttribute('data-key');
            navigator.clipboard.writeText(key).then(async () => {
                event.target.innerText = await getTranslation('keyCopied');
                event.target.style.backgroundColor = 'rgba(0, 20, 0, 0.8)';
                setTimeout(async () => {
                    event.target.innerText = await getTranslation('copyKeyButton');
                    event.target.style.backgroundColor = '#0f0';
                }, 2000);
            });
        });
    });
    copyAllBtn.addEventListener('click', async (event) => {
        const keysText = keys.filter(key => key).join('\n');
        navigator.clipboard.writeText(keysText).then(async () => {
            event.target.innerText = await getTranslation('allKeysCopied');
            event.target.style.backgroundColor = 'rgba(0, 20, 0, 0.8)';
            setTimeout(async () => {
                event.target.innerText = await getTranslation('copyAllKeysButton');
                event.target.style.backgroundColor = 'rgba(0, 20, 0, 0.8)';
            }, 2000);
        });
    });

    startBtn.classList.remove('hidden');
    keyCountSelect.classList.remove('hidden');
    startBtn.disabled = false;
});

document.getElementById('creatorChannelBtn').addEventListener('click', () => {
    window.location.href = 'https://t.me/KeysGen';
});

function generateClientId() {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
}

async function login(clientId) {
    const response = await fetch('https://api.gamepromo.io/promo/login-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appToken: currentAppConfig.appToken, clientId, clientOrigin: 'deviceid' })
    });
    const data = await response.json();
    if (!response.ok) {
        if (data.error_code == "TooManyIpRequest") {
            throw new Error('You have reached the rate limit. Please wait a few minutes and try again.');
        } else {
            throw new Error(data.error_message || 'Failed to log in');
        }
        
    }
    return data.clientToken;
}

function generateUUID() {
    if (typeof crypto.randomUUID === 'function') {
        try {
            return crypto.randomUUID();
        } catch (error) {
            console.warn('crypto.randomUUID() failed, falling back to old method.');
        }
    }

    const cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
        const bytes = new Uint8Array(16);
        cryptoObj.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return [
            bytes.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join(''),
            bytes.slice(4, 6).map(b => b.toString(16).padStart(2, '0')).join(''),
            bytes.slice(6, 8).map(b => b.toString(16).padStart(2, '0')).join(''),
            bytes.slice(8, 10).map(b => b.toString(16).padStart(2, '0')).join(''),
            bytes.slice(10).map(b => b.toString(16).padStart(2, '0')).join('')
        ].join('-');
    } else {
        console.warn('crypto.getRandomValues not supported. Falling back to a less secure method.');
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

async function emulateProgress(clientToken) {
    const response = await fetch('https://api.gamepromo.io/promo/register-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${clientToken}`
        },
        body: JSON.stringify({
            promoId: currentAppConfig.promoId,
            eventId: generateUUID(),
            eventOrigin: 'undefined'
        })
    });
    const data = await response.json();
    // if (!response.ok) {
    //     throw new Error(data.error_message || 'Failed to register event');
    // }
    return data.hasCode;
}

async function generateKey(clientToken) {
    const response = await fetch('https://api.gamepromo.io/promo/create-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${clientToken}`
        },
        body: JSON.stringify({ promoId: currentAppConfig.promoId })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_message || 'Failed to generate key');
    }
    return data.promoCode;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayRandom() {
    return Math.random() / 3 + 1;
}


const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

const alphabet = katakana + latin + nums;

const fontSize = 16;
const columns = canvas.width / fontSize;

const rainDrops = [];

for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

setInterval(draw, 30);
