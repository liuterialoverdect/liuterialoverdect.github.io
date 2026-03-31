function initNavbar() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.classList.toggle("is-open");
        navMenu.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 980) {
                navToggle.classList.remove("is-open");
                navMenu.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) {
            navToggle.classList.remove("is-open");
            navMenu.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
        }
    });
}

function initRevealAnimations() {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        elements.forEach(el => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    elements.forEach(el => observer.observe(el));
}

function getCart() {
    const rawCart = localStorage.getItem("llv_cart");
    if (!rawCart) return [];
    try {
        return JSON.parse(rawCart);
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("llv_cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    let totalItems = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
    });

    document.querySelectorAll("[data-cart-count]").forEach(badge => {
        badge.textContent = totalItems;
    });
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart(cart);
    alert("Prodotto aggiunto al carrello.");
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage();
}

function changeQuantity(productId, delta) {
    const cart = getCart();

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            cart[i].quantity += delta;
            if (cart[i].quantity <= 0) {
                removeFromCart(productId);
                return;
            }
        }
    }

    saveCart(cart);
    renderCartPage();
}

function formatPrice(value) {
    return "€ " + value.toFixed(2).replace(".", ",");
}

function renderCartPage() {
    const cartContainer = document.getElementById("cart-items-list");
    const subtotalElement = document.getElementById("cart-subtotal");
    const shippingElement = document.getElementById("cart-shipping");
    const totalElement = document.getElementById("cart-total");

    if (!cartContainer) return;

    const cart = getCart();
    let html = "";
    let subtotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <h3>Il carrello è vuoto</h3>
                <p>Non hai ancora aggiunto strumenti o servizi. Esplora il sito e salva i prodotti che ti interessano.</p>
                <a class="btn mt-20" href="strumenti.html">Vai agli strumenti</a>
            </div>
        `;

        if (subtotalElement) subtotalElement.textContent = formatPrice(0);
        if (shippingElement) shippingElement.textContent = formatPrice(0);
        if (totalElement) totalElement.textContent = formatPrice(0);
        return;
    }

    cart.forEach(item => {
        const rowTotal = item.price * item.quantity;
        subtotal += rowTotal;

        html += `
            <div class="cart-item">
                <img class="cart-item-image" src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <button class="btn-ghost mt-12" onclick="removeFromCart('${item.id}')">Rimuovi</button>
                </div>
                <div>
                    <div class="cart-item-price">${formatPrice(rowTotal)}</div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = html;

    const shipping = subtotal >= 300 ? 0 : 18;
    const total = subtotal + shipping;

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (shippingElement) shippingElement.textContent = shipping === 0 ? "Gratuita" : formatPrice(shipping);
    if (totalElement) totalElement.textContent = formatPrice(total);
}

function bindAddToCartButtons() {
    document.querySelectorAll("[data-add-to-cart]").forEach(button => {
        button.addEventListener("click", function () {
            addToCart({
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                description: this.dataset.description
            });
        });
    });
}

function handleLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("login-name").value.trim();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
        const notice = document.getElementById("login-notice");

        if (!name || !email || !password) {
            notice.classList.add("error");
            notice.style.display = "block";
            notice.textContent = "Compila tutti i campi per continuare.";
            return;
        }

        localStorage.setItem("llv_user", JSON.stringify({
            name: name,
            email: email,
            role: "Cliente Liuteria Lo Verde"
        }));

        notice.classList.remove("error");
        notice.style.display = "block";
        notice.textContent = "Accesso demo completato.";

        setTimeout(() => {
            window.location.href = "profilo.html";
        }, 700);
    });
}

function loadProfilePage() {
    const nameElement = document.getElementById("profile-name");
    const emailElement = document.getElementById("profile-email");
    const avatarElement = document.getElementById("profile-avatar");
    const greetingElement = document.getElementById("profile-greeting");
    const cartInfoElement = document.getElementById("profile-cart-info");

    if (!nameElement || !emailElement || !avatarElement || !greetingElement || !cartInfoElement) return;

    const userRaw = localStorage.getItem("llv_user");

    if (!userRaw) {
        nameElement.textContent = "Ospite";
        emailElement.textContent = "Nessun account demo attivo";
        avatarElement.textContent = "O";
        greetingElement.textContent = "Benvenuto nell'area personale";
        cartInfoElement.textContent = "Accedi per visualizzare la tua area utente demo.";
        return;
    }

    try {
        const user = JSON.parse(userRaw);
        nameElement.textContent = user.name;
        emailElement.textContent = user.email;
        avatarElement.textContent = user.name.charAt(0).toUpperCase();
        greetingElement.textContent = "Bentornato, " + user.name;
        cartInfoElement.textContent = "Hai " + getCart().length + " prodotto/i nel carrello.";
    } catch (error) {
        console.error(error);
    }
}

function logoutUser() {
    localStorage.removeItem("llv_user");
    window.location.href = "login.html";
}

function handleContactForm() {
    const form = document.getElementById("contact-form");
    const notice = document.getElementById("contact-notice");

    if (!form || !notice) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        notice.classList.remove("error");
        notice.style.display = "block";
        notice.textContent = "Messaggio inviato correttamente. Questa è una demo frontend.";
        form.reset();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initRevealAnimations();
    updateCartBadge();
    bindAddToCartButtons();
    renderCartPage();
    handleLoginForm();
    loadProfilePage();
    handleContactForm();
});
