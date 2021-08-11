"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getAddToCartButtons();
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

// classes
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image };
      });
      return products;
    } catch (error) {
      console.log("ERROR:", error);
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
    localStorage.setItem(cart, JSON.stringify(cart));
  }
}

// listeners
cartIcon.addEventListener("click", displayCart);
cartCloseButton.addEventListener("click", closeCart);

// functions
function displayCart() {
  cartOverlay.classList.add("showCart");
}

function closeCart() {
  cartOverlay.classList.remove("showCart");
}
