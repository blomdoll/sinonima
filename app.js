// =============================================
// SINÓNIMA — Lógica principal
// =============================================

// --- Referencias al DOM ---
const btnOpen        = document.getElementById('btnMenuMobile');
const btnClose       = document.getElementById('btnCloseMenu');
const overlay        = document.getElementById('navOverlay');
const themeMobileBtn = document.getElementById('themeToggleMobile');
const themeTextMobile = document.getElementById('themeTextMobile');
const themeToggleBtn = document.getElementById('themeToggle');
const editor         = document.getElementById('editor');
const wordCount      = document.getElementById('wordCount');
const copyBtn        = document.getElementById('copyBtn');
const currentWord    = document.getElementById('currentWord');
const synList        = document.getElementById('synList');

// =============================================
// MENÚ MÓVIL — Abrir / Cerrar
// =============================================
btnOpen.onclick  = () => overlay.classList.add('active');
btnClose.onclick = () => overlay.classList.remove('active');
overlay.onclick  = (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
};

// =============================================
// TEMA — Claro / Oscuro
// =============================================
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sinonima-theme', theme);
    themeTextMobile.innerText = theme === 'light' ? 'MODO CLARO' : 'MODO OSCURO';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
}

themeMobileBtn.onclick  = toggleTheme;
themeToggleBtn.onclick  = toggleTheme;

// Cargar preferencia guardada (por defecto: dark)
const savedTheme = localStorage.getItem('sinonima-theme') || 'dark';
applyTheme(savedTheme);

// =============================================
// CONTADOR DE PALABRAS
// =============================================
function updateWordCount() {
    const text  = editor.value.trim();
    const count = text === '' ? 0 : text.split(/\s+/).length;
    wordCount.textContent = count === 1 ? '1 palabra' : `${count} palabras`;
}

// =============================================
// COPIAR TEXTO
// =============================================
copyBtn.onclick = async () => {
    if (!editor.value) return;

    try {
        await navigator.clipboard.writeText(editor.value);
        const original = copyBtn.textContent;
        copyBtn.textContent = '¡Copiado!';
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
    } catch {
        // Fallback para navegadores sin soporte de clipboard API
        editor.select();
        document.execCommand('copy');
    }
};

// =============================================
// SINÓNIMOS — Detección de palabra activa
// =============================================

// Última palabra procesada para evitar llamadas repetidas
let lastWord = '';

function getWordAtCursor() {
    const pos  = editor.selectionStart;
    const text = editor.value;

    // Buscar inicio de la palabra (retroceder hasta espacio o inicio)
    let start = pos;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;

    // Buscar fin de la palabra (avanzar hasta espacio o fin)
    let end = pos;
    while (end < text.length && !/\s/.test(text[end])) end++;

    return text.slice(start, end).replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '').toLowerCase();
}

function showLoading() {
    synList.innerHTML = '<div class="syn-empty">Buscando…</div>';
}

function showEmpty(msg = 'Escribe algo...') {
    synList.innerHTML = `<div class="syn-empty">${msg}</div>`;
    currentWord.textContent = '—';
}

function renderSynonyms(word, synonyms) {
    currentWord.textContent = word;

    if (!synonyms || synonyms.length === 0) {
        synList.innerHTML = '<div class="syn-empty">Sin resultados</div>';
        return;
    }

    synList.innerHTML = synonyms
        .map(syn => `<button class="syn-item" data-word="${syn}">${syn}</button>`)
        .join('');

    // Al hacer clic en un sinónimo, reemplaza la palabra actual en el editor
    synList.querySelectorAll('.syn-item').forEach(btn => {
        btn.onclick = () => replaceCurrentWord(btn.dataset.word);
    });
}

// =============================================
// REEMPLAZAR PALABRA EN EL EDITOR
// =============================================
function replaceCurrentWord(replacement) {
    const pos  = editor.selectionStart;
    const text = editor.value;

    let start = pos;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;

    let end = pos;
    while (end < text.length && !/\s/.test(text[end])) end++;

    // Preservar puntuación al final si existe
    const punctMatch = text.slice(start, end).match(/([^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+)$/);
    const trailingPunct = punctMatch ? punctMatch[1] : '';

    editor.value = text.slice(0, start) + replacement + trailingPunct + text.slice(end);

    // Reposicionar el cursor al final de la palabra insertada
    const newPos = start + replacement.length + trailingPunct.length;
    editor.setSelectionRange(newPos, newPos);
    editor.focus();

    updateWordCount();
    lastWord = replacement;
    currentWord.textContent = replacement;
}

// =============================================
// BÚSQUEDA DE SINÓNIMOS — API de Datamuse (ES)
// =============================================
async function fetchSynonyms(word) {
    if (!word || word.length < 2) {
        showEmpty();
        lastWord = '';
        return;
    }

    if (word === lastWord) return; // Sin cambios, no volver a consultar
    lastWord = word;

    showLoading();

    try {
        // Datamuse soporta español con el parámetro v=es
        const url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&v=es&max=20`;
        const res  = await fetch(url);
        const data = await res.json();

        const synonyms = data.map(item => item.word);
        renderSynonyms(word, synonyms);
    } catch {
        synList.innerHTML = '<div class="syn-empty">Error al conectar</div>';
    }
}

// =============================================
// EVENTOS DEL EDITOR
// =============================================
let debounceTimer;

function onEditorActivity() {
    updateWordCount();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const word = getWordAtCursor();
        fetchSynonyms(word);
    }, 350); // Esperar 350ms tras dejar de escribir
}

editor.addEventListener('input',    onEditorActivity);
editor.addEventListener('keyup',    onEditorActivity);
editor.addEventListener('mouseup',  onEditorActivity);
editor.addEventListener('touchend', onEditorActivity);
