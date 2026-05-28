from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2

app = Flask(__name__)
CORS(app) # CORS Error မတက်အောင်

@app.route('/api/orders', methods=['POST'])
def add_order():
    try:
        data = request.json
        # Database ထည့်တဲ့နေရာ (မင်းရဲ့ Neon URL သုံးပါ)
        conn = psycopg2.connect(os.environ.get('NEON_DATABASE_URL'))
        cur = conn.cursor()
        cur.execute("INSERT INTO orders (product_name, customer_name, screenshot) VALUES (%s, %s, %s)", 
                    (data['product_name'], data['customer_name'], data['screenshot']))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run()