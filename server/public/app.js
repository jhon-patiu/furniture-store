"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupApp();

    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getAddToCartButtons();
            ui.cartLogic();
        });
});

// cart
let cart = [];
// buttons
let buttonsArray = [];

// selectors
const cartIcon = document.getElementById("cartIcon");
const productsGrid = document.querySelector(".products-grid");
const productsRow = document.querySelector("#gridRow");
const gridItem = document.querySelectorAll(".grid-item");
const imageContainer = document.querySelectorAll(".img-container");
const addToCartButton = document.querySelectorAll(".btn-add");
const itemName = document.querySelectorAll(".item-name");
const itemSize = document.querySelectorAll(".item-size");
const itemPrice = document.querySelectorAll(".item-price");
const cartOverlay = document.querySelector(".cart-overlay");
const cartCloseButton = document.querySelector(".fa-window-close");
const cartTotal = document.querySelector(".cart-total");
const itemsQuantityBadge = document.getElementById("itemsQuantityBadge");
const cartContent = document.querySelector(".cart-content");
const removeItems = document.querySelectorAll(".cart-item__remove");
const clearCartButton = document.querySelector("#clearCartBtn");
const checkoutButton = document.getElementById("checkoutBtn");
// classes
class Products {
    async getProducts() {
        try {
            const contentful = await client.getEntries({
                content_type: "roomOnlineStoreProducts",
            });

            let products = contentful.items;
            products = products.map((item) => {
                const { id } = item.sys;
                const { title, price } = item.fields;
                const image = item.fields.image.fields.file.url;
                return { id, title, price, image };
            });
            return products;
        } catch (error) {
            console.log("ERROR:", error.error, "MESSAGE:", error.message);
        }
    }
}

class UI {
    displayProducts(products) {
        let result = "";
        products.forEach((product) => {
            result += `
        <!-- INDIVIDUAL ITEM -->
        <div class=" col-md-6 col-xl-4">
          <div class="grid-item">

            <div class="img-container d-flex flex-column">
              <img src=${product.image} alt="">
              <button class="btn btn-add" data-id=${product.id}>
                <i class="fas fa-cart-plus" id="cartPlusIcon"></i>
                ADD TO CART</button>
            </div>       

            <span class="item-desc">
              <h3 class="item-name">${product.title}</h3>
              
              <h5 class="item-price">$${product.price}</h5>
            </span>  

          </div>
        </div>`;
        });
        productsRow.innerHTML = result;
    }
    getAddToCartButtons() {
        const buttons = [...document.querySelectorAll(".btn-add")];
        buttonsArray = buttons;

        buttons.forEach((btn) => {
            let id = btn.dataset.id;

            let inCart = cart.find((item) => item.id === id);

            if (inCart) {
                btn.innerText = "IN CART";
                btn.disabled = true;
            }

            btn.addEventListener("click", (event) => {
                event.target.innerText = "IN CART";
                event.target.disabled = true;
                // get product from products(storage)
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                // add product to cart
                cart = [...cart, cartItem];
                // save cart to local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // dispay cart item
                this.addCartItem(cartItem);
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsQuantity = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsQuantity += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        itemsQuantityBadge.innerText = itemsQuantity;
    }

    addCartItem(item) {
        let div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
                <img src="${item.image}" alt="" class="cart-item__img" />
                <div class="cart-item__text">
                  <h5>${item.title}</h5>
                  <h6>$${item.price}</h6>
                  <p class="cart-item__remove" data-id=${item.id}>remove</p>
                </div>
                <div class="qty-display">
                  <i class="fas fa-chevron-up" data-id=${item.id}></i>
                  <p class="item-qty">${item.amount}</p>
                  <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div>
              `;
        cartContent.appendChild(div);
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach((item) => this.addCartItem(item));
    }
    cartLogic() {
        clearCartButton.addEventListener("click", () => {
            this.clearCart();
        });
        //  cart functionality
        cartContent.addEventListener("click", (event) => {
            if (event.target.classList.contains("cart-item__remove")) {
                let removeButton = event.target;
                let id = removeButton.dataset.id;
                cartContent.removeChild(
                    removeButton.parentElement.parentElement
                );
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let chevronUp = event.target;
                let id = chevronUp.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount++;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                chevronUp.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let chevronDown = event.target;
                let id = chevronDown.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount--;
                if (tempItem.amount >= 1) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    chevronDown.previousElementSibling.innerText =
                        tempItem.amount;
                } else {
                    cartContent.removeChild(
                        chevronDown.parentElement.parentElement
                    );
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach((id) => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.innerHTML = `
                <i class="fas fa-cart-plus" id="cartPlusIcon"></i>
                ADD TO CART`;
        button.disabled = false;
    }

    getSingleButton(id) {
        return buttonsArray.find((button) => button.dataset.id === id);
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}

// listeners
cartIcon.addEventListener("click", displayCart);
cartCloseButton.addEventListener("click", closeCart);
checkoutButton.addEventListener("click", () => {
    fetch("/create-checkout-session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items: [{ cart }],
        }),
    })
        .then((res) => {
            if (res.ok) return res.json();
            return res.json().then((json) => Promise.reject(json));
        })
        .then(({ url }) => {
            console.log(url, "works");
        });
});

// functions
function displayCart() {
    cartOverlay.classList.add("showCart");
}

function closeCart() {
    cartOverlay.classList.remove("showCart");
}

// function checkout() {
//     fetch("/create-checkout-session", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             items: [{ id: 1, quantity: 1 }],
//         }),
//     })
//         .then((res) => {
//             if (res.ok) return res.json();
//             return res.json().then((json) => Promise.reject(json));
//         })
//         .then(({ url }) => {
//             console.log(url, "works");
//         });
// }

// contentful
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: config.CONTENTFUL_SPACE,
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: config.CONTENTFUL_TOKEN,
});
