const fetch = require('node-fetch');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const { question, options } = JSON.parse(event.body);

        // Формируем запрос для ИИ
        const prompt = `Ты — помощник по тестам. Реши вопрос и выбери ПРАВИЛЬНЫЕ варианты ответа.
        Вопрос: "${question}"
        Варианты: ${options.map((opt, i) => i + ": " + opt).join(", ")}
        Ответь ТОЛЬКО номерами правильных вариантов через запятую (например: 0 или 0,2). Без лишних слов.`;

        // Запрос к бесплатному API (используем прокси для Gemini/GPT)
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY', // Если нет ключа, можно использовать открытые прокси
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
                messages: [{role: "user", content: prompt}]
            })
        });

        const data = await response.json();
        const aiResult = data.choices[0].message.content;
        
        // Превращаем текст "0, 1" в массив [0, 1]
        const correct_indices = aiResult.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ correct_indices: correct_indices.length > 0 ? correct_indices : [0] })
        };
    } catch (e) {
        // Если ИИ упал, возвращаем 0, чтобы хоть что-то подсветить
        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0] }) };
    }
};
