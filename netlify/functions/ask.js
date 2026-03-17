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

        const prompt = {
            contents: [{
                parts: [{
                    text: `Ты — эксперт по школьным тестам. Выбери правильные варианты ответа.
                    Вопрос: "${question}"
                    Варианты: ${options.map((opt, i) => i + ": " + opt).join(", ")}
                    Ответь ТОЛЬКО цифрами через запятую. Если правильных несколько — перечисли все.`
                }]
            }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            // Вытягиваем все числа из ответа
            const correct_indices = aiText.match(/\d+/g).map(Number);
            
            console.log("Вопрос:", question);
            console.log("Ответ ИИ:", aiText);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ correct_indices: correct_indices })
            };
        }
        
        throw new Error("Gemini empty response");

    } catch (e) {
        console.error("Ошибка функции:", e.message);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ correct_indices: [0], error: e.message })
        };
    }
};
