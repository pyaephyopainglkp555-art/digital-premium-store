// Backend API URL - /api ကို အတိအကျ ထည့်ပေးလိုက်ပါပြီ
const API_URL = "https://digital-premium-store.vercel.app/api";

// Home Page မှာ Product card များ လာပြပေးမည့် Function
async function fetchProducts() {
    try {
        // ဒီနေရာမှာ /products ကို အတိအကျ ခေါ်ပါမယ်
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const products = await response.json();
        const grid = document.getElementById('products-grid');
        grid.innerHTML = ''; 

        if (Array.isArray(products)) {
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => {
                    window.location.href = `product.html?slug=${product.slug}`;
                };
                card.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <div class="price">${product.price.toLocaleString()} Ks</div>
                    <button class="view-btn">Access Premium</button>
                `;
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('products-grid').innerHTML = `<p style="color:red;">Failed to connect with premium server.</p>`;
    }
}

window.onload = fetchProducts;