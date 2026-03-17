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
        
        // ВАЖНО: Мы берем токен из настроек Netlify, которые ты уже ввел
        const HF_TOKEN = process.env.HF_TOKEN;

        const postData = JSON.stringify({
            inputs: `Реши тест. Напиши ТОЛЬКО цифры правильных ответов через запятую.
            Вопрос: "${question}"
            Варианты: ${options.map((opt, i) => i + ": " + opt).join(", ")}
            Ответ:`,
            parameters: { 
                max_new_tokens: 10, 
                return_full_text: false, 
                wait_for_model: true 
            }
        });

        const result = await new Promise((resolve, reject) => {
            const req = https.request('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_TOKEN}`
                }
            }, (res) => {
                let str = '';
                res.on('data', (chunk) => str += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(str));
                    } catch (e) {
                        reject(new Error("Ошибка JSON: " + str));
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.write(postData);
            req.end();
        });

        console.log("HF_LOG SUCCESS:", JSON.stringify(result));

        const responseText = Array.isArray(result) ? result[0].generated_text : (result.generated_text || "");
        const indices = responseText.match(/\d+/g)?.map(Number) || [];

        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ correct_indices: indices }) 
        };

    } catch (e) {
        console.error("LOG ERROR:", e.message);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ correct_indices: [], error: e.message }) 
        };
    }
};
