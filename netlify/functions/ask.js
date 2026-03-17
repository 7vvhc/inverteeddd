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

        // Я сменил модель на gemini-1.5-pro, она мощнее и точно есть в базе
        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Ты — эксперт по тестам. Реши вопрос и напиши ТОЛЬКО индексы правильных ответов через запятую.
                    Вопрос: "${question}"
                    Варианты: ${options.map((opt, i) => i + ": " + opt).join(", ")}`
                }]
            }]
        });

        const aiResponse = await new Promise((resolve, reject) => {
            // Используем актуальную версию v1
            const req = https.request(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
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

        console.log("Gemini Response:", JSON.stringify(aiResponse));

        if (aiResponse.candidates && aiResponse.candidates[0].content.parts[0].text) {
            const aiText = aiResponse.candidates[0].content.parts[0].text;
            const correct_indices = aiText.match(/\d+/g).map(Number);
            return { statusCode: 200, headers, body: JSON.stringify({ correct_indices }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0], error: "No text from AI" }) };

    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0], error: e.message }) };
    }
};
