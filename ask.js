exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body);
    console.log("Вопрос получен:", data.question);

    // Заглушка: всегда выбирает первый вариант (зеленый)
    // Позже сюда прикрутим логику поиска ответа
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ correct_index: 0 }) 
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
