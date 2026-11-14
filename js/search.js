/* ==========================================================================
   Eldsoqi Store — Search, category filtering & sorting
   Arabic-aware live search (also matches English technical names)
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.Eldsoqi.Data;
  var state = {
    query: "",
    category: "all",
    sort: "default",
    availability: "all"
  };
  var bound = false;

  /* ------------------------------- helpers ------------------------------- */
  function el(id) { return document.getElementById(id); }

  function categoryCount(categoryId) {
    return D.PRODUCTS.filter(function (product) {
      return product.categoryId === categoryId;
    }).length;
  }

  function minPrice(product) {
    if (product.priceStatus === "pending" || product.price === null) return null;
    if (product.variants && product.variants.length) {
      return product.variants.reduce(function (min, variant) {
        return Math.min(min, variant.price);
      }, Infinity);
    }
    return product.price;
  }

  function matchesQuery(product, query) {
    if (!query) return true;
    var category = D.categoryById(product.categoryId);
    var haystack = D.normalizeArabic([
      product.name,
      product.nameEn || "",
      product.desc,
      product.keywords || "",
      category ? category.name : "",
      category ? category.nameEn : ""
    ].join(" "));
    var terms = D.normalizeArabic(query).split(" ").filter(Boolean);
    return terms.every(function (term) {
      return haystack.indexOf(term) > -1;
    });
  }

  function filteredProducts() {
    var list = D.PRODUCTS.filter(function (product) {
      if (state.category !== "all" && product.categoryId !== state.category) return false;
      if (state.availability === "in" && product.stock !== "in") return false;
      return matchesQuery(product, state.query);
    });

    list.sort(function (a, b) {
      if (state.sort === "price-asc" || state.sort === "price-desc") {
        var pa = minPrice(a);
        var pb = minPrice(b);
        if (pa === null && pb === null) return D.productIndex(a.id) - D.productIndex(b.id);
        if (pa === null) return 1;
        if (pb === null) return -1;
        if (pa !== pb) return state.sort === "price-asc" ? pa - pb : pb - pa;
      }
      var catDiff = D.categoryIndex(a.categoryId) - D.categoryIndex(b.categoryId);
      if (catDiff !== 0) return catDiff;
      return D.productIndex(a.id) - D.productIndex(b.id);
    });

    return list;
  }

  /* ------------------------------- rendering ----------------------------- */
  function renderChips() {
    var bar = el("categoryBar");
    if (!bar) return;
    var total = D.PRODUCTS.length;
    var html = '<button type="button" class="category-chip' + (state.category === "all" ? " is-active" : "") + '" data-category="all" role="tab" aria-selected="' + (state.category === "all") + '">' +
      "كل المنتجات <span class=\"chip-count\">" + total + "</span></button>";

    html += D.CATEGORIES.map(function (category) {
      var count = categoryCount(category.id);
      var active = state.category === category.id;
      return '<button type="button" class="category-chip' + (active ? " is-active" : "") + '" data-category="' + category.id + '" role="tab" aria-selected="' + active + '">' +
        D.escapeHtml(category.name) + ' <span class="chip-count">' + count + "</span></button>";
    }).join("");

    bar.innerHTML = html;
  }

  function renderGrid() {
    var grid = el("productsGrid");
    var empty = el("emptyState");
    var resultsCount = el("resultsCount");
    var activeFilters = el("activeFilters");
    var activeFilterText = el("activeFilterText");
    var total = D.PRODUCTS.length;
    if (!grid) return;

    var list = filteredProducts();
    grid.innerHTML = list.map(function (product) {
      return global.Eldsoqi.UI.productCard(product);
    }).join("");

    if (empty) empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;

    if (resultsCount) {
      if (list.length === total && !state.query && state.category === "all" && state.availability === "all") {
        resultsCount.textContent = "جميع المنتجات: " + total + " منتجًا";
      } else {
        resultsCount.textContent = "عرض " + list.length + " من " + total + " منتجًا";
      }
    }

    if (activeFilters) {
      var parts = [];
      if (state.query) parts.push('نتائج البحث عن: "' + state.query + '"');
      if (state.category !== "all") {
        var cat = D.categoryById(state.category);
        if (cat) parts.push("القسم: " + cat.name);
      }
      if (state.availability === "in") parts.push("المتوفر فقط");
      activeFilters.hidden = parts.length === 0;
      if (activeFilterText) activeFilterText.textContent = parts.join(" • ");
    }

    var clearBtn = el("clearSearch");
    if (clearBtn) clearBtn.hidden = state.query.length === 0;

    if (global.Eldsoqi.UI) global.Eldsoqi.UI.bindImageFallbacks(grid);
  }

  function render() {
    renderChips();
    renderGrid();
  }

  /* -------------------------------- events ------------------------------- */
  function bind() {
    if (bound) return;
    bound = true;

    var searchInput = el("productSearch");
    var sortSelect = el("sortSelect");
    var availability = el("availabilitySelect");
    var clearBtn = el("clearSearch");
    var resetBtn = el("resetFilters");
    var emptyReset = el("emptyReset");
    var bar = el("categoryBar");

    var timer = null;
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        var value = searchInput.value;
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.query = value.trim();
          renderGrid();
        }, 130);
      });
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          searchInput.value = "";
          state.query = "";
          renderGrid();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        state.query = "";
        renderGrid();
        if (searchInput) searchInput.focus();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        renderGrid();
      });
    }

    if (availability) {
      availability.addEventListener("change", function () {
        state.availability = availability.value;
        renderGrid();
      });
    }

    if (bar) {
      bar.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-category]");
        if (!chip) return;
        var category = chip.getAttribute("data-category");
        state.category = state.category === category && category !== "all" ? "all" : category;
        render();
      });
    }

    function resetAll() {
      state.query = "";
      state.category = "all";
      state.sort = "default";
      state.availability = "all";
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "default";
      if (availability) availability.value = "all";
      render();
    }

    if (resetBtn) resetBtn.addEventListener("click", resetAll);
    if (emptyReset) {
      emptyReset.addEventListener("click", function () {
        resetAll();
        if (searchInput) searchInput.focus();
      });
    }

    bindHeaderSearch();
  }

  /* ----------------------------- header search --------------------------- */
  function bindHeaderSearch() {
    var input = el("headerSearchInput");
    var results = el("searchSuggestions");
    if (!input || !results) return;

    function draw() {
      var query = input.value.trim();
      if (!query) {
        results.innerHTML = '<p class="search-empty">اكتب اسم منتج أو قسم للبحث، مثال: أفو، ليد، بريد بورد، Type-C.</p>';
        return;
      }
      var matches = D.PRODUCTS.filter(function (product) {
        return matchesQuery(product, query);
      }).slice(0, 6);

      if (!matches.length) {
        results.innerHTML = '<p class="search-empty">لا توجد نتائج مطابقة لـ "' + D.escapeHtml(query) + '".</p>';
        return;
      }

      results.innerHTML = matches.map(function (product) {
        var category = D.categoryById(product.categoryId);
        var priceLabel = product.priceStatus === "pending"
          ? "السعر قيد التأكيد"
          : (product.priceStatus === "from" ? "يبدأ من " + D.formatMoney(product.price) : D.formatMoney(product.price));
        return '<button type="button" class="search-suggestion" data-suggestion="' + product.id + '">' +
          '<img src="' + D.escapeHtml(product.images[0]) + '" alt="' + D.escapeHtml(product.name) + '" loading="lazy">' +
          "<span>" +
            '<span class="search-suggestion-title">' + D.escapeHtml(product.name) + "</span>" +
            '<span class="search-suggestion-meta">' + D.escapeHtml(category ? category.name : "") +
              " • " + priceLabel +
            "</span>" +
          "</span>" +
        "</button>";
      }).join("") +
      '<button type="button" class="search-suggestion" data-suggestion-all="1" style="grid-column:1/-1;justify-content:center;background:var(--blue-50);border-color:var(--blue-100);font-weight:700;color:var(--blue);">عرض كل النتائج (' + D.PRODUCTS.filter(function (p) { return matchesQuery(p, query); }).length + ")</button>";

      if (global.Eldsoqi.UI) global.Eldsoqi.UI.bindImageFallbacks(results);
    }

    var headerTimer = null;
    input.addEventListener("input", function () {
      clearTimeout(headerTimer);
      headerTimer = setTimeout(draw, 110);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        applyQuery(input.value, true);
        if (global.Eldsoqi.UI) {
          global.Eldsoqi.UI.closeSearchPanel();
          global.Eldsoqi.UI.scrollToSection("products");
        }
      }
    });

    results.addEventListener("click", function (event) {
      var all = event.target.closest("[data-suggestion-all]");
      if (all) {
        applyQuery(input.value, true);
        if (global.Eldsoqi.UI) {
          global.Eldsoqi.UI.closeSearchPanel();
          global.Eldsoqi.UI.scrollToSection("products");
        }
        return;
      }
      var item = event.target.closest("[data-suggestion]");
      if (!item) return;
      if (global.Eldsoqi.UI) {
        global.Eldsoqi.UI.closeSearchPanel();
        global.Eldsoqi.UI.openQuickView(item.getAttribute("data-suggestion"));
      }
    });
  }

  /* -------------------------------- public ------------------------------- */
  function applyQuery(query, syncInput) {
    state.query = (query || "").trim();
    var searchInput = el("productSearch");
    if (searchInput && syncInput !== false) searchInput.value = state.query;
    renderGrid();
  }

  function setCategory(categoryId, options) {
    var category = D.categoryById(categoryId);
    state.category = category ? categoryId : "all";
    render();
    if (options && options.scroll) {
      if (global.Eldsoqi.UI) global.Eldsoqi.UI.scrollToSection("products");
    }
  }

  function reset() {
    state = { query: "", category: "all", sort: "default", availability: "all" };
    var searchInput = el("productSearch");
    if (searchInput) searchInput.value = "";
    var sortSelect = el("sortSelect");
    if (sortSelect) sortSelect.value = "default";
    var availability = el("availabilitySelect");
    if (availability) availability.value = "all";
    render();
  }

  function init() {
    bind();
    render();
    applyQuery("", true);
  }

  global.Eldsoqi.Search = {
    init: init,
    render: render,
    applyQuery: applyQuery,
    setCategory: setCategory,
    reset: reset,
    filteredProducts: filteredProducts,
    state: state
  };
})(window);
