const BASE_URL = "http://digital-premium-store.vercel.app/api/admin";
const PUBLIC_URL = "http://digital-premium-store.vercel.app/api/products";

// ==========================================
// 1. ADMIN LOGIN SYSTEM
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorBox = document.getElementById('error-box');

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                // Session handle လုပ်ရန် token အစား အလွယ်မှတ်ထားခြင်း
                localStorage.setItem('isAdminIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                errorBox.textContent = data.message;
                errorBox.style.display = 'block';
            }
        } catch (error) {
            errorBox.textContent = "Cannot connect to security backend server.";
            errorBox.style.display = 'block';
        }
    });
}

// ==========================================
// 2. DASHBOARD CRUD MANAGEMENT SYSTEM
// ==========================================
if (window.location.pathname.includes('dashboard.html')) {
    // Security Guard: Login မဝင်ထားရင် နှင်ထုတ်မယ်
    if (localStorage.getItem('isAdminIn') !== 'true') {
        window.location.href = 'admin-login.html';
    }
    
    // Dashboard ရောက်တာနဲ့ Product တွေ ဇယားထဲ ဆွဲထည့်မယ်
    fetchAdminProducts();
    setupFormEvent();
}

// ဒေတာဘေ့စ်ထဲက ပစ္စည်းတွေ ဆွဲထုတ်ပြီး Table ထဲပြခြင်း
async function fetchAdminProducts() {
    const response = await fetch(PUBLIC_URL);
    const products = await response.json();
    const tbody = document.getElementById('admin-products-table');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image_url}" class="table-img"></td>
            <td><strong>${p.name}</strong></td>
            <td style="color:#00f2fe; font-weight:bold;">${p.price.toLocaleString()} Ks</td>
            <td><code>/${p.slug}</code></td>
            <td>
                <button class="btn-edit" onclick="startEdit(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Product အသစ်ထည့်ခြင်း နှင့် ပြင်ဆင်ခြင်း Event Listener
function setupFormEvent() {
    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('prod-name').value;
        const slug = document.getElementById('prod-slug').value;
        const price = document.getElementById('prod-price').value;
        const image_url = document.getElementById('prod-img').value;

        const productData = { name, slug, price, image_url };

        let url = `${BASE_URL}/products`;
        let method = 'POST'; // New အတွက် Default

        if (id) { // ID ရှိနေရင် Edit ဖြစ်သွားမယ်
            url = `${BASE_URL}/products/${id}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const resData = await response.json();

        if (resData.success) {
            alert(resData.message);
            form.reset();
            resetFormState();
            fetchAdminProducts(); // Table ကို Update ပြန်လုပ်ခြင်း
        }
    });
}

// Edit Mode သို့ ပြောင်းလဲခြင်း
function startEdit(product) {
    document.getElementById('form-title').textContent = `Edit Service: ${product.name}`;
    document.getElementById('product-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-slug').value = product.slug;
    document.getElementById('prod-slug').disabled = true; // Slug ပြင်ခွင့်မပြုပါ
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-img').value = product.image_url;
    
    document.getElementById('submit-btn').textContent = "Update Product";
    document.getElementById('cancel-btn').style.display = "inline-block";
}

// Cancel နှိပ်ရင် Form ကို နဂိုအတိုင်း ပြန်လုပ်ခြင်း
document.getElementById('cancel-btn')?.addEventListener('click', resetFormState);

function resetFormState() {
    document.getElementById('form-title').textContent = "Add New Premium Service";
    document.getElementById('product-id').value = '';
    document.getElementById('prod-slug').disabled = false;
    document.getElementById('submit-btn').textContent = "Save Product";
    document.getElementById('cancel-btn').style.display = "none";
    document.getElementById('product-form').reset();
}

// DELETE SYSTEM
async function deleteProduct(id) {
    if (confirm("Are you absolute sure to delete this premium service?")) {
        const response = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            fetchAdminProducts();
        }
    }
}

// LOGOUT SYSTEM
function logout() {
    localStorage.removeItem('isAdminIn');
    window.location.href = 'admin-login.html';
}
// Dashboard ရောက်ရင် လက်ရှိ Payment အကောင့်တွေကို Form ထဲ ကြိုဖြည့်ထားပေးရန်
if (window.location.pathname.includes('dashboard.html')) {
    loadCurrentPaymentSettings();
    setupPaymentFormEvent();
}

async function loadCurrentPaymentSettings() {
    const response = await fetch("http://digital-premium-store.vercel.app/api/payment-info");
    const data = await response.json();
    
    document.getElementById('kpay-num').value = data.kpay_num;
    document.getElementById('kpay-name').value = data.kpay_name;
    document.getElementById('wave-num').value = data.wave_num;
    document.getElementById('wave-name').value = data.wave_name;
    document.getElementById('bank-num').value = data.bank_num;
    document.getElementById('bank-name').value = data.bank_name;
}

function setupPaymentFormEvent() {
    const payForm = document.getElementById('payment-form');
    payForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payData = {
            kpay_num: document.getElementById('kpay-num').value,
            kpay_name: document.getElementById('kpay-name').value,
            wave_num: document.getElementById('wave-num').value,
            wave_name: document.getElementById('wave-name').value,
            bank_num: document.getElementById('bank-num').value,
            bank_name: document.getElementById('bank-name').value
        };

        const response = await fetch("http://digital-premium-store.vercel.app/api/admin/payment-info", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payData)
        });
        const res = await response.json();
        if (res.success) alert(res.message);
    });
}