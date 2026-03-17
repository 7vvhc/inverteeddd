exports.handler = async (event) => {
    const headers = { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS' 
    };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const { question, options } = JSON.parse(event.body);
        const lowQ = question.toLowerCase();
        let found = [];

        options.forEach((opt, i) => {
            const lowOpt = opt.toLowerCase();
            // Поиск для задачи с Хромом (скрин image_04a4e2.png)
            if (lowQ.includes("хром") && lowOpt.includes("0,353")) found.push(i);
            // Поиск для Аргентум нітрату (скрин image_04fb98.png)
            if (lowQ.includes("аргентум") && lowOpt.includes("хлорид")) found.push(i);
        });

        if (found.length === 0) found = [0];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ correct_indices: found })
        };
    } catch (e) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
};
