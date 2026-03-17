const https = require('https');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const { question, options } = JSON.parse(event.body);
        const API_KEY = 'AIzaSyBGQF2bK6NWYX7wqkwxBaGFzEfu0RAx5j0';

        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Реши тест. Вопрос: "${question}". Варианты: ${options.map((opt, i) => i + ": " + opt).join(", ")}. Напиши ТОЛЬКО цифры правильных ответов через запятую.`
                }]
            }]
        });

        const aiResponse = await new Promise((resolve, reject) => {
            const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', (e) => reject(e));
            req.write(postData);
            req.end();
        });

        if (aiResponse.candidates && aiResponse.candidates[0].content.parts[0].text) {
            const aiText = aiResponse.candidates[0].content.parts[0].text;
            const correct_indices = aiText.match(/\d+/g).map(Number);
            return { statusCode: 200, headers, body: JSON.stringify({ correct_indices }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0] }) };

    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0], error: e.message }) };
    }
};
