from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Online database URL ကို ရယူခြင်း (မရှိရင် Local PostgreSQL သို့မဟုတ် SQLite သုံးရန် ပြင်ဆင်ထားမည်)
# တင်တဲ့အခါ Render ကနေ ဒီ URL ကို အလိုအလျောက် ထည့်ပေးပါလိမ့်မယ်
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/postgres')

def get_db_connection():
    # PostgreSQL နှင့် ချိတ်ဆက်ခြင်း
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            slug TEXT UNIQUE,
            name TEXT,
            price INTEGER,
            image_url TEXT
        )
    ''')
    
    # 2. Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            product_name TEXT,
            customer_name TEXT,
            payment_screenshot TEXT,
            status TEXT DEFAULT 'Pending'
        )
    ''')
    
    # 3. Admin Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_user (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password_hash TEXT
        )
    ''')

    # 4. Payment Settings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payment_settings (
            id INTEGER PRIMARY KEY,
            kpay_num TEXT,
            kpay_name TEXT,
            wave_num TEXT,
            wave_name TEXT,
            bank_num TEXT,
            bank_name TEXT
        )
    ''')
    
    # Default Admin ထည့်ခြင်း
    try:
        hashed_pw = generate_password_hash("admin@2026")
        cursor.execute("INSERT INTO admin_user (username, password_hash) VALUES (%s, %s) ON CONFLICT (username) DO NOTHING", ('admin', hashed_pw))
    except Exception:
        pass
        
    # Default Payment Info ထည့်ခြင်း
    cursor.execute('''
        INSERT INTO payment_settings (id, kpay_num, kpay_name, wave_num, wave_name, bank_num, bank_name)
        VALUES (1, '09 123 456 789', 'U Mg Mg', '09 123 456 789', 'U Mg Mg', '1234-5678-9012', 'X-Premium Co.')
        ON CONFLICT (id) DO NOTHING
    ''')

    # Default Products ထည့်ခြင်း
    default_products = [
        ('netflix', 'Netflix Premium 1-Month', 5000, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'),
        ('chatgpt', 'ChatGPT Plus (Pro)', 12000, 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'),
        ('gemini', 'Gemini Advanced Pro', 10000, 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Gemini_logo_to_be_used_in_conjunction_with_Google_products.svg'),
        ('spotify', 'Spotify Premium 1-Month', 4000, 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'),
        ('canva', 'Canva Pro LifeTime', 6000, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg')
    ]
    
    for slug, name, price, img in default_products:
        try:
            cursor.execute(
                "INSERT INTO products (slug, name, price, image_url) VALUES (%s, %s, %s, %s) ON CONFLICT (slug) DO NOTHING",
                (slug, name, price, img)
            )
        except Exception:
            pass

    conn.commit()
    cursor.close()
    conn.close()

# Database Initialise လုပ်ခြင်း
try:
    init_db()
except Exception as e:
    print("Database init format skipped for local, will run on production:", e)

@app.route('/')
def home():
    return "Premium Digital Store Backend is Running on Live Production!"

@app.route('/api/products', methods=['GET'])
def get_all_products():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM products')
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@app.route('/api/products/<slug>', methods=['GET'])
def get_single_product(slug):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM products WHERE slug = %s', (slug,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    if product is None:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product)

@app.route('/api/payment-info', methods=['GET'])
def get_payment_info():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM payment_settings WHERE id = 1')
    info = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(info)

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM admin_user WHERE username = %s', (username,))
    admin = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if admin and check_password_hash(admin['password_hash'], password):
        return jsonify({'success': True, 'message': 'Login Successful!'})
    else:
        return jsonify({'success': False, 'message': 'Invalid Username or Password!'}), 401

@app.route('/api/admin/products', methods=['POST'])
def add_product():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO products (slug, name, price, image_url) VALUES (%s, %s, %s, %s)',
            (data['slug'], data['name'], int(data['price']), data['image_url'])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Product added successfully!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/admin/products/<int:id>', methods=['PUT'])
def edit_product(id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE products SET name = %s, price = %s, image_url = %s WHERE id = %s',
        (data['name'], int(data['price']), data['image_url'], id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'success': True, 'message': 'Product updated successfully!'})

@app.route('/api/admin/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM products WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'success': True, 'message': 'Product deleted successfully!'})

@app.route('/api/admin/payment-info', methods=['PUT'])
def update_payment_info():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE payment_settings 
        SET kpay_num = %s, kpay_name = %s, wave_num = %s, wave_name = %s, bank_num = %s, bank_name = %s
        WHERE id = 1
    ''', (data['kpay_num'], data['kpay_name'], data['wave_num'], data['wave_name'], data['bank_num'], data['bank_name']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'success': True, 'message': 'Payment settings updated successfully!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)