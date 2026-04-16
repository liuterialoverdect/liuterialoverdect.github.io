const SUPABASE_URL = "https://gwnjdjvsjvvhsgrtitop.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ccmCgBXPoelvpNLmTErkUw_8taW9HCd";

const supabaseClient =
    window.supabase && typeof window.supabase.createClient === "function"
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

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

    navMenu.querySelectorAll("a").forEach((link) => {
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

    if (!elements.length) return;

    document.body.classList.add("js-ready");
    elements.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
    });

    if (!("IntersectionObserver" in window)) {
        elements.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px"
    });

    elements.forEach((el) => observer.observe(el));
}

function initScrollEffects() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    const updateTopbar = () => {
        if (window.scrollY > 14) {
            topbar.classList.add("is-scrolled");
        } else {
            topbar.classList.remove("is-scrolled");
        }
    };

    updateTopbar();
    window.addEventListener("scroll", updateTopbar, { passive: true });
}

function initCursorGlow() {
    if (window.innerWidth <= 980) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    window.addEventListener("mousemove", (event) => {
        document.body.classList.add("cursor-active");
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
    });

    window.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-active");
    });
}

function initHeroParallax() {
    const hero = document.querySelector(".hero-grid");
    if (!hero || window.innerWidth <= 980) return;

    const animated = hero.querySelectorAll(".hero-copy, .hero-card");

    hero.addEventListener("mousemove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        animated.forEach((element, index) => {
            const depth = index === 0 ? 10 : 16;
            element.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
        });
    });

    hero.addEventListener("mouseleave", () => {
        animated.forEach((element) => {
            element.style.transform = "translate3d(0, 0, 0)";
        });
    });
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

/* LOGIN / SIGNUP */
async function handleLoginPage() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const notice = document.getElementById("auth-notice");

    if (!loginForm || !signupForm) return;

    clearNotice(notice);

    if (!supabaseClient) {
        showNotice(notice, "Supabase non disponibile.", true);
        return;
    }

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

    if (!supabaseClient) {
        showNotice(notice, "Supabase non disponibile.", true);
        return;
    }

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

/* CONTATTI */
function handleContactForm() {
    const form = document.getElementById("contact-form");
    const notice = document.getElementById("contact-notice");

    if (!form || !notice) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearNotice(notice);

        if (!supabaseClient) {
            showNotice(notice, "Supabase non disponibile in questa pagina.", true);
            return;
        }

        const name = document.getElementById("contact-name")?.value.trim() || "";
        const email = document.getElementById("contact-email")?.value.trim() || "";
        const phone = document.getElementById("contact-phone")?.value.trim() || "";
        const message = document.getElementById("contact-message")?.value.trim() || "";

        if (!name || !email || !message) {
            showNotice(notice, "Compila nome, email e messaggio.", true);
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Invio in corso...";
        }

        const { error } = await supabaseClient
            .from("contact_requests")
            .insert([
                {
                    name,
                    email,
                    phone,
                    message
                }
            ]);

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Invia richiesta";
        }

        if (error) {
            showNotice(notice, "Invio non riuscito: " + error.message, true);
            return;
        }

        showNotice(notice, "Richiesta inviata correttamente.");
        form.reset();
    });
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initScrollEffects();
    initRevealAnimations();
    initCursorGlow();
    initHeroParallax();
    updateCartBadge();
    bindAddToCartButtons();
    renderCartPage();
    initAuthToggle();
    handleLoginPage();
    loadProfilePage();
    handleContactForm();
});