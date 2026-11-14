/* ==========================================================================
   Eldsoqi Store — App shell, UI helpers & interactions
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.Eldsoqi.Data;
  var UI = {};
  var lastFocused = null;
  var openModals = [];
  var toastTimer = null;
  var placeholder = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
    '<rect width="400" height="400" fill="#F3F7FF"/>' +
    '<g fill="none" stroke="#B9CCE6" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="120" y="130" width="160" height="140" rx="16"/>' +
    '<path d="M155 175h90M155 205h60"/>' +
    "</g>" +
    '<text x="200" y="320" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="18" fill="#7C8B9F">Eldsoqi Store</text>' +
    "</svg>"
  );

  function el(id) { return document.getElementById(id); }

  UI.icon = function (name, extra) {
    return '<svg class="icon ' + (extra || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  };

  UI.escapeHtml = D.escapeHtml;

  /* ---------------------------- image fallback -------------------------- */
  UI.bindImageFallbacks = function (scope) {
    if (!scope) return;
    Array.prototype.forEach.call(scope.querySelectorAll("img"), function (img) {
      img.addEventListener("error", function () {
        if (img.getAttribute("data-fallback") === "1") return;
        img.setAttribute("data-fallback", "1");
        img.src = placeholder;
        img.classList.add("img-fallback");
      });
    });
  };

  document.addEventListener("error", function (event) {
    var img = event.target;
    if (!img || img.tagName !== "IMG") return;
    if (img.getAttribute("data-fallback") === "1") return;
    img.setAttribute("data-fallback", "1");
    img.src = placeholder;
    img.classList.add("img-fallback");
  }, true);

  /* ------------------------------ formatting ---------------------------- */
  function badgeFor(product) {
    if (product.priceStatus === "pending") return { text: "قيد التأكيد", cls: "pending" };
    if (product.badges && product.badges.length) {
      var label = product.badges[0];
      var cls = "";
      if (label === "جديد") cls = "new";
      else if (label === "بكج كامل") cls = "offer";
      else if (label === "الأكثر مبيعًا") cls = "best";
      return { text: label, cls: cls };
    }
    return null;
  }

  function priceInner(price) {
    return D.formatPrice(price) + " <small>جنيه</small>";
  }

  function availabilityMarkup(product) {
    if (product.stock === "in") return '<span class="availability">متوفر</span>';
    if (product.stock === "out") return '<span class="availability availability--unknown">غير متوفر حاليًا</span>';
    return '<span class="availability availability--unknown">التوفر قيد التأكيد</span>';
  }

  function variantSelect(product) {
    if (!product.variants || product.variants.length < 2) return "";
    var options = product.variants.map(function (variant) {
      return '<option value="' + D.escapeHtml(variant.id) + '" data-price="' + variant.price + '">' +
        D.escapeHtml(variant.label) + " — " + D.formatMoney(variant.price) +
      "</option>";
    }).join("");
    return '<select class="product-variant" data-variant-select aria-label="اختر النوع أو المقاس">' + options + "</select>";
  }

  UI.productCard = function (product) {
    var category = D.categoryById(product.categoryId);
    var pending = product.priceStatus === "pending";
    var badge = badgeFor(product);
    var hasVariants = product.variants && product.variants.length > 1;
    var inquiryUrl = D.whatsappLink(D.waNumber(), D.productInquiryMessage(product));

    var priceMarkup = pending
      ? '<span class="price price--pending">السعر قيد التأكيد</span>'
      : '<span class="price" data-price>' + priceInner(product.price) + "</span>";

    var buyMarkup = pending
      ? '<a class="btn btn-inquiry" href="' + inquiryUrl + '" target="_blank" rel="noopener">' +
          UI.icon("whatsapp", "icon-fill") + "استفسار عن السعر" +
        "</a>"
      : '<div class="qty-stepper" aria-label="الكمية">' +
          '<button type="button" class="qty-btn" data-qty-action="dec" aria-label="تقليل الكمية" disabled>' + UI.icon("minus") + "</button>" +
          '<span class="qty-value" data-qty-value aria-live="polite">1</span>' +
          '<button type="button" class="qty-btn" data-qty-action="inc" aria-label="زيادة الكمية">' + UI.icon("plus") + "</button>" +
        "</div>" +
        '<button type="button" class="btn btn-primary btn-add" data-action="add" data-id="' + product.id + '">' +
          UI.icon("cart") + "أضف للسلة" +
        "</button>";

    return (
      '<article class="product-card" data-product-id="' + product.id + '">' +
        '<div class="product-media">' +
          (badge ? '<div class="product-badges"><span class="product-badge' + (badge.cls ? " product-badge--" + badge.cls : "") + '">' + D.escapeHtml(badge.text) + "</span></div>" : "") +
          '<button type="button" class="product-media-btn" data-action="details" data-id="' + product.id + '" aria-label="عرض تفاصيل ' + D.escapeHtml(product.name) + '">' +
            '<img src="' + D.escapeHtml(product.images[0]) + '" alt="' + D.escapeHtml(product.imageAlt || product.name) + '" loading="lazy" decoding="async">' +
          "</button>" +
        "</div>" +
        '<div class="product-body">' +
          '<span class="product-cat">' + D.escapeHtml(category ? category.name : "") + "</span>" +
          '<h3 class="product-title"><button type="button" data-action="details" data-id="' + product.id + '">' + D.escapeHtml(product.name) + "</button></h3>" +
          '<p class="product-desc">' + D.escapeHtml(product.desc) + "</p>" +
          '<div class="product-meta">' + availabilityMarkup(product) +
            (hasVariants ? '<span class="product-unit">اختر النوع</span>' : (product.unit ? '<span class="product-unit">' + D.escapeHtml(product.unit) + "</span>" : "")) +
          "</div>" +
          variantSelect(product) +
          '<div class="product-price-row" data-price-row>' +
            (product.priceStatus === "from" ? '<span class="price-from">يبدأ من</span>' : "") +
            priceMarkup +
          "</div>" +
          '<div class="product-buy">' + buyMarkup + "</div>" +
          '<button type="button" class="product-details-link" data-action="details" data-id="' + product.id + '">' +
            "عرض التفاصيل" + UI.icon("arrow-left") +
          "</button>" +
        "</div>" +
      "</article>"
    );
  };

  /* ------------------------------ quick view ---------------------------- */
  UI.openQuickView = function (productId, variantId) {
    var product = D.productById(productId);
    if (!product) return;

    var category = D.categoryById(product.categoryId);
    var pending = product.priceStatus === "pending";
    var hasVariants = product.variants && product.variants.length > 1;
    var selectedVariant = D.getVariant(product, variantId) || (product.variants.length ? product.variants[0] : null);
    var selectedId = selectedVariant ? selectedVariant.id : "";
    var price = pending ? null : D.priceOf(product, selectedId);
    var inquiryUrl = D.whatsappLink(D.waNumber(), D.productInquiryMessage(product));

    var thumbs = product.images.length > 1
      ? '<div class="qv-thumbs" role="group" aria-label="صور المنتج">' +
          product.images.map(function (src, index) {
            return '<button type="button" class="qv-thumb' + (index === 0 ? " is-active" : "") + '" data-qv-thumb="' + D.escapeHtml(src) + '" aria-label="صورة ' + (index + 1) + '">' +
              '<img src="' + D.escapeHtml(src) + '" alt="' + D.escapeHtml(product.name) + ' — صورة ' + (index + 1) + '" loading="lazy">' +
            "</button>";
          }).join("") +
        "</div>"
      : "";

    var variantsMarkup = hasVariants
      ? '<div class="qv-variants">' +
          '<span class="qv-variants-label">اختر النوع</span>' +
          '<div class="variant-options" data-qv-variants data-selected="' + D.escapeHtml(selectedId) + '">' +
            product.variants.map(function (variant) {
              return '<button type="button" class="variant-option' + (variant.id === selectedId ? " is-active" : "") + '" data-variant="' + D.escapeHtml(variant.id) + '" data-price="' + variant.price + '" aria-pressed="' + (variant.id === selectedId) + '">' +
                D.escapeHtml(variant.label) + "<small>" + D.formatMoney(variant.price) + "</small>" +
              "</button>";
            }).join("") +
          "</div>" +
        "</div>"
      : "";

    var specsMarkup = product.specs && product.specs.length
      ? '<div class="qv-specs"><h4>المواصفات</h4><dl>' +
          product.specs.map(function (spec) {
            return "<dt>" + D.escapeHtml(spec.label) + "</dt><dd>" + D.escapeHtml(spec.value) + "</dd>";
          }).join("") +
        "</dl></div>"
      : "";

    var priceBox = pending
      ? '<span class="price price--pending">السعر قيد التأكيد</span>' +
        '<span class="qv-price-note">تواصل معنا عبر واتساب لتأكيد نوع العنصر المتوفر وسعره.</span>'
      : '<span class="price" data-qv-price>' + priceInner(price) + "</span>" +
        (product.priceStatus === "from" ? '<span class="qv-price-note">' + D.escapeHtml(product.priceNote || "السعر يبدأ من القيمة المعروضة") + "</span>" : "") +
        (product.sourceNote ? '<span class="qv-price-note">' + D.escapeHtml(product.sourceNote) + "</span>" : "");

    var buyMarkup = pending
      ? '<a class="btn btn-inquiry" href="' + inquiryUrl + '" target="_blank" rel="noopener">' +
          UI.icon("whatsapp", "icon-fill") + "استفسار عبر واتساب" +
        "</a>"
      : '<div class="qty-stepper">' +
          '<button type="button" class="qty-btn" data-qv-qty="dec" aria-label="تقليل الكمية" disabled>' + UI.icon("minus") + "</button>" +
          '<span class="qty-value" data-qv-qty-value aria-live="polite">1</span>' +
          '<button type="button" class="qty-btn" data-qv-qty="inc" aria-label="زيادة الكمية">' + UI.icon("plus") + "</button>" +
        "</div>" +
        '<button type="button" class="btn btn-primary btn-add" data-qv-add data-id="' + product.id + '">' +
          UI.icon("cart") + "أضف للسلة" +
        "</button>";

    var html =
      '<div class="qv-layout">' +
        '<div class="qv-gallery">' +
          '<div class="qv-main"><img src="' + D.escapeHtml(product.images[0]) + '" alt="' + D.escapeHtml(product.imageAlt || product.name) + '" data-qv-main></div>' +
          thumbs +
        "</div>" +
        '<div class="qv-info">' +
          '<span class="qv-cat">' + D.escapeHtml(category ? category.name : "") + "</span>" +
          '<h2 class="qv-title" id="quickViewTitle">' + D.escapeHtml(product.name) + "</h2>" +
          '<p class="qv-desc">' + D.escapeHtml(product.desc) + "</p>" +
          '<span class="qv-stock' + (product.stock === "in" ? "" : " qv-stock--unknown") + '">' +
            (product.stock === "in" ? "متوفر في المتجر" : "التوفر والسعر قيد التأكيد") +
          "</span>" +
          '<div class="qv-price-box">' + priceBox + "</div>" +
          variantsMarkup +
          '<div class="qv-buy">' + buyMarkup + "</div>" +
          specsMarkup +
          '<a class="qv-inquiry-link" href="' + inquiryUrl + '" target="_blank" rel="noopener">' +
            UI.icon("whatsapp", "icon-fill") + "اسأل عن هذا المنتج عبر واتساب" +
          "</a>" +
        "</div>" +
      "</div>";

    var body = el("quickViewBody");
    if (!body) return;
    body.innerHTML = html;
    UI.bindImageFallbacks(body);
    UI.openModal("quickViewModal");
  };

  /* ------------------------------- toasts ------------------------------- */
  UI.toast = function (message, type) {
    var toast = el("toast");
    var text = el("toastText");
    if (!toast || !text) return;
    text.textContent = message;
    toast.classList.toggle("toast--error", type === "error");
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 3400);
  };

  /* ------------------------------- modals ------------------------------- */
  function syncOverlay() {
    var overlay = el("overlay");
    var anyModal = openModals.length > 0;
    var cartOpen = el("cartDrawer") && el("cartDrawer").classList.contains("is-open");
    var mobileOpen = el("mobileNav") && el("mobileNav").classList.contains("is-open");
    if (overlay) overlay.hidden = !(anyModal || cartOpen || mobileOpen);
    document.body.classList.toggle("is-locked", anyModal || cartOpen || mobileOpen);
  }

  function focusables(scope) {
    return Array.prototype.slice.call(scope.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (node) {
      return node.offsetParent !== null;
    });
  }

  UI.openModal = function (id) {
    var modal = el(id);
    if (!modal) return;
    lastFocused = document.activeElement;
    closeCart(false);
    closeMobile();
    openModals = [id];
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    syncOverlay();

    setTimeout(function () {
      var dialog = modal.querySelector(".modal-dialog");
      var closeBtn = modal.querySelector(".modal-close");
      var target = closeBtn || (dialog && focusables(dialog)[0]);
      if (target) target.focus({ preventScroll: true });
    }, 60);
  };

  UI.closeModal = function (id) {
    var modal = el(id);
    if (!modal || modal.hidden) return;
    if (id === "videoModal" && global.Eldsoqi.Videos) global.Eldsoqi.Videos.stop();
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    openModals = openModals.filter(function (item) { return item !== id; });
    syncOverlay();
    if (lastFocused && typeof lastFocused.focus === "function" && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  };

  UI.closeAllModals = function () {
    openModals.slice().forEach(function (id) { UI.closeModal(id); });
  };

  /* -------------------------------- cart -------------------------------- */
  function closeCart(restore) {
    var drawer = el("cartDrawer");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    syncOverlay();
    if (restore && lastFocused) lastFocused.focus({ preventScroll: true });
  }

  UI.closeCart = function () { closeCart(true); };

  UI.openCart = function () {
    var drawer = el("cartDrawer");
    if (!drawer) return;
    lastFocused = document.activeElement;
    closeMobile();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    syncOverlay();
    var closeBtn = el("cartClose");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  };

  /* ----------------------------- mobile menu ---------------------------- */
  UI.closeMobile = function () { closeMobile(); };
  function closeMobile() {
    var nav = el("mobileNav");
    if (!nav) return;
    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");
    var toggle = el("menuToggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    syncOverlay();
  }

  function openMobile() {
    var nav = el("mobileNav");
    if (!nav) return;
    nav.classList.add("is-open");
    nav.setAttribute("aria-hidden", "false");
    var toggle = el("menuToggle");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    closeCart(false);
    syncOverlay();
    var closeBtn = el("mobileClose");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  /* ----------------------------- search panel --------------------------- */
  function openSearchPanel() {
    var panel = el("searchPanel");
    var toggle = el("searchToggle");
    if (!panel) return;
    panel.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    closeMobile();
    var input = el("headerSearchInput");
    if (input) {
      input.value = "";
      var results = el("searchSuggestions");
      if (results) results.innerHTML = '<p class="search-empty">اكتب اسم منتج أو قسم للبحث، مثال: أفو، ليد، بريد بورد، Type-C.</p>';
      setTimeout(function () { input.focus(); }, 60);
    }
  }

  UI.closeSearchPanel = function () {
    var panel = el("searchPanel");
    var toggle = el("searchToggle");
    if (!panel) return;
    panel.hidden = true;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus({ preventScroll: true });
    }
  };

  function toggleSearchPanel() {
    var panel = el("searchPanel");
    if (!panel) return;
    if (panel.hidden) openSearchPanel();
    else UI.closeSearchPanel();
  }

  /* ------------------------------ navigation ---------------------------- */
  UI.scrollToSection = function (id) {
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + global.pageYOffset - 90;
    global.scrollTo({ top: top, behavior: "smooth" });
  };

  function markReveal() {
    document.querySelectorAll(
      ".section-head, .feature-card, .promo, .about-content, .about-side, .contact-card, .catalog-toolbar, .category-bar"
    ).forEach(function (node, index) {
      if (!node.classList.contains("reveal")) {
        node.classList.add("reveal");
        if (index % 3 === 1) node.classList.add("reveal-delay-1");
        if (index % 3 === 2) node.classList.add("reveal-delay-2");
      }
    });
  }

  function observeReveal() {
    var nodes = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in global)) {
      nodes.forEach(function (node) { node.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  /* -------------------------------- rails ------------------------------- */
  function pick(ids) {
    return ids.map(D.productById).filter(Boolean);
  }

  function renderRails() {
    var featured = pick(["avo-1", "avo-2", "soldering-kit", "power-supply", "breadboard", "type-c-charger", "mini-fan", "led"]);
    var best = pick(["avo-1", "transistor", "soldering-kit", "breadboard", "resistors", "led"]);
    var fresh = pick(["capacitors", "coils", "type-c-charger", "mini-fan", "battery", "flashlight"]);
    var offers = pick(["soldering-kit", "mini-fan", "breadboard", "led"]);

    var rails = [
      ["featuredGrid", featured],
      ["bestGrid", best],
      ["newGrid", fresh],
      ["offersGrid", offers]
    ];

    rails.forEach(function (pair) {
      var container = el(pair[0]);
      if (!container) return;
      container.innerHTML = pair[1].map(function (product) {
        return UI.productCard(product);
      }).join("");
      UI.bindImageFallbacks(container);
    });
  }

  function renderFooterCategories() {
    var list = el("footerCategories");
    if (!list) return;
    list.innerHTML = D.CATEGORIES.slice(0, 8).map(function (category) {
      return '<li><a href="#products" data-footer-category="' + category.id + '">' + D.escapeHtml(category.name) + "</a></li>";
    }).join("") + '<li><a href="#products" data-footer-category="all"><strong style="color:#8CC4FF;">كل الأقسام</strong></a></li>';
  }

  /* -------------------------------- render ------------------------------ */
  function updateCardPrice(card, price) {
    var priceNode = card.querySelector("[data-price]");
    if (priceNode) priceNode.innerHTML = priceInner(price);
  }

  /* -------------------------------- events ------------------------------ */
  function bindEvents() {
    /* السلة */
    var cartToggle = el("cartToggle");
    if (cartToggle) cartToggle.addEventListener("click", UI.openCart);
    var cartClose = el("cartClose");
    if (cartClose) cartClose.addEventListener("click", function () { closeCart(true); });
    var continueBtn = el("continueShopping");
    if (continueBtn) {
      continueBtn.addEventListener("click", function () {
        closeCart(true);
        UI.scrollToSection("products");
      });
    }

    /* القائمة */
    var menuToggle = el("menuToggle");
    if (menuToggle) menuToggle.addEventListener("click", openMobile);
    var mobileClose = el("mobileClose");
    if (mobileClose) mobileClose.addEventListener("click", closeMobile);

    /* البحث */
    var searchToggle = el("searchToggle");
    if (searchToggle) searchToggle.addEventListener("click", toggleSearchPanel);
    var searchClose = el("searchClose");
    if (searchClose) searchClose.addEventListener("click", UI.closeSearchPanel);

    /* الطبقة الخلفية */
    var overlay = el("overlay");
    if (overlay) {
      overlay.addEventListener("click", function () {
        if (openModals.length) UI.closeAllModals();
        else {
          closeCart(false);
          closeMobile();
        }
      });
    }

    /* إغلاق النوافذ */
    document.addEventListener("click", function (event) {
      var closeBtn = event.target.closest("[data-close-modal]");
      if (closeBtn) {
        var modal = closeBtn.closest(".modal");
        if (modal) UI.closeModal(modal.id);
        return;
      }

      /* النقر على الخلفية المعتمة خارج محتوى النافذة يغلقها */
      if (event.target.classList && event.target.classList.contains("modal") && !event.target.hidden) {
        UI.closeModal(event.target.id);
        return;
      }

      var promoProduct = event.target.closest("[data-open-product]");
      if (promoProduct) {
        event.preventDefault();
        UI.openQuickView(promoProduct.getAttribute("data-open-product"));
        return;
      }

      var footerCat = event.target.closest("[data-footer-category]");
      if (footerCat) {
        var categoryId = footerCat.getAttribute("data-footer-category");
        if (global.Eldsoqi.Search) {
          global.Eldsoqi.Search.setCategory(categoryId === "all" ? "all" : categoryId);
        }
        return;
      }

      var detailsBtn = event.target.closest('[data-action="details"]');
      if (detailsBtn) {
        UI.openQuickView(detailsBtn.getAttribute("data-id"));
        return;
      }

      var addBtn = event.target.closest('[data-action="add"]');
      if (addBtn) {
        var card = addBtn.closest("[data-product-id]");
        if (!card) return;
        var productId = addBtn.getAttribute("data-id");
        var qtyNode = card.querySelector("[data-qty-value]");
        var qty = qtyNode ? parseInt(qtyNode.textContent, 10) || 1 : 1;
        var select = card.querySelector("[data-variant-select]");
        var variantId = select ? select.value : null;
        var result = global.Eldsoqi.Cart.add(productId, variantId, qty);
        UI.toast(result.message, result.ok ? "success" : "error");
        if (result.ok) {
          var badge = el("cartCount");
          if (badge) {
            badge.classList.remove("is-bump");
            void badge.offsetWidth;
            badge.classList.add("is-bump");
          }
        }
        return;
      }

      var qtyBtn = event.target.closest("[data-qty-action]");
      if (qtyBtn) {
        var stepper = qtyBtn.closest(".qty-stepper");
        var valueNode = stepper ? stepper.querySelector("[data-qty-value]") : null;
        if (!stepper || !valueNode) return;
        var current = parseInt(valueNode.textContent, 10) || 1;
        var next = qtyBtn.getAttribute("data-qty-action") === "inc" ? current + 1 : current - 1;
        next = Math.min(99, Math.max(1, next));
        valueNode.textContent = String(next);
        var dec = stepper.querySelector('[data-qty-action="dec"]');
        var inc = stepper.querySelector('[data-qty-action="inc"]');
        if (dec) dec.disabled = next <= 1;
        if (inc) inc.disabled = next >= 99;
        return;
      }

      /* تغييرات سريعة داخل نافذة المنتج */
      var qvThumb = event.target.closest("[data-qv-thumb]");
      if (qvThumb) {
        var mainImage = document.querySelector("[data-qv-main]");
        if (mainImage) mainImage.src = qvThumb.getAttribute("data-qv-thumb");
        document.querySelectorAll("[data-qv-thumb]").forEach(function (thumb) {
          thumb.classList.toggle("is-active", thumb === qvThumb);
        });
        return;
      }

      var variantOption = event.target.closest("[data-variant]");
      if (variantOption) {
        var optionsWrap = variantOption.closest("[data-qv-variants]");
        if (!optionsWrap) return;
        var variantId2 = variantOption.getAttribute("data-variant");
        optionsWrap.setAttribute("data-selected", variantId2);
        optionsWrap.querySelectorAll("[data-variant]").forEach(function (option) {
          var active = option === variantOption;
          option.classList.toggle("is-active", active);
          option.setAttribute("aria-pressed", active ? "true" : "false");
        });
        var priceNode = document.querySelector("[data-qv-price]");
        if (priceNode) priceNode.innerHTML = priceInner(parseFloat(variantOption.getAttribute("data-price")));
        return;
      }

      var qvQtyBtn = event.target.closest("[data-qv-qty]");
      if (qvQtyBtn) {
        var qvValue = document.querySelector("[data-qv-qty-value]");
        if (!qvValue) return;
        var qvCurrent = parseInt(qvValue.textContent, 10) || 1;
        var qvNext = qvQtyBtn.getAttribute("data-qv-qty") === "inc" ? qvCurrent + 1 : qvCurrent - 1;
        qvNext = Math.min(99, Math.max(1, qvNext));
        qvValue.textContent = String(qvNext);
        var qvDec = document.querySelector('[data-qv-qty="dec"]');
        var qvInc = document.querySelector('[data-qv-qty="inc"]');
        if (qvDec) qvDec.disabled = qvNext <= 1;
        if (qvInc) qvInc.disabled = qvNext >= 99;
        return;
      }

      var qvAdd = event.target.closest("[data-qv-add]");
      if (qvAdd) {
        var qvVariants = document.querySelector("[data-qv-variants]");
        var selectedVariant = qvVariants ? qvVariants.getAttribute("data-selected") : null;
        var qvQtyNode = document.querySelector("[data-qv-qty-value]");
        var qvQty = qvQtyNode ? parseInt(qvQtyNode.textContent, 10) || 1 : 1;
        var qvResult = global.Eldsoqi.Cart.add(qvAdd.getAttribute("data-id"), selectedVariant, qvQty);
        UI.toast(qvResult.message, qvResult.ok ? "success" : "error");
        return;
      }

      /* إغلاق البحث عند النقر خارجه */
      var panel = el("searchPanel");
      if (panel && !panel.hidden && !event.target.closest("#searchPanel") && !event.target.closest("#searchToggle")) {
        panel.hidden = true;
        var st = el("searchToggle");
        if (st) st.setAttribute("aria-expanded", "false");
      }
    });

    /* تغيير النوع على البطاقة */
    document.addEventListener("change", function (event) {
      var select = event.target.closest("[data-variant-select]");
      if (!select) return;
      var card = select.closest("[data-product-id]");
      if (!card) return;
      var option = select.options[select.selectedIndex];
      var price = parseFloat(option.getAttribute("data-price"));
      if (!isNaN(price)) updateCardPrice(card, price);
    });

    /* لوحة المفاتيح */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (openModals.length) {
          UI.closeAllModals();
          return;
        }
        if (el("cartDrawer") && el("cartDrawer").classList.contains("is-open")) {
          closeCart(true);
          return;
        }
        if (el("mobileNav") && el("mobileNav").classList.contains("is-open")) {
          closeMobile();
          return;
        }
        var panel = el("searchPanel");
        if (panel && !panel.hidden) UI.closeSearchPanel();
        return;
      }

      if (event.key === "Tab" && openModals.length) {
        var modal = el(openModals[openModals.length - 1]);
        var dialog = modal ? modal.querySelector(".modal-dialog") : null;
        if (!dialog) return;
        var items = focusables(dialog);
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    /* إغلاق القوائم عند النقر على روابطها */
    document.addEventListener("click", function (event) {
      var link = event.target.closest(".mobile-nav a[href^='#'], .main-nav a[href^='#']");
      if (link) closeMobile();
    });

    /* ظل الهيدر */
    function onScroll() {
      var header = el("siteHeader");
      if (header) header.classList.toggle("is-scrolled", global.scrollY > 8);
    }
    global.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------ active nav ---------------------------- */
  function initActiveNav() {
    var sections = ["home", "products", "videos", "projects", "about", "contact"];
    var links = document.querySelectorAll(".main-nav .nav-link");
    if (!("IntersectionObserver" in global) || !links.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* --------------------------------- init ------------------------------- */
  function init() {
    global.Eldsoqi.UI = UI;

    global.Eldsoqi.Cart.init();
    global.Eldsoqi.Search.init();
    global.Eldsoqi.Checkout.init();
    global.Eldsoqi.Videos.init();

    renderRails();
    renderFooterCategories();

    var totalLabel = el("productsTotal");
    if (totalLabel) {
      totalLabel.textContent = D.CATEGORIES.length + " قسمًا • " + D.PRODUCTS.length + " منتجًا";
    }

    markReveal();
    observeReveal();
    bindEvents();
    initActiveNav();

    global.Eldsoqi.Cart.onChange(function (reason) {
      if (reason === "add" && el("quickViewModal") && !el("quickViewModal").hidden) {
        /* لا نغلق نافذة المنتج بعد الإضافة */
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
