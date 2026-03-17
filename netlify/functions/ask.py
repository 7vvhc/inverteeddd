
import json
from googlesearch import search

def handler(event, context):
    # Разрешаем запросы со всех сайтов (CORS)
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    }

    if event['httpMethod'] == 'OPTIONS':
        return {"statusCode": 200, "headers": headers}

    try:
        body = json.loads(event['body'])
        question = body.get('question', '')
        options = body.get('options', [])

        # Поиск через Google
        search_query = f"{question} на урок відповідь"
        search_results = list(search(search_query, num_results=5, lang="uk"))
        
        # Простейшая логика выбора (как была в твоем server.py)
        # Для начала вернем просто первый индекс, потом докрутим поиск совпадений
        correct_index = 0 
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"correct_index": correct_index})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        
