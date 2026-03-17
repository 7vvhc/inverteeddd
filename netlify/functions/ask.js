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
        
        // Твой рабочий ключ Gemini
        const API_KEY = 'AIzaSyBGQF2bK6NWYX7wqkwxBaGFzEfu0RAx5j0';

        const prompt = {
            contents: [{
                parts: [{
                    text: `Ты — эксперт по школьным тестам (Химия, Укр.мова, История и др.). 
                    Реши вопрос и выбери ПРАВИЛЬНЫЕ варианты ответа.
                    Вопрос: "${question}"
                    Варианты: ${options.map((opt, i) => i + ": " + opt).join(", ")}
                    Ответь ТОЛЬКО номерами правильных вариантов через запятую (например: 0 или 0,2). Без лишних слов.`
                }]
            }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        // Извлекаем текст ответа от ИИ
        const aiText = data.candidates[0].content.parts[0].text;
        
        // Превращаем строку "0, 1" в массив чисел [0, 1]
        const correct_indices = aiText.match(/\d+/g).map(Number);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ correct_indices: correct_indices.length > 0 ? correct_indices : [0] })
        };
    } catch (e) {
        // Если что-то пошло не так, вернем первый вариант как запасной
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ correct_indices: [0], error: e.message })
        };
    }
};
