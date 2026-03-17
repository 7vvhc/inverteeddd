exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const { question, options } = JSON.parse(event.body);
        
        // Логика: если в вопросе "обери варіанти" или "квадратики" на фронте
        // Пока просто имитируем выбор правильных ответов
        // Например, для "Аргентум нітрат" правильный ответ — Хлорид-аніон (индекс 0)
        let correct_indexes = [0]; 

        // Если это мультивыбор, можно добавить еще индексы: [0, 2]
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                correct_indexes: correct_indexes 
            })
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
