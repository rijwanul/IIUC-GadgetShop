let products = [];
let cart = [];

function formatPrice(num) {
  return "৳" + num.toFixed(2);
}

async function loadProducts() {
  try {
    const response = await fetch('https://jsonblob.com/api/1372562924698263552/');
    if (!response.ok) throw new Error('Failed to fetch products');
    products = await response.json();

    renderProducts();
    updateCartUI();
  } catch (error) {
    console.error(error);
    products = [];
    renderProducts();
    updateCartUI();
  }
}

function renderProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4"; // 3 products per row
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text fw-bold">${formatPrice(product.price)}</p>
          <button class="btn btn-primary mt-auto" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>
    `;
    productList.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function changeQuantity(productId, quantity) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity = quantity;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCartUI();
  }
}

function incrementQuantity(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity++;
    updateCartUI();
  }
}

function decrementQuantity(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity--;
    if (item.quantity <= 0) removeFromCart(productId);
    else updateCartUI();
  }
}

function toggleCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-btn");
  const clearCartBtn = document.getElementById("clear-cart");
  if (cart.length > 0) {
    checkoutBtn.style.display = "inline-block";
    clearCartBtn.style.display = "inline-block";
  } else {
    checkoutBtn.style.display = "none";
    clearCartBtn.style.display = "none";
  }
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="text-muted text-center my-3">Your cart is empty.</p>`;
    cartCount.textContent = 0;
    cartTotal.textContent = formatPrice(0);
    toggleCheckoutButton();
    return;
  }

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  cart.forEach(item => {
    const itemElem = document.createElement("div");
    itemElem.className = "d-flex justify-content-between align-items-center mb-3";

    itemElem.innerHTML = `
      <div style="min-width: 140px;">
        <h6 class="mb-1">${item.name}</h6>
        <small class="text-muted">${formatPrice(item.price)} each</small>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="decrementQuantity(${item.id})">−</button>
        <input 
          type="text" 
          value="${item.quantity}" 
          readonly
          style="width: 40px; text-align: center; border: none; background: transparent; font-weight: 600;"/>
        <button class="btn btn-outline-secondary btn-sm ms-2" onclick="incrementQuantity(${item.id})">+</button>
      </div>
      <div style="min-width: 70px;" class="text-end fw-bold">
        ${formatPrice(item.price * item.quantity)}
      </div>
      <div>
        <button class="btn btn-sm btn-outline-danger ms-3" onclick="removeFromCart(${item.id})">&times;</button>
      </div>
    `;

    cartItems.appendChild(itemElem);
  });

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(totalPrice);

  toggleCheckoutButton();
}

document.getElementById("clear-cart").addEventListener("click", () => {
  cart = [];
  updateCartUI();
});

// Checkout form submission with thank you message replacement
document.getElementById("checkout-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("customer-name").value.trim();
  const email = document.getElementById("customer-email").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();

  if (!name || !email || !phone || !address) {
    alert("Please fill all fields.");
    return;
  }

  const modalBody = document.getElementById("modal-body-content");
  const modalFooter = document.getElementById("modal-footer-buttons");

  modalBody.innerHTML = `
    <div class="text-center p-4">
      <h4>Thank you for shopping with us, ${name}!</h4>
      <p>Your order has been received and is being processed.</p>
    </div>
  `;
  modalFooter.style.display = "none";

  cart = [];
  updateCartUI();

  setTimeout(() => {
    const checkoutModalEl = document.getElementById('checkoutModal');
    const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl);
    checkoutModal.hide();

    modalBody.innerHTML = `
      <div class="mb-3">
        <label for="customer-name" class="form-label">Name</label>
        <input type="text" class="form-control" id="customer-name" required value="C231127 and C231128)" />
      </div>
      <div class="mb-3">
        <label for="customer-email" class="form-label">Email</label>
        <input type="email" class="form-control" id="customer-email" required value="hello@rijwanul.com" />
      </div>
      <div class="mb-3">
        <label for="customer-phone" class="form-label">Phone</label>
        <input type="tel" class="form-control" id="customer-phone" required value="01234567890" />
      </div>
      <div class="mb-3">
        <label for="customer-address" class="form-label">Address</label>
        <textarea class="form-control" id="customer-address" rows="3" required>IIUC Campus</textarea>
      </div>
    `;
    modalFooter.style.display = "flex";
  }, 3000);
});

// Load products on page load
loadProducts();
