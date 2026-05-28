// Backend API URL
const API_URL = "http://127.0.0.1:5000/api/products";

// Home Page မှာ Product card များ လာပြပေးမည့် Function
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        
        const grid = document.getElementById('products-grid');
        grid.innerHTML = ''; // Loading စာသားကို ဖျက်ထုတ်ပစ်ရန်

        products.forEach(product => {
            // Product Card တစ်ခုချင်းစီကို ပုံဖော်ခြင်း
            const card = document.createElement('div');
            card.className = 'card';
            
            // မင်းပြောသလို Product တစ်ခုချင်းစီအတွက် Page အသစ်ဆီ သွားနိုင်အောင် click event ထည့်ထားမည်
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

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('products-grid').innerHTML = `<p class="loading" style="color:red;">Failed to connect with premium server.</p>`;
    }
}

// Page load ဖြစ်တာနဲ့ ချက်ချင်း ခေါ်ခိုင်းလိုက်ခြင်း
window.onload = fetchProducts;