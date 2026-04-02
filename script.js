const SUPABASE_URL = "https://gwnjdjvsjvvhsgrtitop.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ccmCgBXPoelvpNLmTErkUw_8taW9HCd";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* NAVBAR */
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

/* ANIMAZIONI */
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

/* CARRELLO */
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

/* NOTICE */
function showNotice(element, message, isError = false) {
    if (!element) return;

    element.textContent = message;
    element.style.display = "block";

    if (isError) {
        element.classList.add("error");
    } else {
        element.classList.remove("error");
    }
}

function clearNotice(element) {
    if (!element) return;

    element.textContent = "";
    element.style.display = "none";
    element.classList.remove("error");
}

/* TOGGLE LOGIN / REGISTRAZIONE */
function initAuthToggle() {
    const showLoginBtn = document.getElementById("showLoginBtn");
    const showSignupBtn = document.getElementById("showSignupBtn");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (!showLoginBtn || !showSignupBtn || !loginForm || !signupForm) return;

    showLoginBtn.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
    });

    showSignupBtn.addEventListener("click", () => {
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    });
}

/* LOGIN / SIGNUP CON SUPABASE */
async function handleLoginPage() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const notice = document.getElementById("auth-notice");

    if (!loginForm || !signupForm) return;

    clearNotice(notice);

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        window.location.href = "profilo.html";
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearNotice(notice);

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!email || !password) {
            showNotice(notice, "Compila email e password.", true);
            return;
        }

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showNotice(notice, error.message, true);
            return;
        }

        showNotice(notice, "Accesso eseguito correttamente.");
        setTimeout(() => {
            window.location.href = "profilo.html";
        }, 500);
    });

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearNotice(notice);

        const nome = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        if (!nome || !email || !password) {
            showNotice(notice, "Compila tutti i campi.", true);
            return;
        }

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome: nome
                }
            }
        });

        if (error) {
            showNotice(notice, error.message, true);
            return;
        }

        showNotice(
            notice,
            "Registrazione completata. Controlla la tua email se è richiesta la conferma."
        );
    });
}

/* PROFILO */
function firstLetter(value) {
    if (!value) return "?";
    return value.charAt(0).toUpperCase();
}

async function loadProfilePage() {
    const form = document.getElementById("profile-form");
    const notice = document.getElementById("profile-notice");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!form) return;

    clearNotice(notice);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        showNotice(notice, profileError.message, true);
        return;
    }

    const profileName = profile?.nome || user.user_metadata?.nome || "Utente";
    const profileEmail = profile?.email || user.email || "";

    const profileNameDisplay = document.getElementById("profile-name-display");
    const profileEmailDisplay = document.getElementById("profile-email-display");
    const profileAvatar = document.getElementById("profile-avatar");
    const profileGreeting = document.getElementById("profile-greeting");

    if (profileNameDisplay) profileNameDisplay.textContent = profileName;
    if (profileEmailDisplay) profileEmailDisplay.textContent = profileEmail;
    if (profileAvatar) profileAvatar.textContent = firstLetter(profileName);
    if (profileGreeting) profileGreeting.textContent = "Bentornato, " + profileName;

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");
    const avatarUrlInput = document.getElementById("profile-avatar-url");

    if (nameInput) nameInput.value = profile?.nome || "";
    if (emailInput) emailInput.value = profileEmail;
    if (phoneInput) phoneInput.value = profile?.telefono || "";
    if (avatarUrlInput) avatarUrlInput.value = profile?.avatar_url || "";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearNotice(notice);

        const updates = {
            nome: nameInput ? nameInput.value.trim() : "",
            telefono: phoneInput ? phoneInput.value.trim() : "",
            avatar_url: avatarUrlInput ? avatarUrlInput.value.trim() : "",
            updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabaseClient
            .from("profiles")
            .update(updates)
            .eq("id", user.id);

        if (updateError) {
            showNotice(notice, updateError.message, true);
            return;
        }

        if (profileNameDisplay) profileNameDisplay.textContent = updates.nome || "Utente";
        if (profileAvatar) profileAvatar.textContent = firstLetter(updates.nome);
        if (profileGreeting) profileGreeting.textContent = "Bentornato, " + (updates.nome || "Utente");

        showNotice(notice, "Profilo aggiornato correttamente.");
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            window.location.href = "login.html";
        });
    }
}

/* FORM CONTATTI */
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

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initRevealAnimations();
    updateCartBadge();
    bindAddToCartButtons();
    renderCartPage();
    initAuthToggle();
    handleLoginPage();
    loadProfilePage();
    handleContactForm();
});