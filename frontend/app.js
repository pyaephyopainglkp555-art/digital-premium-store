// Backend API URL - Vercel URL ကို ဒီနေရာမှာ ထည့်ပါ
const API_URL = "https://digital-premium-store.vercel.app/api/products";

// ပစ္စည်းများကို ဆွဲယူပြီး ကတ်ပြားလေးတွေအဖြစ် ပြပေးမည့် Function
async function loadProducts() {
    try {
        // fetch ဆိုတာ Backend ဆီက ဒေတာတောင်းတဲ့ Command ပါ
        const response = await fetch(API_URL);
        const products = await response.json();
        
        const grid = document.getElementById('products-grid');
        grid.innerHTML = ''; // Loading စာသားဖျက်မယ်

        // ရလာတဲ့ ပစ္စည်းစာရင်းကို ကတ်လေးတွေအဖြစ် ပုံဖော်မယ်
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => window.location.href = `product.html?slug=${product.slug}`;
            
            card.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">${product.price.toLocaleString()} Ks</div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// စာမျက်နှာဖွင့်တာနဲ့ ဒီ function ကို အလုပ်လုပ်ခိုင်းမယ်
window.onload = loadProducts;