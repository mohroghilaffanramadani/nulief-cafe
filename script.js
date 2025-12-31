let currentSection = "home";
let isManualScroll = false;

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initMenuTabs();
  initBackToTop();
  initSmoothScroll();
  initFormSubmission();
  initCartSystem();
  initActiveMenu();
  initPesanOnline();

  loadMenuItems("coffee");

  setInitialActiveMenu();

  document.querySelectorAll(".tab-btn")[0].classList.add("active");

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});
function setInitialActiveMenu() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === "#home") {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");

        const targetId = this.getAttribute("href").substring(1);
        updateActiveMenuImmediately(targetId);
      });
    });
  }
}
function initActiveMenu() {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const sectionId = targetId.substring(1);

      updateActiveMenuImmediately(sectionId);

      isManualScroll = true;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        isManualScroll = false;
      }, 1000);
    });
  });
}
function updateActiveMenuImmediately(sectionId) {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const originalTransition = link.style.transition;

    link.style.transition = "none";
    link.classList.remove("active");

    setTimeout(() => {
      link.style.transition = originalTransition;
    }, 10);
  });

  const targetLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
  if (targetLink) {
    const originalTransition = targetLink.style.transition;
    targetLink.style.transition = "none";
    targetLink.classList.add("active");

    setTimeout(() => {
      targetLink.style.transition = originalTransition;
    }, 10);
  }

  currentSection = sectionId;
}

function handleScroll() {
  if (!isManualScroll) {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    const scrollPosition = window.scrollY + 100;
    let currentActiveSection = "home";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentActiveSection = sectionId;
      }
    });

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${currentActiveSection}`) {
        if (!link.classList.contains("active")) {
          link.classList.add("active");
        }
      } else {
        link.classList.remove("active");
      }
    });

    currentSection = currentActiveSection;
  }
}
function initCartSystem() {
  let cart = JSON.parse(localStorage.getItem("nuliefCart")) || [];

  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCart = document.querySelector(".close-cart");
  const clearCartBtn = document.getElementById("clearCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function updateCartDisplay() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Keranjang belanja kosong</p>
                </div>
            `;
      cartTotal.textContent = "Rp 0";
    } else {
      let totalPrice = 0;

      cart.forEach((item, index) => {
        const priceNumber = parseInt(item.price.replace(/\./g, "")) || 0;
        const itemTotal = priceNumber * item.quantity;
        totalPrice += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Rp ${item.price}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus" data-index="${index}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
        cartItems.appendChild(cartItem);
      });

      cartTotal.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;

      setTimeout(() => {
        document.querySelectorAll(".quantity-btn.minus").forEach((btn) => {
          btn.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            updateQuantity(index, -1);
          });
        });

        document.querySelectorAll(".quantity-btn.plus").forEach((btn) => {
          btn.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            updateQuantity(index, 1);
          });
        });

        document.querySelectorAll(".remove-item").forEach((btn) => {
          btn.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            removeFromCart(index);
          });
        });
      }, 100);
    }

    localStorage.setItem("nuliefCart", JSON.stringify(cart));
  }

  window.addToCart = function (item) {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        ...item,
        quantity: 1,
      });
    }

    updateCartDisplay();
  };

  function updateQuantity(index, change) {
    if (cart[index]) {
      cart[index].quantity += change;

      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }

      updateCartDisplay();
    }
  }

  function removeFromCart(index) {
    if (cart[index]) {
      cart.splice(index, 1);
      updateCartDisplay();
    }
  }

  function clearCart() {
    if (cart.length > 0) {
      if (confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
        cart = [];
        updateCartDisplay();
      }
    }
  }

  function openCartModal() {
    cartModal.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCartModal() {
    cartModal.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  function checkout() {
    if (cart.length === 0) {
      alert(
        "Keranjang belanja masih kosong! Silakan tambahkan beberapa item terlebih dahulu."
      );
      return;
    }

    const orderNumber = "NUL-" + Date.now().toString().slice(-8);

    const subtotal = cart.reduce((sum, item) => {
      const priceNumber = parseInt(item.price.replace(/\./g, "")) || 0;
      return sum + priceNumber * item.quantity;
    }, 0);

    const tax = Math.round(subtotal * 0.11);
    const serviceCharge = Math.round(subtotal * 0.05);
    const total = subtotal + tax + serviceCharge;

    const checkoutModal = document.createElement("div");
    checkoutModal.className = "checkout-modal";
    checkoutModal.innerHTML = `
        <div class="checkout-modal-content">
            <div class="checkout-modal-header">
                <h3><i class=""></i> Checkout Pesanan</h3>
                <button class="close-checkout">&times;</button>
            </div>
            <div class="checkout-details">
                <div class="order-summary-title">
                    <h4>Ringkasan Pesanan</h4>
                    <div class="order-number-badge">
                        <i class="fas fa-hashtag"></i>${orderNumber}
                    </div>
                </div>
                
                <div class="order-items-container">
                    <div class="order-items" id="checkoutItems">
                        ${cart
                          .map((item, index) => {
                            const itemPrice =
                              parseInt(item.price.replace(/\./g, "")) || 0;
                            const itemTotal = itemPrice * item.quantity;
                            return `
                                <div class="order-item">
                                    <div class="order-item-info">
                                        <span class="order-item-name">${
                                          item.name
                                        }</span>
                                        <span class="order-item-desc">${
                                          item.description
                                        }</span>
                                    </div>
                                    <div class="order-item-right">
                                        <span class="order-item-quantity">${
                                          item.quantity
                                        }x</span>
                                        <span class="order-item-price">Rp ${itemTotal.toLocaleString(
                                          "id-ID"
                                        )}</span>
                                    </div>
                                </div>
                            `;
                          })
                          .join("")}
                    </div>
                </div>
                
                <div class="order-total-section">
                    <div class="order-total-row">
                        <span class="order-total-label">Subtotal</span>
                        <span class="order-total-value">Rp ${subtotal.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                    <div class="order-total-row">
                        <span class="order-total-label">PPN (11%)</span>
                        <span class="order-total-value">Rp ${tax.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                    <div class="order-total-row">
                        <span class="order-total-label">Service Charge (5%)</span>
                        <span class="order-total-value">Rp ${serviceCharge.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                    <div class="order-total-row">
                        <span class="order-total-label">Total Pembayaran</span>
                        <span class="order-total-value final-total">Rp ${total.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                </div>
                
                <div class="payment-section">
                    <h4><i class=""></i> Pilih Metode Pembayaran</h4>
                    
                    <div class="payment-methods">
                        <div class="payment-method" data-payment="cash">
                            <div class="payment-method-icon">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                            <div class="payment-method-name">Tunai</div>
                            <div class="payment-method-desc">Bayar di Kasir</div>
                        </div>
                        <div class="payment-method active" data-payment="qris">
                            <div class="payment-method-icon">
                                <i class="fas fa-qrcode"></i>
                            </div>
                            <div class="payment-method-name">QRIS</div>
                            <div class="payment-method-desc">Scan QR Code</div>
                        </div>
                        <div class="payment-method" data-payment="transfer">
                            <div class="payment-method-icon">
                                <i class="fas fa-university"></i>
                            </div>
                            <div class="payment-method-name">Transfer</div>
                            <div class="payment-method-desc">Bank Transfer</div>
                        </div>
                    </div>
                    
                    <!-- QRIS Payment -->
                    <div class="qris-payment active">
                        <h5>Scan QR Code untuk Pembayaran</h5>
                        <div class="qris-code">
                            <div class="qris-code-inner">
                                <i class="fas fa-qrcode"></i>
                                <span>QRIS Nulief Caffe</span>
                            </div>
                        </div>
                        <div class="qris-instructions">
                            <h5>Instruksi Pembayaran:</h5>
                            <ol>
                                <li>Buka aplikasi e-wallet atau mobile banking</li>
                                <li>Pilih menu "Scan QRIS" atau "QR Code"</li>
                                <li>Arahkan kamera ke QR code di atas</li>
                                <li>Pastikan nominal: <strong>Rp ${total.toLocaleString(
                                  "id-ID"
                                )}</strong></li>
                                <li>Konfirmasi pembayaran</li>
                            </ol>
                        </div>
                    </div>
                    
                    <!-- Transfer Instructions -->
                    <div class="transfer-instructions">
                        <h5>Transfer Bank</h5>
                        <div class="bank-details">
                            <div class="bank-detail">
                                <span class="bank-label">Nama Bank</span>
                                <span class="bank-value">Bank Nulief Indonesia</span>
                            </div>
                            <div class="bank-detail">
                                <span class="bank-label">Nomor Rekening</span>
                                <span class="bank-value copyable">123-456-7890</span>
                            </div>
                            <div class="bank-detail">
                                <span class="bank-label">Nama Penerima</span>
                                <span class="bank-value">PT NULIEF CAFFE</span>
                            </div>
                            <div class="bank-detail">
                                <span class="bank-label">Total Transfer</span>
                                <span class="bank-value">Rp ${total.toLocaleString(
                                  "id-ID"
                                )}</span>
                            </div>
                        </div>
                        <div class="qris-instructions">
                            <h5>Instruksi Transfer:</h5>
                            <ol>
                                <li>Transfer ke rekening di atas</li>
                                <li>Gunakan kode referensi: <strong>${orderNumber}</strong></li>
                                <li>Simpan bukti transfer</li>
                                <li>Pesanan akan diproses setelah transfer diterima</li>
                            </ol>
                        </div>
                    </div>
                    
                    <!-- Cash Instructions -->
                    <div class="payment-instructions">
                        <h5><i class="fas fa-info-circle"></i> Pembayaran Tunai</h5>
                        <ul>
                            <li>Pesanan akan diproses setelah Anda datang ke kafe</li>
                            <li>Silakan tunjukkan nomor pesanan: <strong>${orderNumber}</strong></li>
                            <li>Pesanan dapat diambil 15-30 menit setelah konfirmasi</li>
                            <li>Pesanan hangus jika tidak diambil dalam 1 jam</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="checkout-actions">
                <button class="btn-secondary" id="cancelCheckout">
                    <i class="fas fa-times"></i> Batal
                </button>
                <button class="btn-primary" id="confirmCheckout">
                    <i class="fas fa-check"></i> Konfirmasi & Bayar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);

    setTimeout(() => {
      checkoutModal.classList.add("active");
    }, 10);

    const paymentMethods = document.querySelectorAll(".payment-method");
    const qrisPayment = document.querySelector(".qris-payment");
    const transferPayment = document.querySelector(".transfer-instructions");
    let selectedPayment = "qris";

    paymentMethods.forEach((method) => {
      method.addEventListener("click", function () {
        paymentMethods.forEach((m) => m.classList.remove("active"));
        this.classList.add("active");

        selectedPayment = this.dataset.payment;

        if (selectedPayment === "qris") {
          qrisPayment.classList.add("active");
          transferPayment.classList.remove("active");
        } else if (selectedPayment === "transfer") {
          qrisPayment.classList.remove("active");
          transferPayment.classList.add("active");
        } else {
          qrisPayment.classList.remove("active");
          transferPayment.classList.remove("active");
        }
      });
    });

    const copyableElements = document.querySelectorAll(".bank-value.copyable");
    copyableElements.forEach((element) => {
      element.addEventListener("click", function () {
        const text = this.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = this.textContent;
          this.textContent = "Tersalin!";
          setTimeout(() => {
            this.textContent = originalText;
          }, 2000);
        });
      });
    });

    document
      .querySelector(".close-checkout")
      .addEventListener("click", function () {
        checkoutModal.classList.remove("active");
        setTimeout(() => {
          checkoutModal.remove();
        }, 300);
      });

    document
      .getElementById("cancelCheckout")
      .addEventListener("click", function () {
        checkoutModal.classList.remove("active");
        setTimeout(() => {
          checkoutModal.remove();
        }, 300);
      });

    document
      .getElementById("confirmCheckout")
      .addEventListener("click", function () {
        const confirmBtn = this;
        confirmBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        confirmBtn.disabled = true;

        setTimeout(() => {
          showSuccessModal(orderNumber, total, selectedPayment);
          checkoutModal.remove();
        }, 2000);
      });

    checkoutModal.addEventListener("click", function (e) {
      if (e.target === checkoutModal) {
        this.classList.remove("active");
        setTimeout(() => {
          this.remove();
        }, 300);
      }
    });
  }

  function showSuccessModal(orderNumber, total, paymentMethod) {
    const successModal = document.createElement("div");
    successModal.className = "checkout-modal";
    successModal.innerHTML = `
        <div class="checkout-modal-content">
            <div class="checkout-modal-header">
                <h3><i class="fas fa-check-circle"></i> Pembayaran Berhasil</h3>
                <button class="close-success">&times;</button>
            </div>
            <div class="success-modal">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Terima Kasih!</h3>
                <p class="success-message">
                    Pesanan Anda telah berhasil diproses. Silakan simpan informasi di bawah ini.
                </p>
                
                <div class="receipt">
                    <div class="receipt-item">
                        <span class="receipt-label">Nomor Pesanan</span>
                        <span class="receipt-value">${orderNumber}</span>
                    </div>
                    <div class="receipt-item">
                        <span class="receipt-label">Waktu Pesanan</span>
                        <span class="receipt-value">${new Date().toLocaleString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}</span>
                    </div>
                    <div class="receipt-item">
                        <span class="receipt-label">Metode Pembayaran</span>
                        <span class="receipt-value">
                            ${
                              paymentMethod === "cash"
                                ? "Tunai (Bayar di Kasir)"
                                : paymentMethod === "qris"
                                ? "QRIS"
                                : "Transfer Bank"
                            }
                        </span>
                    </div>
                    <div class="receipt-item">
                        <span class="receipt-label">Status</span>
                        <span class="receipt-value" style="color: #4CAF50;">DIPROSES</span>
                    </div>
                    <div class="receipt-item">
                        <span class="receipt-label">Total Pembayaran</span>
                        <span class="receipt-value receipt-total">Rp ${total.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                </div>
                
                <div class="store-info">
                    <h5>Informasi Pengambilan</h5>
                    <p><i class="fas fa-store"></i> <strong>Nulief Caffe</strong> - Jl. Kopi Premium No. 123, Jakarta</p>
                    <p><i class="fas fa-phone"></i> Customer Service: (021) 1234-5678</p>
                    <p><i class="fas fa-clock"></i> Estimasi Siap: <strong>15-30 menit</strong></p>
                    <p><i class="fas fa-exclamation-triangle"></i> <strong>PENTING:</strong> Tunjukkan nomor pesanan di kasir</p>
                </div>
                
                <button class="btn-primary" id="closeSuccess">
                    <i class="fas fa-check"></i> Selesai
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(successModal);

    setTimeout(() => {
      successModal.classList.add("active");
    }, 10);

    successModal
      .querySelector(".close-success")
      .addEventListener("click", function () {
        successModal.classList.remove("active");
        setTimeout(() => {
          successModal.remove();
          clearCartAfterCheckout();
          closeCartModal();
        }, 300);
      });

    successModal
      .querySelector("#closeSuccess")
      .addEventListener("click", function () {
        successModal.classList.remove("active");
        setTimeout(() => {
          successModal.remove();
          clearCartAfterCheckout();
          closeCartModal();
        }, 300);
      });

    successModal.addEventListener("click", function (e) {
      if (e.target === successModal) {
        this.classList.remove("active");
        setTimeout(() => {
          this.remove();
          clearCartAfterCheckout();
          closeCartModal();
        }, 300);
      }
    });
  }

  function clearCartAfterCheckout() {
    cart = [];
    updateCartDisplay();
  }

  function showNotification(message) {
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  cartIcon.addEventListener("click", openCartModal);

  if (closeCart) {
    closeCart.addEventListener("click", closeCartModal);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartModal);
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }

  updateCartDisplay();
}
function initMenuTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      tabBtns.forEach((b) => b.classList.remove("active"));

      this.classList.add("active");

      const category = this.getAttribute("data-category");
      loadMenuItems(category);
    });
  });
}
function loadMenuItems(category = "coffee") {
  const menuItemsContainer = document.querySelector(".menu-items");

  const menuData = {
    coffee: [
      {
        id: 1,
        name: "Americano Premium",
        price: "35.000",
        description:
          "Espresso dengan air panas berkualitas, rasa bold dan smooth",
        image:
          "https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 2,
        name: "Latte Art Special",
        price: "45.000",
        description: "Espresso dengan steamed milk dan latte art eksklusif",
        image:
          "https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 3,
        name: "Cappuccino Classic",
        price: "40.000",
        description: "Espresso dengan steamed milk dan busa susu tebal",
        image:
          "https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 4,
        name: "Cold Brew Deluxe",
        price: "42.000",
        description: "Kopi sedding dingin 12 jam dengan rasa yang smooth",
        image:
          "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
    ],
    "non-coffee": [
      {
        id: 5,
        name: "Matcha Latte",
        price: "38.000",
        description: "Matcha premium Jepang dengan steamed milk",
        image: "images/matcha-latte.jpg",
      },
      {
        id: 6,
        name: "Chocolate Velvet",
        price: "36.000",
        description: "Cokelat Belgia premium dengan susu steamed",
        image:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 7,
        name: "Berry Smoothie",
        price: "39.000",
        description: "Smoothie berry segar dengan yogurt",
        image:
          "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 8,
        name: "Lemon Mint Sparkle",
        price: "32.000",
        description: "Minuman segar lemon dengan daun mint",
        image:
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
    ],
    food: [
      {
        id: 9,
        name: "Beef Croissant",
        price: "65.000",
        description: "Croissant dengan daging sapi panggang dan saus spesial",
        image: "images/beef-croissant.jpg",
      },
      {
        id: 10,
        name: "Avocado Toast",
        price: "45.000",
        description: "Roti sourdough dengan alpukat dan telur poached",
        image:
          "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 11,
        name: "Truffle Pasta",
        price: "75.000",
        description: "Pasta dengan saus truffle dan jamur",
        image:
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 12,
        name: "Salmon Salad",
        price: "68.000",
        description: "Salmon panggang dengan salad segar",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
    ],
    dessert: [
      {
        id: 13,
        name: "Tiramisu Classic",
        price: "42.000",
        description: "Tiramisu klasik Italia dengan kopi espresso",
        image:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 14,
        name: "Chocolate Lava Cake",
        price: "45.000",
        description: "Kue cokelat dengan lelehan cokelat di dalamnya",
        image: "images/chocolate-lava-cake.jpg",
      },
      {
        id: 15,
        name: "Cheesecake Berry",
        price: "48.000",
        description: "Cheesecake dengan saus berry segar",
        image:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80",
      },
      {
        id: 16,
        name: "Macaron Box",
        price: "55.000",
        description: "Set macaron dengan 6 rasa berbeda",
        image: "images/macaron-box.jpg",
      },
    ],
  };

  const items = menuData[category] || menuData.coffee;

  if (menuItemsContainer) {
    menuItemsContainer.innerHTML = "";

    items.forEach((item) => {
      const menuItem = document.createElement("div");
      menuItem.className = "menu-item";
      menuItem.innerHTML = `
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3 class="menu-item-title">${item.name}</h3>
                        <span class="menu-item-price">Rp ${item.price}</span>
                    </div>
                    <p class="menu-item-desc">${item.description}</p>
                    <span class="menu-item-category">${
                      category === "coffee"
                        ? "Kopi"
                        : category === "non-coffee"
                        ? "Non-Kopi"
                        : category === "food"
                        ? "Makanan"
                        : "Dessert"
                    }</span>
                    <div class="menu-item-actions">
                        <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(
                          item
                        ).replace(/"/g, "&quot;")})">
                            <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            `;

      menuItemsContainer.appendChild(menuItem);
    });
  }
}
function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  if (backToTopBtn) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "#home") return;

      e.preventDefault();

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}
function initFormSubmission() {
  const bookingForm = document.getElementById("bookingForm");
  const newsletterForm = document.querySelector(".newsletter-form");

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      alert(
        "Terima kasih! Reservasi Anda telah berhasil dikirim. Kami akan menghubungi Anda untuk konfirmasi."
      );
      bookingForm.reset();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput.value) {
        alert("Terima kasih telah berlangganan newsletter Nulief Caffe!");
        emailInput.value = "";
      }
    });
  }
}
function initPesanOnline() {
  const pesanOnlineBtn = document.querySelector(".btn-order");

  if (pesanOnlineBtn) {
    pesanOnlineBtn.addEventListener("click", function () {
      const pesanModal = document.createElement("div");
      pesanModal.className = "pesan-modal";
      pesanModal.innerHTML = `
                <div class="pesan-modal-content">
                    <div class="pesan-modal-header">
                        <h3><i class="fas fa-mobile-alt"></i> Pesan Online</h3>
                        <button class="close-pesan">&times;</button>
                    </div>
                    <div class="pesan-details">
                        <h4>Pilih Metode Pesanan:</h4>
                        <div class="pesan-options">
                            <div class="pesan-option" data-type="pickup">
                                <i class="fas fa-store"></i>
                                <h5>Ambil di Tempat</h5>
                                <p>Pesan sekarang, ambil di kafe</p>
                            </div>
                            <div class="pesan-option" data-type="delivery">
                                <i class="fas fa-motorcycle"></i>
                                <h5>Antar ke Lokasi</h5>
                                <p>Pesan untuk diantar</p>
                            </div>
                        </div>
                        <div class="pesan-info">
                            <p><i class="fas fa-clock"></i> Pesanan diproses dalam 15-30 menit</p>
                            <p><i class="fas fa-phone"></i> Customer Service: (021) 1234-5678</p>
                        </div>
                    </div>
                    <div class="pesan-actions">
                        <button class="btn-secondary close-pesan">Batal</button>
                    </div>
                </div>
            `;

      document.body.appendChild(pesanModal);

      document.querySelectorAll(".close-pesan").forEach((btn) => {
        btn.addEventListener("click", function () {
          pesanModal.remove();
        });
      });

      document.querySelectorAll(".pesan-option").forEach((option) => {
        option.addEventListener("click", function () {
          const type = this.getAttribute("data-type");

          if (type === "pickup") {
            const menuSection = document.getElementById("menu");
            if (menuSection) {
              const headerHeight =
                document.querySelector(".header").offsetHeight;
              const targetPosition = menuSection.offsetTop - headerHeight;

              window.scrollTo({
                top: targetPosition,
                behavior: "smooth",
              });

              const navLinks = document.querySelectorAll(".nav-link");
              navLinks.forEach((l) => l.classList.remove("active"));
              document.querySelector('a[href="#menu"]').classList.add("active");
              currentSection = "menu";
            }
          } else if (type === "delivery") {
            alert(
              'Fitur pengantaran sedang dalam pengembangan. Untuk sementara, silakan pilih "Ambil di Tempat".'
            );
          }

          pesanModal.remove();
        });
      });

      pesanModal.addEventListener("click", function (e) {
        if (e.target === pesanModal) {
          pesanModal.remove();
        }
      });
    });
  }
}
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");

  if (header) {
    if (window.scrollY > 100) {
      header.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.1)";
      header.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
    } else {
      header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
      header.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    }
  }
});

const dateInput = document.getElementById("manual-date");
const timeInput = document.getElementById("manual-time");

dateInput.addEventListener("input", () => {
  let v = dateInput.value.replace(/\D/g, "").slice(0, 8);
  if (v.length >= 5) v = v.replace(/(\d{2})(\d{2})(\d+)/, "$1 / $2 / $3");
  else if (v.length >= 3) v = v.replace(/(\d{2})(\d+)/, "$1 / $2");
  dateInput.value = v;
});

timeInput.addEventListener("input", function () {
  let value = this.value.replace(/\D/g, "");

  if (value.length >= 3) {
    value = value.slice(0, 2) + " : " + value.slice(2, 4);
  }

  this.value = value;
});
