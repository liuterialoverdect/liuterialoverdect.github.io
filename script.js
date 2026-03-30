function getCart() {
    var rawCart = localStorage.getItem("llv_cart");

    if (rawCart) {
        try {
            return JSON.parse(rawCart);
        } catch (error) {
            return [];
        }
    }

    return [];
}

function saveCart(cart) {
    localStorage.setItem("llv_cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    var cart = getCart();
    var totalItems = 0;
    var badges = document.querySelectorAll("[data-cart-count]");

    for (var i = 0; i < cart.length; i++) {
        totalItems = totalItems + cart[i].quantity;
    }

    for (var j = 0; j < badges.length; j++) {
        badges[j].textContent = totalItems;
    }
}

function addToCart(product) {
    var cart = getCart();
    var found = false;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
            cart[i].quantity = cart[i].quantity + 1;
            found = true;
        }
    }

    if (!found) {
        product.quantity = 1;
        cart.push(product);
    }

    saveCart(cart);
    alert("Prodotto aggiunto al carrello.");
}

function removeFromCart(productId) {
    var cart = getCart();
    var newCart = [];
    var i = 0;

    while (i < cart.length) {
        if (cart[i].id !== productId) {
            newCart.push(cart[i]);
        }
        i = i + 1;
    }

    saveCart(newCart);
    renderCartPage();
}

function changeQuantity(productId, delta) {
    var cart = getCart();
    var i = 0;

    while (i < cart.length) {
        if (cart[i].id === productId) {
            cart[i].quantity = cart[i].quantity + delta;

            if (cart[i].quantity <= 0) {
                removeFromCart(productId);
                return;
            }
        }

        i = i + 1;
    }

    saveCart(cart);
    renderCartPage();
}

function formatPrice(value) {
    return "€ " + value.toFixed(2).replace(".", ",");
}

function renderCartPage() {
    var cartContainer = document.getElementById("cart-items-list");
    var subtotalElement = document.getElementById("cart-subtotal");
    var shippingElement = document.getElementById("cart-shipping");
    var totalElement = document.getElementById("cart-total");

    if (!cartContainer) {
        return;
    }

    var cart = getCart();
    var html = "";
    var subtotal = 0;

    if (cart.length === 0) {
        html = ''
            + '<div class="empty-state">'
            + '<h3 class="mt-0">Il carrello è vuoto</h3>'
            + '<p>Non hai ancora aggiunto strumenti o servizi. Esplora il sito e inizia a costruire la tua esperienza personalizzata con Liuteria Lo Verde.</p>'
            + '<a class="btn mt-20" href="index.html#strumenti-home">Scopri gli strumenti</a>'
            + '</div>';

        cartContainer.innerHTML = html;

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(0);
        }

        if (shippingElement) {
            shippingElement.textContent = formatPrice(0);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(0);
        }

        return;
    }

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var rowTotal = item.price * item.quantity;
        subtotal = subtotal + rowTotal;

        html = html
            + '<div class="cart-item">'
            + '   <img class="cart-item-image" src="' + item.image + '" alt="' + item.name + '">'
            + '   <div>'
            + '       <h3>' + item.name + '</h3>'
            + '       <p>' + item.description + '</p>'
            + '       <button class="btn-ghost mt-12" onclick="removeFromCart(\'' + item.id + '\')">Rimuovi</button>'
            + '   </div>'
            + '   <div>'
            + '       <div class="cart-item-price">' + formatPrice(rowTotal) + '</div>'
            + '       <div class="qty-controls">'
            + '           <button class="qty-btn" onclick="changeQuantity(\'' + item.id + '\', -1)">-</button>'
            + '           <span>' + item.quantity + '</span>'
            + '           <button class="qty-btn" onclick="changeQuantity(\'' + item.id + '\', 1)">+</button>'
            + '       </div>'
            + '   </div>'
            + '</div>';
    }

    cartContainer.innerHTML = html;

    var shipping = subtotal >= 300 ? 0 : 18;
    var total = subtotal + shipping;

    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }

    if (shippingElement) {
        shippingElement.textContent = shipping === 0 ? "Gratuita" : formatPrice(shipping);
    }

    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }
}

function handleLoginForm() {
    var form = document.getElementById("login-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = document.getElementById("login-name").value.trim();
        var email = document.getElementById("login-email").value.trim();
        var password = document.getElementById("login-password").value.trim();
        var notice = document.getElementById("login-notice");

        if (name === "" || email === "" || password === "") {
            notice.classList.add("error");
            notice.style.display = "block";
            notice.textContent = "Compila tutti i campi per continuare.";
            return;
        }

        var user = {
            name: name,
            email: email,
            joined: "Cliente Liuteria Lo Verde",
            savedItems: getCart().length
        };

        localStorage.setItem("llv_user", JSON.stringify(user));

        notice.classList.remove("error");
        notice.style.display = "block";
        notice.textContent = "Accesso demo completato. Ora puoi entrare nell'area personale.";

        setTimeout(function () {
            window.location.href = "profilo.html";
        }, 700);
    });
}

function loadProfilePage() {
    var nameElement = document.getElementById("profile-name");
    var emailElement = document.getElementById("profile-email");
    var avatarElement = document.getElementById("profile-avatar");
    var greetingElement = document.getElementById("profile-greeting");
    var cartInfoElement = document.getElementById("profile-cart-info");
    var userRaw = localStorage.getItem("llv_user");

    if (!nameElement || !emailElement || !avatarElement || !greetingElement || !cartInfoElement) {
        return;
    }

    if (!userRaw) {
        nameElement.textContent = "Ospite";
        emailElement.textContent = "Nessun account demo attivo";
        avatarElement.textContent = "O";
        greetingElement.textContent = "Benvenuto nell'area personale";
        cartInfoElement.textContent = "Accedi per personalizzare la tua esperienza e salvare preferenze.";
        return;
    }

    var user;

    try {
        user = JSON.parse(userRaw);
    } catch (error) {
        user = null;
    }

    if (!user) {
        return;
    }

    nameElement.textContent = user.name;
    emailElement.textContent = user.email;
    avatarElement.textContent = user.name.charAt(0).toUpperCase();
    greetingElement.textContent = "Bentornato, " + user.name;
    cartInfoElement.textContent = "Hai " + getCart().length + " prodotto/i nel carrello in questa sessione.";
}

function logoutUser() {
    localStorage.removeItem("llv_user");
    window.location.href = "login.html";
}

function bindAddToCartButtons() {
    var buttons = document.querySelectorAll("[data-add-to-cart]");
    var i = 0;

    while (i < buttons.length) {
        buttons[i].addEventListener("click", function () {
            var product = {
                id: this.getAttribute("data-id"),
                name: this.getAttribute("data-name"),
                price: Number(this.getAttribute("data-price")),
                image: this.getAttribute("data-image"),
                description: this.getAttribute("data-description")
            };

            addToCart(product);
        });

        i = i + 1;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartBadge();
    bindAddToCartButtons();
    handleLoginForm();
    loadProfilePage();
    renderCartPage();
});