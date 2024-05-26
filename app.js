let userId;

function login() {
    userId = document.getElementById('userId').value;
    if (userId) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('chatbot').style.display = 'block';
    } else {
        alert('Please enter your ID');
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput) {
        const response = await fetchGPTResponse(userInput);
        displayMessage(userInput, response);
        logToGoogleSheets(userInput, response);
    }
}

function displayMessage(input, response) {
    const chatbox = document.getElementById('chatbox');
    const userMessage = document.createElement('div');
    userMessage.textContent = `You: ${input}`;
    const botMessage = document.createElement('div');
    botMessage.textContent = `Bot: ${response}`;
    chatbox.appendChild(userMessage);
    chatbox.appendChild(botMessage);
    document.getElementById('userInput').value = '';
}

async function fetchGPTResponse(query) {
    const apiKey = 'sk-proj-3YPfap7WV23TIapzz2NzT3BlbkFJLyOEU7bTKZjImAMs3NU8';
    const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            prompt: `Translate the word "${query}" to Korean and provide an A1 level English definition with two example sentences.`,
            max_tokens: 100
        })
    });
    const data = await response.json();
    return data.choices[0].text.trim();
}

async function logToGoogleSheets(input, response) {
    const sheetId = 'https://script.google.com/macros/s/AKfycbwVl2gzpoF_HNRLnD-TIb4DwLFIcz4N2OAItGgiPk23j7tigaBi6Uv2hfcZ6y27GRX5Mw/exec';
    const accessToken = await getGoogleAccessToken();

    const responseObj = parseResponse(response);

    const body = {
        values: [[input, responseObj.korean, responseObj.english, responseObj.example1, responseObj.example2]]
   