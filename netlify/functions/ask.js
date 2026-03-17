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

        const result = await new Promise((resolve, reject) => {
            // Используем v1 и полное название модели gemini-1.5-flash
            const req = https.request(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                let str = '';
                res.on('data', (chunk) => str += chunk);
                res.on('end', () => resolve(JSON.parse(str)));
            });
            req.on('error', (e) => reject(e));
            req.write(postData);
            req.end();
        });

        console.log("Gemini Output:", JSON.stringify(result));

        if (result.candidates && result.candidates[0].content.parts[0].text) {
            const text = result.candidates[0].content.parts[0].text;
            const indices = text.match(/\d+/g).map(Number);
            return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: indices }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [], debug: result }) };
    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [], error: e.message }) };
    }
};
