exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const { question, options } = JSON.parse(event.body);
        
        // ВАЖНО: Сейчас это всё ещё "заглушка". 
        // Чтобы он РЕАЛЬНО решал, тут должен быть запрос к нейронке или поиск.
        // Пока сделаем так: если вопрос про массовую долю Хрома — даем индекс 0.
        let results = [0]; 

        // Логика для мульти-выбора (квадратиков)
        if (question.toLowerCase().includes("оберіть") || question.toLowerCase().includes("варіанти")) {
            results = [0, 1]; // Пример: подсветит две первые кнопки
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ correct_indices: results }) 
        };
    } catch (e) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
};
