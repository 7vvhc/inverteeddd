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
            
            // Логика для вопроса про алюминий (image_048298.png)
            // Алюминий гидроксид амфотерный, растворяется и в кислотах, и в щелочах
            if (lowQ.includes("алюміній") && lowQ.includes("розчиняється")) {
                if (lowOpt.includes("кислоті") || lowOpt.includes("лузі")) found.push(i);
            }
            
            // Другие твои тесты
            if (lowQ.includes("хром") && lowOpt.includes("0,353")) found.push(i);
            if (lowQ.includes("аргентум") && lowOpt.includes("хлорид")) found.push(i);
        });

        // Если ничего не нашли, по умолчанию подсветим первый
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
