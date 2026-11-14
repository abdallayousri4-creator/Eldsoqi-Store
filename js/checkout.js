/* ==========================================================================
   Eldsoqi Store — Checkout & WhatsApp order
   No backend: the order is formatted locally and sent through WhatsApp.
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.Eldsoqi.Data;
  var C = D.CONFIG;
  var CUSTOMER_KEY = "eldsoqi_customer_v1";
  var lastOrder = null;

  var GOVERNORATES = [
    "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الشرقية", "الدقهلية",
    "البحيرة", "المنوفية", "الغربية", "كفر الشيخ", "دمياط", "بورسعيد",
    "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "الفيوم", "بني سويف",
    "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر",
    "الوادي الجديد", "مطروح"
  ];

  function el(id) { return document.getElementById(id); }
  function icon(name, extra) {
    return '<svg class="icon ' + (extra || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  /* ----------------------------- customer data -------------------------- */
  function readCustomer() {
    try {
      var raw = global.localStorage.getItem(CUSTOMER_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function saveCustomer(data) {
    try {
      global.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
    } catch (error) {
      /* تجاهل */
    }
  }

  /* ------------------------------- summary ------------------------------ */
  function summaryHtml(totals) {
    return totals.lines.map(function (line) {
      return (
        '<div class="summary-item">' +
          '<img src="' + D.escapeHtml(line.image) + '" alt="' + D.escapeHtml(line.name) + '" loading="lazy">' +
          "<div>" +
            '<div class="summary-item-title">' + D.escapeHtml(line.name) + "</div>" +
            (line.variantLabel ? '<div class="summary-item-meta">' + D.escapeHtml(line.variantLabel) + "</div>" : "") +
            '<div class="summary-item-meta">' + line.qty + " × " + D.formatMoney(line.unitPrice) + "</div>" +
          "</div>" +
          '<div class="summary-item-total">' + D.formatMoney(line.lineTotal) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  function formHtml(totals, customer) {
    var govOptions = GOVERNORATES.map(function (name) {
      return '<option value="' + name + '"' + (customer.governorate === name ? " selected" : "") + ">" + name + "</option>";
    }).join("");

    var waOptions = C.whatsapp.map(function (number, index) {
      return (
        '<label class="wa-option' + (index === 0 ? " is-selected" : "") + '">' +
          '<input type="radio" name="waNumber" value="' + number.number + '"' + (index === 0 ? " checked" : "") + ">" +
          icon("whatsapp", "icon-fill") +
          "<div><strong>" + number.label + "</strong><span dir=\"ltr\">" + number.display + "</span></div>" +
        "</label>"
      );
    }).join("");

    return (
      '<div class="checkout-layout">' +
        '<form class="checkout-form" id="checkoutForm" novalidate>' +
          '<h3 class="checkout-section-title">' + icon("package") + "بيانات العميل</h3>" +
          '<div class="form-grid">' +
            '<label class="field field--full">' +
              '<span class="field-label">الاسم بالكامل <span class="req">*</span></span>' +
              '<input type="text" name="fullName" id="coName" autocomplete="name" placeholder="مثال: محمد أحمد علي" value="' + D.escapeHtml(customer.fullName || "") + '">' +
              '<span class="field-error" data-error-for="fullName"></span>' +
            "</label>" +
            '<label class="field">' +
              '<span class="field-label">رقم الهاتف <span class="req">*</span></span>' +
              '<input type="tel" name="phone" id="coPhone" inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx" dir="ltr" value="' + D.escapeHtml(customer.phone || "") + '">' +
              '<span class="field-error" data-error-for="phone"></span>' +
            "</label>" +
            '<label class="field">' +
              '<span class="field-label">المحافظة <span class="req">*</span></span>' +
              '<select name="governorate" id="coGovernorate" class="select-native">' +
                '<option value="">اختر المحافظة</option>' + govOptions +
              "</select>" +
              '<span class="field-error" data-error-for="governorate"></span>' +
            "</label>" +
            '<label class="field field--full">' +
              '<span class="field-label">المدينة أو المنطقة <span class="req">*</span></span>' +
              '<input type="text" name="city" id="coCity" autocomplete="address-level2" placeholder="مثال: مدينة نصر" value="' + D.escapeHtml(customer.city || "") + '">' +
              '<span class="field-error" data-error-for="city"></span>' +
            "</label>" +
            '<label class="field field--full">' +
              '<span class="field-label">العنوان بالتفصيل <span class="req">*</span></span>' +
              '<textarea name="address" id="coAddress" rows="3" autocomplete="street-address" placeholder="اسم الشارع، رقم العقار، الدور، علامة مميزة…">' + D.escapeHtml(customer.address || "") + "</textarea>" +
              '<span class="field-error" data-error-for="address"></span>' +
            "</label>" +
            '<label class="field field--full">' +
              '<span class="field-label">ملاحظات إضافية (اختياري)</span>' +
              '<textarea name="notes" id="coNotes" rows="2" placeholder="أي تفاصيل تود إضافتها عن الطلب…">' + D.escapeHtml(customer.notes || "") + "</textarea>" +
              '<span class="field-error" data-error-for="notes"></span>' +
            "</label>" +
          "</div>" +

          '<h3 class="checkout-section-title">' + icon("whatsapp", "icon-fill") + "إرسال الطلب عبر واتساب</h3>" +
          '<div class="wa-choice" role="radiogroup" aria-label="اختر رقم واتساب">' + waOptions + "</div>" +

          '<div class="checkout-actions">' +
            '<button type="submit" class="btn btn-whatsapp btn-lg btn-block">' +
              icon("whatsapp", "icon-fill") + "إرسال الطلب عبر واتساب" +
            "</button>" +
            '<p class="checkout-disclaimer">' + icon("info") +
              "لن يتم حفظ بياناتك في قاعدة بيانات. يتم تجهيز الطلب كرسالة واتساب وإرسالها من هاتفك إلى رقم المتجر المختار." +
            "</p>" +
          "</div>" +
        "</form>" +

        '<aside class="checkout-summary" aria-label="ملخص الطلب">' +
          "<h3>ملخص الطلب</h3>" +
          '<div class="summary-items">' + summaryHtml(totals) + "</div>" +
          '<div class="summary-row"><span>الإجمالي الفرعي</span><strong>' + D.formatMoney(totals.subtotal) + "</strong></div>" +
          '<p class="summary-note">تُحدد مصاريف التوصيل عند تأكيد الطلب عبر واتساب، ولا تُضاف أي رسوم غير معلنة.</p>' +
          '<p class="summary-note">الأسعار بالجنيه المصري.</p>' +
        "</aside>" +
      "</div>"
    );
  }

  /* ------------------------------ validation ---------------------------- */
  function normalizePhone(value) {
    var phone = String(value || "").replace(/[\s\-()]/g, "");
    if (phone.indexOf("+20") === 0) phone = "0" + phone.slice(3);
    if (phone.indexOf("0020") === 0) phone = "0" + phone.slice(4);
    if (phone.indexOf("20") === 0 && phone.length === 12) phone = "0" + phone.slice(2);
    return phone;
  }

  function validate(form) {
    var errors = {};
    var fullName = form.fullName.value.trim();
    var phone = normalizePhone(form.phone.value);
    var governorate = form.governorate.value;
    var city = form.city.value.trim();
    var address = form.address.value.trim();

    if (fullName.length < 3) errors.fullName = "يرجى كتابة الاسم بالكامل.";
    if (!/^01[0125][0-9]{8}$/.test(phone)) errors.phone = "أدخل رقم هاتف مصري صحيح (مثال: 01012345678).";
    if (!governorate) errors.governorate = "اختر المحافظة.";
    if (city.length < 2) errors.city = "اكتب المدينة أو المنطقة.";
    if (address.length < 8) errors.address = "اكتب العنوان بالتفصيل (الشارع ورقم العقار).";

    return { errors: errors, phone: phone };
  }

  function setFieldError(form, name, message) {
    var input = form.elements[name];
    if (!input) return;
    var field = input.closest(".field");
    var errorBox = form.querySelector('[data-error-for="' + name + '"]');
    if (field) field.classList.toggle("has-error", Boolean(message));
    if (errorBox) errorBox.textContent = message || "";
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function clearErrors(form) {
    ["fullName", "phone", "governorate", "city", "address", "notes"].forEach(function (name) {
      setFieldError(form, name, "");
    });
  }

  /* ------------------------------ order text ---------------------------- */
  function buildOrderText(data, totals, numberLabel) {
    var now = new Date();
    var date = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear()
    ].join("/") + " - " + [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0")
    ].join(":");

    var lines = [];
    lines.push("🛒 *طلب جديد من Eldsoqi Store*");
    lines.push("");
    lines.push("👤 *الاسم:* " + data.fullName);
    lines.push("📱 *الهاتف:* " + data.phone);
    lines.push("📍 *المحافظة:* " + data.governorate);
    lines.push("🏙️ *المدينة/المنطقة:* " + data.city);
    lines.push("🏠 *العنوان:* " + data.address);
    if (data.notes) lines.push("📝 *ملاحظات:* " + data.notes);
    lines.push("");
    lines.push("🧾 *تفاصيل الطلب:*");

    totals.lines.forEach(function (line, index) {
      lines.push(
        (index + 1) + ". " + line.name +
        (line.variantLabel ? " — " + line.variantLabel : "") +
        " | " + line.qty + " × " + D.formatMoney(line.unitPrice) + " = " + D.formatMoney(line.lineTotal)
      );
    });

    lines.push("");
    lines.push("💰 *الإجمالي الفرعي:* " + D.formatMoney(totals.subtotal));
    lines.push("🚚 *مصاريف التوصيل:* تُحدد عند التأكيد");
    lines.push("📦 *عدد القطع:* " + totals.count);
    lines.push("");
    lines.push("🕒 " + date);
    lines.push("— تم إرسال الطلب من موقع Eldsoqi Store");
    lines.push("(رقم التواصل المختار: " + numberLabel + ")");

    return lines.join("\n");
  }

  /* ------------------------------- actions ------------------------------ */
  function open() {
    var totals = global.Eldsoqi.Cart.totals();
    if (!totals.lines.length) {
      if (global.Eldsoqi.UI) global.Eldsoqi.UI.toast("سلتك فارغة — أضف منتجًا أولًا.", "error");
      return;
    }

    var modal = el("checkoutModal");
    var content = el("checkoutContent");
    if (!modal || !content) return;

    content.innerHTML = formHtml(totals, readCustomer());
    if (global.Eldsoqi.UI) global.Eldsoqi.UI.openModal("checkoutModal");
    bindForm();
    if (global.Eldsoqi.UI) global.Eldsoqi.UI.bindImageFallbacks(content);

    var firstInput = el("coName");
    if (firstInput) {
      setTimeout(function () { firstInput.focus({ preventScroll: true }); }, 120);
    }
  }

  function bindForm() {
    var form = el("checkoutForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);

      var result = validate(form);
      var errorNames = Object.keys(result.errors);
      if (errorNames.length) {
        errorNames.forEach(function (name) { setFieldError(form, name, result.errors[name]); });
        var first = errorNames[0];
        var firstInput = form.elements[first];
        if (firstInput) {
          firstInput.focus({ preventScroll: false });
          firstInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (global.Eldsoqi.UI) global.Eldsoqi.UI.toast("يرجى مراجعة الحقول المطلوبة.", "error");
        return;
      }

      var checked = form.querySelector('input[name="waNumber"]:checked');
      var number = checked ? checked.value : C.whatsapp[0].number;
      var numberLabel = C.whatsapp[0].display;
      C.whatsapp.forEach(function (item) {
        if (item.number === number) numberLabel = item.label + " " + item.display;
      });

      var data = {
        fullName: form.fullName.value.trim(),
        phone: result.phone,
        governorate: form.governorate.value,
        city: form.city.value.trim(),
        address: form.address.value.trim(),
        notes: form.notes.value.trim()
      };
      saveCustomer(data);

      var totals = global.Eldsoqi.Cart.totals();
      var text = buildOrderText(data, totals, numberLabel);
      var url = D.whatsappLink(number, text);
      lastOrder = { url: url, text: text, numberLabel: numberLabel };

      var popup = null;
      try {
        popup = global.open(url, "_blank", "noopener");
      } catch (error) {
        popup = null;
      }

      showSuccess(url, text, Boolean(popup));
    });

    form.addEventListener("input", function (event) {
      var name = event.target.name;
      if (!name) return;
      var errorBox = form.querySelector('[data-error-for="' + name + '"]');
      if (errorBox && errorBox.textContent) setFieldError(form, name, "");
    });

    form.addEventListener("change", function (event) {
      if (event.target.name === "waNumber") {
        form.querySelectorAll(".wa-option").forEach(function (option) {
          var radio = option.querySelector("input");
          option.classList.toggle("is-selected", Boolean(radio && radio.checked));
        });
      }
      if (event.target.name === "governorate") setFieldError(form, "governorate", "");
    });
  }

  function showSuccess(url, text, popupOpened) {
    var content = el("checkoutContent");
    if (!content) return;

    content.innerHTML =
      '<div class="checkout-success">' +
        '<span class="success-icon">' + icon("check") + "</span>" +
        "<h3>تم تجهيز طلبك بنجاح</h3>" +
        "<p>" +
          (popupOpened
            ? "تم فتح واتساب في نافذة جديدة برسالة الطلب. أرسل الرسالة لتأكيد الطلب مع المتجر."
            : "تعذر فتح واتساب تلقائيًا. استخدم الزر أدناه لإرسال الطلب، أو انسخ نص الطلب وأرسله يدويًا.") +
        "</p>" +
        '<div class="success-actions">' +
          '<a class="btn btn-whatsapp" href="' + url + '" target="_blank" rel="noopener">' +
            icon("whatsapp", "icon-fill") + "فتح واتساب" +
          "</a>" +
          '<button type="button" class="btn btn-soft" data-copy-order>' + icon("copy") + "نسخ نص الطلب</button>" +
          '<button type="button" class="btn btn-outline" data-clear-order-cart>' + icon("trash") + "تفريغ السلة</button>" +
        "</div>" +
        '<p class="checkout-disclaimer" style="justify-content:center;margin-top:16px;">' +
          icon("info") + "لا يتم حفظ الطلب في قاعدة بيانات الموقع؛ تأكيد الطلب يتم من خلال محادثة واتساب." +
        "</p>" +
      "</div>";

    document.dispatchEvent(new CustomEvent("eldsoqi:order-prepared", { detail: { url: url } }));

    var copyBtn = content.querySelector("[data-copy-order]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        copyText(text, "تم نسخ نص الطلب.");
      });
    }

    var clearBtn = content.querySelector("[data-clear-order-cart]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        global.Eldsoqi.Cart.clear();
        if (global.Eldsoqi.UI) {
          global.Eldsoqi.UI.closeModal("checkoutModal");
          global.Eldsoqi.UI.toast("تم تفريغ السلة.");
        }
      });
    }
  }

  function copyText(text, successMessage) {
    function done() {
      if (global.Eldsoqi.UI) global.Eldsoqi.UI.toast(successMessage || "تم النسخ.");
    }
    if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
      global.navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      try {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.insetInlineStart = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        done();
      } catch (error) {
        if (global.Eldsoqi.UI) global.Eldsoqi.UI.toast("تعذر النسخ تلقائيًا.", "error");
      }
    }
  }

  function init() {
    var checkoutBtn = el("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (global.Eldsoqi.UI) global.Eldsoqi.UI.closeCart();
        open();
      });
    }

    document.addEventListener("click", function (event) {
      var copyBtn = event.target.closest("[data-copy]");
      if (copyBtn) {
        var value = copyBtn.getAttribute("data-copy");
        copyText(value, "تم نسخ الرقم: " + value);
      }
    });

    var quickForm = el("quickContactForm");
    if (quickForm) {
      quickForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var message = el("quickMessage").value.trim();
        var number = el("quickNumber").value;
        if (message.length < 3) {
          if (global.Eldsoqi.UI) global.Eldsoqi.UI.toast("اكتب استفسارك أولًا.", "error");
          if (el("quickMessage")) el("quickMessage").focus();
          return;
        }
        var fullMessage = message + "\n\n— من موقع Eldsoqi Store";
        global.open(D.whatsappLink(number, fullMessage), "_blank", "noopener");
        if (global.Eldsoqi.UI) global.Eldsoqi.UI.toast("تم فتح واتساب برسالتك.");
      });
    }
  }

  global.Eldsoqi.Checkout = {
    init: init,
    open: open,
    buildOrderText: buildOrderText,
    lastOrder: function () { return lastOrder; }
  };
})(window);
