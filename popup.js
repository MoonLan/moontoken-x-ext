const textArea = document.getElementById('textArea');
const saveButton = document.getElementById('saveButton');
const lineCountParagraph = document.getElementById('lineCount');
const tokenInput = document.getElementById('token_display');
const nextButton = document.getElementById('nextButton');
const preButton = document.getElementById('preButton');
const login_auth_id = document.getElementById('loginAuth');

function modifyCookie(cookieName, cookieValue, domain, path) {
    document.cookie = `${cookieName}=${cookieValue};domain=${domain};path=${path};Secure`;
}


function Login(token) {
    modifyCookie('auth_token', `"${token.replace('"', '')}"`, 'twitter.com', '/');
    window.location.replace('https://twitter.com');
}

function saveToStorage() {
    chrome.storage.local.set({
        tokens: tokens, lineCount: lineCount, currentIndex: currentIndex, content: lines
    });

    nextButton.disabled = false;
    preButton.disabled = false;
    login_auth_id.disabled = false;
}

function loadFromStorage() {
    lineCountParagraph.textContent = `Fresh...`;
    nextButton.disabled = true;
    preButton.disabled = true;
    login_auth_id.disabled = true;

    chrome.storage.local.get(['tokens', 'currentIndex', 'lineCount', 'content'], (result) => {
        if (result.tokens) {
            tokens = result.tokens;
            currentIndex = result.currentIndex;
            lines = result.content;
            lineCount = result.lineCount;
            lineCountParagraph.textContent = `Line Count: ${lineCount}`;
            displayToken();
            nextButton.disabled = false;
            preButton.disabled = false;
            login_auth_id.disabled = false;
        }else{
            lineCountParagraph.textContent = `Fresh new, need to load the inputs`;
        }
    });
}

function displayToken() {
    tokenInput.value = tokens[currentIndex];
}

saveButton.addEventListener('click', () => {
    const text = textArea.value;
    // Count the number of lines
    lines = text.split('\n');
    lineCount = lines.length;
    tokens = lines.map(line => line.split('——')[5]);
    lineCountParagraph.textContent = `Line Count: ${lineCount}`;
    currentIndex = 0;
    displayToken();
    saveToStorage();
});


login_auth_id.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        lineCountParagraph.textContent = `ok good.`;
        var tabId = tabs[0].id;
        chrome.scripting.executeScript({
            target: {tabId: tabId}, func: Login, args: [tokenInput.value]
        });
    });
});
preButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex = currentIndex - 1;
    }
    const nextIndex = currentIndex % tokens.length;
    lineCountParagraph.textContent = `Line Count: ${currentIndex} / ${lineCount}`;
    tokenInput.value = tokens[nextIndex];
    displayToken();
    saveToStorage();
});
nextButton.addEventListener('click', () => {
    // const tokens = lines.map(line => line.split('——')[5]);
    currentIndex = currentIndex + 1;
    // Display the first token
    // tokenInput.value = tokens[5];
    // Get the current index
    // const currentIndex = tokens.findIndex(token => token === tokenInput.value);
    // Get the next index
    const nextIndex = currentIndex % tokens.length;
    // Display the next token
    lineCountParagraph.textContent = `Line Count: ${currentIndex} / ${lineCount}`;
    tokenInput.value = tokens[nextIndex];
    displayToken();
    saveToStorage();
});


let tokens = [];
let lineCount = 0;
let currentIndex = 0;
let lines = [];

loadFromStorage();
