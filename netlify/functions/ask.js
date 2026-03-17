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
                    text: `Реши тест. Даны варианты ответа: ${options.map((opt, i) => i + ": " + opt).join(", ")}. 
                    Вопрос: "${question}". 
                    Напиши только номера правильных ответов через запятую. Если правильный один, напиши только одну цифру.`
                }]
            }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        // Логируем для отладки (увидишь в Netlify Logs)
        console.log("Gemini Raw Data:", JSON.stringify(data));

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            // Убираем всё, кроме цифр и запятых, потом превращаем в массив
            const cleanText = aiText.replace(/[^0-9,]/g, '');
            const correct_indices = cleanText.split(',').map(Number).filter(n => !isNaN(n));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ correct_indices: correct_indices.length > 0 ? correct_indices : [0] })
            };
        }
        
        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0], debug: "No text in response" }) };

    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ correct_indices: [0], error: e.message }) };
    }
};
