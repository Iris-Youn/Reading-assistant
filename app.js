document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('sendButton').addEventListener('click', sendMessage);
});

let userId;

function login() {
    userId = document.getElementById('userId').value;
    console.log('Login function called');
    if (userId) {
        console.log('User ID:', userId);
        document.getElementById('login').style.display = 'none';
        document.getElementById('chatbot').style.display = 'block';
    } else {
        console.log('No user ID entered');
        alert('Please enter your ID');
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput) {
        console.log('User Input:', userInput);
        try {
            const response = await fetchGPTResponse(userInput);
            displayMessage(userInput, response);
            await logToGoogleSheets(userInput, response);
        } catch (error) {
            console.error('Error fetching GPT response or logging to Google Sheets:', error);
        }
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
    const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your OpenAI API key
    try {
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
        console.log('GPT Response:', data);
        return data.choices[0].text.trim();
    } catch (error) {
        console.error('Error fetching GPT response:', error);
        throw error;
    }
}

async function logToGoogleSheets(input, response) {
    const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // Replace with your Google Apps Script URL
    const payload = {
        userId: userId,
        word: input,
        response: response
    };

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        console.log('Google Sheets Logging Result:', result);
    } catch (error) {
        console.error('Error logging to Google Sheets:', error);
        throw error;
    }
}
