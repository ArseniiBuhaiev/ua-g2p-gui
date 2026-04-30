const html = document.documentElement;
const loader = document.getElementById('loader');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

// 1. ТЕМА
const savedTheme = localStorage.getItem('g2p-theme') || 'light';
html.setAttribute('data-bs-theme', savedTheme);

document.getElementById('themeToggle').addEventListener('click', () => {
    const current = html.getAttribute('data-bs-theme');
    const target = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-bs-theme', target);
    localStorage.setItem('g2p-theme', target);
});

// 2. ШРИФТ
let currentFS = parseInt(localStorage.getItem('g2p-fs')) || 20;
document.documentElement.style.setProperty('--main-font-size', currentFS + 'px');

function changeFontSize(delta) {
    currentFS = Math.max(12, Math.min(32, currentFS + delta));
    document.documentElement.style.setProperty('--main-font-size', currentFS + 'px');
    localStorage.setItem('g2p-fs', currentFS);
}

// 3. ФАЙЛИ ТА ГАРЯЧІ КЛАВІШІ
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => inputText.value = e.target.result;
    reader.readAsText(file);
});

document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        processText();
    }
});

// 4. ТРАНСКРИПЦІЯ
async function processText() {
    let text = inputText.value.trim();
    if (!text) {
        text = inputText.getAttribute('placeholder');
        inputText.value = text;
    }

    const mode = document.querySelector('input[name="mode"]:checked').value;
    const accentor = document.querySelector('input[name="accentor"]:checked').value;

    loader.style.display = 'flex';

    try {
        const response = await fetch('/g2p/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, accentor, mode })
        });

        const data = await response.json();
        if (data.error) {
            outputText.value = "Помилка: " + data.error;
        } else {
            outputText.value = data.result || '';
        }
    } catch (err) {
        outputText.value = 'Сервер недоступний.';
        console.error(err);
    } finally {
        loader.style.display = 'none';
    }
}

// 5. УТИЛІТИ
function copyText() {
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value);
    alert('Скопійовано!');
}

function saveFile() {
    if (!outputText.value) return;
    const blob = new Blob([outputText.value], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'transcription.txt'; 
    a.click();
}