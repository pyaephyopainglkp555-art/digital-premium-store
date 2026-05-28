// Backend API URL - Products စာရင်း ထွက်လာမည့် လမ်းကြောင်းအပြည့်အစုံ
const API_URL = "https://digital-premium-store.vercel.app/api/products";

// Home Page မှာ Product card များ လာပြပေးမည့် Function
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        
        // Response က ပုံမှန်မဟုတ်ရင် Error ပြခိုင်းရန်
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        
        const grid = document.getElementById('products-grid');
        grid.innerHTML = ''; // Loading စာသားကို ဖျက်ထုတ်ပစ်ရန်

        // ရလာတဲ့ ဒေတာက Array ပုံစံ ဟုတ်မဟုတ် စစ်ဆေးခြင်း
        if (Array.isArray(products)) {
            products.forEach(product => {
                // Product Card တစ်ခုချင်းစီကို ပုံဖော်ခြင်း
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
        } else {
            throw new Error("Data is not an array");
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('products-grid').innerHTML = `<p class="loading" style="color:red;">Failed to connect with premium server.</p>`;
    }
}

// Page load ဖြစ်တာနဲ့ ချက်ချင်း ခေါ်ခိုင်းလိုက်ခြင်း
window.onload = fetchProducts;