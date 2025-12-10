// --- KONSTANTA & ELEMEN DOM ---
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// Cipher Lab Elements
const inputText = $('#input-text');
const keyInput = $('#key-input');
const outputText = $('#output-text');
const rawCountDisplay = $('#raw-char-count');
const cleanCountDisplay = $('#clean-char-count');
const cipherOptions = $$('.cipher-option');
const keyValidationMsg = $('#key-validation-msg');
const operationLog = $('#operation-log');

// Cryptanalysis Toolkit Elements
const analysisInputText = $('#analysis-input-text');
const analysisToolSelect = $('#analysis-tool-select');
const analysisRawCountDisplay = $('#analysis-raw-char-count');
const analysisCleanCountDisplay = $('#analysis-clean-char-count');
const analysisLog = $('#analysis-log');
const analysisPlaceholder = $('#analysis-placeholder-default');
const analysisOutputContent = $('#analysis-output-content');
const frequencyBarsContainer = $('#frequency-bars');
const totalAnalysisChars = $('#total-analysis-chars');

// Global State & Constants
let currentCipher = 'caesar';
const ALPHABET_SIZE = 26;
const CHAR_CODE_A = 'A'.charCodeAt(0);
const PRIMARY_TEAL = 'text-primary-teal';

// Global variable untuk menyimpan hasil analisis terakhir
let lastAnalysisResult = { tool: null, data: null, text: '' };

// --- UTILITY FUNCTIONS ---

function cleanInput(text) {
    if (typeof text !== 'string') return '';
    return text.toUpperCase().replace(/[^A-Z]/g, '');
}

function updateCharCount(inputElement, rawDisplay, cleanDisplay) {
    const rawText = inputElement.value;
    const cleanedText = cleanInput(rawText);
    rawDisplay.textContent = rawText.length;
    cleanDisplay.textContent = cleanedText.length;
}

function validateKey(cipher, key) {
    keyValidationMsg.textContent = '';
    switch (cipher) {
        case 'caesar':
            const numKey = parseInt(key);
            if (isNaN(numKey) || numKey < 0 || numKey > 25 || numKey.toString() !== key.trim()) {
                keyValidationMsg.textContent = 'Kunci Caesar harus bilangan bulat antara 0 hingga 25.';
                return false;
            }
            return true;
        case 'vigenere':
            const cleanedKey = cleanInput(key);
            if (key.length === 0 || key.toUpperCase() !== cleanedKey || cleanedKey.length === 0) {
                keyValidationMsg.textContent = 'Kunci Vigenère harus hanya terdiri dari huruf A-Z.';
                return false;
            }
            return true;
        case 'railfence':
            const rails = parseInt(key);
            const cleanedInputLength = cleanInput(inputText.value).length;

            if (isNaN(rails) || rails < 2 || rails > 10 || rails.toString() !== key.trim()) {
                keyValidationMsg.textContent = 'Kunci Rail Fence (Rails) harus bilangan bulat antara 2 hingga 10.';
                return false;
            }
            if (cleanedInputLength < 2) {
                keyValidationMsg.textContent = `Teks input minimal harus 2 karakter setelah dibersihkan.`;
                return false;
            }
            if (cleanedInputLength <= rails) {
                keyValidationMsg.textContent = `Rails (${rails}) harus kurang dari panjang teks yang dibersihkan (${cleanedInputLength}).`;
                return false;
            }
            return true;
        default:
            return true;
    }
}

function copyToClipboard(text, logElement) {
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            logElement.textContent = 'Output teks berhasil disalin ke clipboard!';
        }).catch(err => {
            logElement.textContent = 'Gagal menyalin output. Coba salin secara manual.';
            console.error('Could not copy text: ', err);
        });
    } else {
        logElement.textContent = 'Tidak ada teks untuk disalin.';
    }
}

// --- CIPHER LOGIC ---

function caesarEncrypt(plaintext, key) {
    let result = '';
    const shift = key % ALPHABET_SIZE;
    for (let i = 0; i < plaintext.length; i++) {
        const p = plaintext.charCodeAt(i) - CHAR_CODE_A;
        const c = (p + shift) % ALPHABET_SIZE;
        result += String.fromCharCode(c + CHAR_CODE_A);
    }
    return result;
}

function caesarDecrypt(ciphertext, key) {
    let result = '';
    const shift = key % ALPHABET_SIZE;
    for (let i = 0; i < ciphertext.length; i++) {
        const c = ciphertext.charCodeAt(i) - CHAR_CODE_A;
        const p = (c - shift + ALPHABET_SIZE) % ALPHABET_SIZE;
        result += String.fromCharCode(p + CHAR_CODE_A);
    }
    return result;
}

function vigenereEncrypt(plaintext, key) {
    let result = '';
    const keyLength = key.length;
    for (let i = 0; i < plaintext.length; i++) {
        const p_char_code = plaintext.charCodeAt(i) - CHAR_CODE_A;
        const k_char_code = key.charCodeAt(i % keyLength) - CHAR_CODE_A;
        const c = (p_char_code + k_char_code) % ALPHABET_SIZE;
        result += String.fromCharCode(c + CHAR_CODE_A);
    }
    return result;
}

function vigenereDecrypt(ciphertext, key) {
    let result = '';
    const keyLength = key.length;
    for (let i = 0; i < ciphertext.length; i++) {
        const c_char_code = ciphertext.charCodeAt(i) - CHAR_CODE_A;
        const k_char_code = key.charCodeAt(i % keyLength) - CHAR_CODE_A;
        const p = (c_char_code - k_char_code + ALPHABET_SIZE) % ALPHABET_SIZE;
        result += String.fromCharCode(p + CHAR_CODE_A);
    }
    return result;
}

function createRailPattern(length, rails) {
    if (rails <= 1 || length === 0) return Array(length).fill(0);
    const pattern = [];
    let rail = 0;
    let direction = 1;
    for (let i = 0; i < length; i++) {
        pattern.push(rail);
        if (rail === rails - 1) {
            direction = -1;
        } else if (rail === 0) {
            direction = 1;
        }
        rail += direction;
    }
    return pattern;
}

function railFenceEncrypt(plaintext, rails) {
    if (rails <= 1) return plaintext;
    const railMatrix = Array.from({ length: rails }, () => []);
    const pattern = createRailPattern(plaintext.length, rails);
    for (let i = 0; i < plaintext.length; i++) {
        railMatrix[pattern[i]].push(plaintext[i]);
    }
    let ciphertext = '';
    for (const rail of railMatrix) {
        ciphertext += rail.join('');
    }
    return ciphertext;
}

function railFenceDecrypt(ciphertext, rails) {
    if (rails <= 1) return ciphertext;
    const length = ciphertext.length;
    const pattern = createRailPattern(length, rails);
    const railLengths = Array(rails).fill(0);
    for (const rail of pattern) {
        railLengths[rail]++;
    }

    const startIndex = Array(rails).fill(0);
    let currentIdx = 0;
    for (let r = 0; r < rails; r++) {
        startIndex[r] = currentIdx;
        currentIdx += railLengths[r];
    }

    let plaintext = Array(length);
    for (let r = 0; r < rails; r++) {
        const start = startIndex[r];
        const railChars = ciphertext.substring(start, start + railLengths[r]);
        let charIndex = 0;

        for (let i = 0; i < length; i++) {
            if (pattern[i] === r) {
                plaintext[i] = railChars[charIndex++];
            }
        }
    }
    return plaintext.join('');
}


// --- CRYPTANALYSIS LOGIC IMPLEMENTATION ---

function calculateFrequency(text) {
    const counts = {};
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        counts[String.fromCharCode(CHAR_CODE_A + i)] = 0;
    }

    for (const char of text) {
        if (char >= 'A' && char <= 'Z') {
            counts[char]++;
        }
    }

    const total = text.length;
    const frequencies = {};
    for (const char in counts) {
        frequencies[char] = total > 0 ? counts[char] / total : 0;
    }
    return frequencies;
}

/** Rendering Frequency Chart: HANYA tampilkan huruf yang muncul */
function renderFrequencyChart(frequencies, totalChars) {
    frequencyBarsContainer.innerHTML = '';
    analysisLog.textContent = 'Analisis frekuensi selesai.';

    // FILTERING: Saring hanya huruf yang muncul (frekuensi > 0)
    const sortedKeys = Object.keys(frequencies)
        .filter(char => frequencies[char] > 0)
        .sort((a, b) => frequencies[b] - frequencies[a]);

    if (sortedKeys.length === 0) {
        frequencyBarsContainer.innerHTML = `<p class="text-center mt-6 text-text-secondary">Tidak ada huruf A-Z yang dapat dianalisis pada input teks.</p>`;
        return;
    }

    let copyText = "Frekuensi Huruf:\n";

    $('#analysis-output-content h4').textContent = 'Grafik Frekuensi Huruf Ciphertext';

    sortedKeys.forEach(char => {
        const percentage = frequencies[char] * 100;
        const count = Math.round(frequencies[char] * totalChars);

        copyText += `${char}: ${percentage.toFixed(2)}% (${count}x)\n`;

        const html = `
            <div class="bar-item">
                <span class="bar-label">${char}</span>
                <div class="bar-chart">
                    <div class="bar-fill" style="width: ${percentage.toFixed(2)}%;"></div> 
                </div>
                <span class="bar-percentage">${percentage.toFixed(2)}%</span>
                <span style="width: 30px; margin-left: 5px; color: #6b7280; text-align: left; font-size: 0.75rem;">${count}x</span>
            </div>
        `;
        frequencyBarsContainer.innerHTML += html;
    });

    lastAnalysisResult = { tool: 'frequency', data: frequencies, text: copyText };
}


function renderBruteForceResult(ciphertext) {
    let resultHtml = `
        <h4 class="text-base font-semibold text-text-primary mb-2">Caesar Brute-Force (${ALPHABET_SIZE} Kunci)</h4>
        <div class="bg-input-bg border border-border-light rounded-lg p-3 h-64 overflow-y-scroll shadow-inner">
            <pre class="font-mono text-sm whitespace-pre-wrap leading-relaxed">`;

    let copyText = "Caesar Brute-Force Results:\n";

    for (let k = 0; k < ALPHABET_SIZE; k++) {
        const decryptedText = caesarDecrypt(ciphertext, k);
        const isEmphasized = [0, 4, 8, 12, 16, 20, 24].includes(k);
        const line = `<span class="text-text-secondary">[Kunci ${k < 10 ? '0' + k : k}]</span> <span class="text-text-primary ${isEmphasized ? PRIMARY_TEAL : ''}">${decryptedText}</span>\n`;

        resultHtml += line;
        copyText += `[Key ${k}] ${decryptedText}\n`;
    }

    resultHtml += `</pre></div>`;
    frequencyBarsContainer.innerHTML = resultHtml;
    analysisLog.textContent = 'Brute-Force selesai. Analisis visual diperlukan untuk menemukan plaintext.';
    lastAnalysisResult = { tool: 'bruteforce', data: null, text: copyText };
}


// --- MAIN HANDLER ---

function handleAnalysis() {
    const rawText = analysisInputText.value;
    const cleanedText = cleanInput(rawText);
    const tool = analysisToolSelect.value;

    if (cleanedText.length < 2) {
        analysisLog.textContent = 'Error: Teks minimal 2 karakter setelah dibersihkan.';
        analysisPlaceholder.style.display = 'block';
        analysisOutputContent.style.display = 'none';
        return;
    }

    analysisPlaceholder.style.display = 'none';
    analysisOutputContent.style.display = 'block';
    totalAnalysisChars.textContent = cleanedText.length;
    frequencyBarsContainer.innerHTML = '<p class="text-center text-text-secondary mt-6">Processing...</p>';

    analysisLog.textContent = `Menganalisis menggunakan ${tool.toUpperCase()}...`;

    if (tool === 'frequency') {
        const frequencies = calculateFrequency(cleanedText);
        renderFrequencyChart(frequencies, cleanedText.length);
    } else if (tool === 'bruteforce') {
        renderBruteForceResult(cleanedText);
    } else {
        frequencyBarsContainer.innerHTML = `<p class="text-center mt-6 text-red-600">Alat analisis tidak dikenal.</p>`;
        analysisLog.textContent = `Error: Alat analisis tidak dikenal.`;
    }
}

function handleCopyAnalysisData() {
    if (lastAnalysisResult.text) {
        copyToClipboard(lastAnalysisResult.text, analysisLog);
    } else {
        analysisLog.textContent = 'Tidak ada data analisis untuk disalin.';
    }
}


// --- EVENT HANDLERS ---

function handleCipherSelection(event) {
    let target = event.target;
    while (target && !target.classList.contains('cipher-option')) {
        target = target.parentNode;
    }
    if (!target) return;

    currentCipher = target.dataset.cipher;

    let placeholder = 'Contoh: 3 (geseran 0-25)';
    if (currentCipher === 'vigenere') {
        placeholder = 'Contoh: KRIPTO (hanya huruf)';
    } else if (currentCipher === 'railfence') {
        placeholder = 'Contoh: 3 (Jumlah Rails, min 2)';
    }
    keyInput.placeholder = placeholder;

    validateKey(currentCipher, keyInput.value);
}

function handleCipherOperation(isEncrypt) {
    const rawText = inputText.value;
    const key = keyInput.value;
    const cleanedText = cleanInput(rawText);

    if (!validateKey(currentCipher, key)) {
        operationLog.textContent = 'Error: Kunci tidak valid. Cek pesan validasi.';
        return;
    }
    if (cleanedText.length === 0) {
        operationLog.textContent = 'Error: Input teks tidak boleh kosong setelah dibersihkan.';
        return;
    }

    let result = '';
    let validKey;

    if (currentCipher === 'caesar' || currentCipher === 'railfence') {
        validKey = parseInt(key);
    } else if (currentCipher === 'vigenere') {
        validKey = cleanInput(key);
    }

    try {
        if (currentCipher === 'caesar') {
            result = isEncrypt ? caesarEncrypt(cleanedText, validKey) : caesarDecrypt(cleanedText, validKey);
        } else if (currentCipher === 'vigenere') {
            result = isEncrypt ? vigenereEncrypt(cleanedText, validKey) : vigenereDecrypt(cleanedText, validKey);
        } else if (currentCipher === 'railfence') {
            result = isEncrypt ? railFenceEncrypt(cleanedText, validKey) : railFenceDecrypt(cleanedText, validKey);
        }

        outputText.value = result;
        operationLog.textContent = `Operasi ${isEncrypt ? 'ENKRIPSI' : 'DEKRIPSI'} ${currentCipher.toUpperCase()} berhasil!`;
    } catch (e) {
        operationLog.textContent = `Error: Gagal menjalankan operasi. Pastikan input/kunci valid.`;
        console.error(e);
    }
}


// --- INTI: ATTACH EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // Cipher Lab: Input Count & Key Validation
    inputText.addEventListener('input', () => {
        updateCharCount(inputText, rawCountDisplay, cleanCountDisplay);
        validateKey(currentCipher, keyInput.value);
    });
    keyInput.addEventListener('input', () => {
        validateKey(currentCipher, keyInput.value);
    });

    // Cipher Lab: Cipher Selection
    cipherOptions.forEach(opt => {
        opt.addEventListener('click', handleCipherSelection);
    });

    // Cipher Lab: Operation Buttons
    $('#encrypt-btn').addEventListener('click', () => handleCipherOperation(true));
    $('#decrypt-btn').addEventListener('click', () => handleCipherOperation(false));
    $('#copy-output-btn').addEventListener('click', () => copyToClipboard(outputText.value, operationLog));

    // Cryptanalysis Toolkit: Input Count
    analysisInputText.addEventListener('input', () => {
        updateCharCount(analysisInputText, analysisRawCountDisplay, analysisCleanCountDisplay);
    });

    // Cryptanalysis Toolkit: Analyze Button
    $('#analyze-btn').addEventListener('click', handleAnalysis);
    $('#copy-analysis-btn').addEventListener('click', handleCopyAnalysisData);


    // Initial setup
    updateCharCount(inputText, rawCountDisplay, cleanCountDisplay);
    updateCharCount(analysisInputText, analysisRawCountDisplay, analysisCleanCountDisplay);
    validateKey(currentCipher, keyInput.value);
});