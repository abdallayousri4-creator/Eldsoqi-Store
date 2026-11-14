/* ==========================================================================
   Eldsoqi Store — Shopping cart
   Vanilla JS + LocalStorage
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.Eldsoqi.Data;
  var KEY = D.CONFIG.cartKey;
  var MAX_QTY = 99;
  var state = [];
  var listeners = [];

  /* ------------------------------ storage ------------------------------- */
  function isValidItem(item) {
    if (!item || typeof item !== "object") return false;
    var product = D.productById(item.productId);
    if (!product) return false;
    if (product.priceStatus === "pending") return false;
    var qty = parseInt(item.qty, 10);
    if (!qty || qty < 1) return false;
    if (item.variantId && !D.getVariant(product, item.variantId)) return false;
    if (product.variants.length && !item.variantId) item.variantId = product.variants[0].id;
    return true;
  }

  function load() {
    state = [];
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      parsed.forEach(function (item) {
        if (!isValidItem(item)) return;
        var qty = Math.min(MAX_QTY, Math.max(1, parseInt(item.qty, 10)));
        state.push({
          productId: item.productId,
          variantId: item.variantId || null,
          qty: qty
        });
      });
    } catch (error) {
      state = [];
    }
  }

  function save() {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      /* التخزين قد يكون معطلًا — السلة تظل تعمل في الجلسة الحالية */
    }
  }

  function notify(reason) {
    listeners.forEach(function (fn) {
      try { fn(reason); } catch (error) { /* تجاهل أخطاء المشتركين */ }
    });
    document.dispatchEvent(new CustomEvent("eldsoqi:cart-change", { detail: { reason: reason } }));
  }

  /* ------------------------------ operations ---------------------------- */
  function lineKey(productId, variantId) {
    return productId + "::" + (variantId || "");
  }

  function findIndex(productId, variantId) {
    var key = lineKey(productId, variantId);
    for (var i = 0; i < state.length; i++) {
      if (lineKey(state[i].productId, state[i].variantId) === key) return i;
    }
    return -1;
  }

  function add(productId, variantId, qty) {
    var product = D.productById(productId);
    if (!product) return { ok: false, message: "المنتج غير موجود." };
    if (product.priceStatus === "pending") {
      return { ok: false, message: "سعر هذا المنتج قيد التأكيد — يرجى التواصل عبر واتساب." };
    }
    var variant = D.getVariant(product, variantId);
    var quantity = Math.max(1, parseInt(qty, 10) || 1);
    var index = findIndex(productId, variant ? variant.id : null);

    if (index > -1) {
      var next = Math.min(MAX_QTY, state[index].qty + quantity);
      if (next === state[index].qty) {
        return { ok: false, message: "الحد الأقصى للكمية هو " + MAX_QTY + " قطعة." };
      }
      state[index].qty = next;
    } else {
      state.push({
        productId: productId,
        variantId: variant ? variant.id : null,
        qty: Math.min(MAX_QTY, quantity)
      });
    }
    save();
    notify("add");
    return { ok: true, message: "تمت إضافة المنتج إلى السلة." };
  }

  function setQty(key, qty) {
    for (var i = 0; i < state.length; i++) {
      if (lineKey(state[i].productId, state[i].variantId) === key) {
        var next = Math.min(MAX_QTY, Math.max(1, parseInt(qty, 10) || 1));
        if (next === state[i].qty) return;
        state[i].qty = next;
        save();
        notify("qty");
        return;
      }
    }
  }

  function increment(key) {
    for (var i = 0; i < state.length; i++) {
      if (lineKey(state[i].productId, state[i].variantId) === key) {
        if (state[i].qty >= MAX_QTY) return;
        state[i].qty += 1;
        save();
        notify("qty");
        return;
      }
    }
  }

  function decrement(key) {
    for (var i = 0; i < state.length; i++) {
      if (lineKey(state[i].productId, state[i].variantId) === key) {
        if (state[i].qty <= 1) return;
        state[i].qty -= 1;
        save();
        notify("qty");
        return;
      }
    }
  }

  function remove(key) {
    var next = state.filter(function (item) {
      return lineKey(item.productId, item.variantId) !== key;
    });
    if (next.length === state.length) return;
    state = next;
    save();
    notify("remove");
  }

  function clear() {
    state = [];
    save();
    notify("clear");
  }

  /* ------------------------------ selectors ----------------------------- */
  function items() {
    return state.map(function (item) {
      var product = D.productById(item.productId);
      if (!product) return null;
      var variant = D.getVariant(product, item.variantId);
      var unitPrice = D.priceOf(product, item.variantId);
      var label = variant && product.variants.length > 1 ? variant.label : "";
      return {
        key: lineKey(item.productId, item.variantId),
        productId: product.id,
        variantId: item.variantId,
        variantLabel: label,
        name: product.name,
        image: product.images[0],
        unit: product.unit || "",
        qty: item.qty,
        unitPrice: unitPrice,
        lineTotal: D.round2(unitPrice * item.qty)
      };
    }).filter(Boolean);
  }

  function totals() {
    var list = items();
    var count = 0;
    var subtotal = 0;
    list.forEach(function (line) {
      count += line.qty;
      subtotal = D.round2(subtotal + line.lineTotal);
    });
    return { count: count, subtotal: subtotal, lines: list };
  }

  function count() {
    var total = 0;
    state.forEach(function (item) { total += item.qty; });
    return total;
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  /* ------------------------------- render ------------------------------- */
  function el(id) { return document.getElementById(id); }

  function render() {
    var list = items();
    var totalsData = totals();
    var cartItems = el("cartItems");
    var cartEmpty = el("cartEmpty");
    var cartFooter = el("cartFooter");
    var cartCount = el("cartCount");
    var cartHeadCount = el("cartHeadCount");
    var cartSubtotal = el("cartSubtotal");
    var checkoutBtn = el("checkoutBtn");
    var checkoutUi = global.Eldsoqi.UI;

    if (cartCount) {
      cartCount.textContent = String(totalsData.count);
      cartCount.classList.toggle("is-empty", totalsData.count === 0);
    }
    if (cartHeadCount) {
      cartHeadCount.textContent = totalsData.count === 0
        ? "لا توجد منتجات"
        : totalsData.count + (totalsData.count === 1 ? " منتج" : " منتجات");
    }
    if (cartSubtotal) cartSubtotal.textContent = D.formatMoney(totalsData.subtotal);

    if (cartItems) {
      cartItems.innerHTML = list.map(function (line) {
        var safeName = D.escapeHtml(line.name);
        var safeVariant = line.variantLabel ? D.escapeHtml(line.variantLabel) : "";
        return (
          '<article class="cart-item" data-key="' + D.escapeHtml(line.key) + '">' +
            '<div class="cart-item-media">' +
              '<img src="' + D.escapeHtml(line.image) + '" alt="' + safeName + '" loading="lazy">' +
            "</div>" +
            '<div class="cart-item-info">' +
              '<p class="cart-item-title">' + safeName + "</p>" +
              (safeVariant ? '<p class="cart-item-variant">' + safeVariant + "</p>" : "") +
              '<p class="cart-item-price">' + D.formatMoney(line.unitPrice) + " × " + line.qty + "</p>" +
              '<div class="cart-item-controls">' +
                '<div class="qty-stepper">' +
                  '<button type="button" class="qty-btn" data-cart-action="dec" aria-label="تقليل كمية ' + safeName + '"' + (line.qty <= 1 ? " disabled" : "") + ">" +
                    (checkoutUi ? checkoutUi.icon("minus") : "−") +
                  "</button>" +
                  '<span class="qty-value" aria-live="polite">' + line.qty + "</span>" +
                  '<button type="button" class="qty-btn" data-cart-action="inc" aria-label="زيادة كمية ' + safeName + '"' + (line.qty >= MAX_QTY ? " disabled" : "") + ">" +
                    (checkoutUi ? checkoutUi.icon("plus") : "+") +
                  "</button>" +
                "</div>" +
                '<button type="button" class="cart-item-remove" data-cart-action="remove" aria-label="حذف ' + safeName + ' من السلة">' +
                  (checkoutUi ? checkoutUi.icon("trash") : "×") +
                "</button>" +
              "</div>" +
            "</div>" +
            '<div class="cart-item-total">' + D.formatPrice(line.lineTotal) + " <small>جنيه</small></div>" +
          "</article>"
        );
      }).join("");
    }

    if (cartEmpty) cartEmpty.hidden = list.length > 0;
    if (cartFooter) cartFooter.hidden = list.length === 0;
    if (cartItems) cartItems.hidden = list.length === 0;
    if (checkoutBtn) checkoutBtn.disabled = list.length === 0;

    if (global.Eldsoqi.UI && typeof global.Eldsoqi.UI.bindImageFallbacks === "function") {
      global.Eldsoqi.UI.bindImageFallbacks(cartItems);
    }
  }

  /* ------------------------------- events ------------------------------- */
  function bind() {
    var cartItems = el("cartItems");
    if (cartItems) {
      cartItems.addEventListener("click", function (event) {
        var button = event.target.closest("[data-cart-action]");
        if (!button) return;
        var row = button.closest("[data-key]");
        if (!row) return;
        var key = row.getAttribute("data-key");
        var action = button.getAttribute("data-cart-action");
        if (action === "inc") increment(key);
        if (action === "dec") decrement(key);
        if (action === "remove") remove(key);
      });
    }

    var emptyBtn = el("cartEmptyBtn");
    if (emptyBtn) {
      emptyBtn.addEventListener("click", function () {
        if (global.Eldsoqi.UI) global.Eldsoqi.UI.closeCart();
        if (global.Eldsoqi.UI) global.Eldsoqi.UI.scrollToSection("products");
      });
    }

    global.addEventListener("storage", function (event) {
      if (event.key !== KEY) return;
      load();
      render();
    });
  }

  function init() {
    load();
    bind();
    render();
    onChange(function () { render(); });
  }

  global.Eldsoqi.Cart = {
    init: init,
    add: add,
    setQty: setQty,
    increment: increment,
    decrement: decrement,
    remove: remove,
    clear: clear,
    items: items,
    totals: totals,
    count: count,
    render: render,
    onChange: onChange,
    MAX_QTY: MAX_QTY
  };
})(window);
