const store = window.ReUseHubStore;
const currentUser = store.currentUser;
let listings = store.getListings();
let toastTimeout;

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const productGrid = document.getElementById("products-grid");
const emptyState = document.getElementById("items-empty");
const listingDialog = document.getElementById("listing-dialog");
const listingForm = document.getElementById("listing-form");
const listingError = document.getElementById("listing-error");
const toast = document.getElementById("toast");

function showToast(message, isError = false) {
    if (!toast) {
        return;
    }

    window.clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.toggle("toast-error", isError);
    toast.classList.add("visible");
    toastTimeout = window.setTimeout(() => {
        toast.classList.remove("visible");
    }, 3200);
}

function setCurrentDateAndGreeting() {
    const dateLabel = document.getElementById("today-label");
    const welcomeTitle = document.getElementById("welcome-title");
    if (!dateLabel || !welcomeTitle) {
        return;
    }

    const now = new Date();
    dateLabel.textContent = new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long"
    }).format(now).toLocaleUpperCase("vi-VN");

    const hour = now.getHours();
    const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
    welcomeTitle.textContent = `${greeting}, Linh!`;
}

function getStatusLabel(listing) {
    if (listing.status === "pending") {
        return { text: "Chờ kiểm duyệt", className: "status-pending" };
    }
    if (listing.status === "repair") {
        return { text: "Cần sửa chữa", className: "status-repair" };
    }
    if (listing.status === "donated") {
        return { text: "Đã trao tặng", className: "" };
    }
    return { text: "Đang chia sẻ", className: "" };
}

function renderListings() {
    if (!productGrid || !searchInput || !categoryFilter || !emptyState) {
        return;
    }

    const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
    const category = categoryFilter.value;
    const ownerListings = listings.filter((listing) => listing.ownerId === currentUser.id);
    const filteredListings = ownerListings.filter((listing) => {
        const matchesName = listing.name.toLocaleLowerCase("vi").includes(keyword);
        const matchesCategory = category === "all" || listing.category === category;
        return matchesName && matchesCategory;
    });

    productGrid.replaceChildren();
    filteredListings.forEach((listing) => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.dataset.category = listing.category;

        const image = document.createElement("div");
        image.className = "product-art";
        image.dataset.category = listing.category;
        image.setAttribute("aria-hidden", "true");
        image.textContent = listing.icon || "♻️";

        const info = document.createElement("div");
        info.className = "product-info";

        const meta = document.createElement("div");
        meta.className = "product-meta";

        const categoryTag = document.createElement("span");
        categoryTag.className = "category-tag";
        categoryTag.textContent = listing.category;

        const status = getStatusLabel(listing);
        const statusTag = document.createElement("span");
        statusTag.className = `status-tag ${status.className}`.trim();
        statusTag.textContent = status.text;
        meta.append(categoryTag, statusTag);

        const title = document.createElement("h3");
        title.textContent = listing.name;

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = listing.description || `${listing.condition} · ${listing.method}`;

        const footer = document.createElement("div");
        footer.className = "product-footer";
        const method = document.createElement("span");
        method.className = "product-method";
        method.textContent = listing.method;
        const age = document.createElement("span");
        age.textContent = listing.age || "Vừa đăng";
        footer.append(method, age);

        info.append(meta, title, description, footer);
        card.append(image, info);
        productGrid.append(card);
    });

    emptyState.hidden = filteredListings.length > 0;
    updateDashboardStats();
}

function updateDashboardStats() {
    const ownerListings = listings.filter((listing) => listing.ownerId === currentUser.id);
    const activeCount = ownerListings.filter((listing) => listing.status !== "donated").length;
    const donatedCount = ownerListings.filter((listing) => listing.status === "donated").length;
    const ownerListingIds = new Set(ownerListings.map((listing) => listing.id));
    const pendingRequests = store.getRequests().filter((request) =>
        ownerListingIds.has(request.listingId) && request.status === "pending"
    ).length;
    const activeCountElement = document.getElementById("active-count");
    const donatedCountElement = document.getElementById("donated-count");
    const requestCountElement = document.getElementById("request-count");
    const impactCountElement = document.getElementById("impact-count");

    if (activeCountElement) {
        activeCountElement.textContent = activeCount;
    }
    if (donatedCountElement) {
        donatedCountElement.textContent = donatedCount;
    }
    if (requestCountElement) {
        requestCountElement.textContent = pendingRequests;
    }
    if (impactCountElement) {
        impactCountElement.textContent = donatedCount;
    }
}

function openListingDialog() {
    if (!listingDialog) {
        return;
    }
    listingError.textContent = "";
    listingDialog.showModal();
    document.getElementById("productName")?.focus();
}

function closeListingDialog() {
    if (listingDialog?.open) {
        listingDialog.close();
    }
}

function getCategoryIcon(category) {
    const icons = {
        "Sách": "📚",
        "Điện tử": "🎧",
        "Đồ gia dụng": "💡",
        "Khác": "♻️"
    };
    return icons[category] || "♻️";
}

function handleListingSubmit(event) {
    event.preventDefault();
    listingError.textContent = "";

    const formData = new FormData(listingForm);
    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "");
    const condition = String(formData.get("condition") || "");
    const method = String(formData.get("method") || "");
    const description = String(formData.get("description") || "").trim();

    if (!name || !category || !condition || !method) {
        listingError.textContent = "Vui lòng điền đầy đủ các thông tin bắt buộc.";
        return;
    }

    listings.unshift({
        id: `item-${Date.now()}`,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        name,
        category,
        condition,
        method,
        description,
        status: "pending",
        age: "Vừa đăng",
        icon: getCategoryIcon(category),
        location: currentUser.campus
    });

    const saved = store.saveListings(listings);
    renderListings();
    listingForm.reset();
    closeListingDialog();
    showToast(saved
        ? "Đã đăng món đồ, tin đang chờ kiểm duyệt."
        : "Đã thêm món đồ trong phiên này nhưng chưa thể lưu vào trình duyệt.",
    !saved);
}

function setupMobileNavigation() {
    const menuToggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("primary-navigation");
    if (!menuToggle || !navigation) {
        return;
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu");
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            navigation.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Mở menu");
        }
    });
}

function setupDashboard() {
    setCurrentDateAndGreeting();
    renderListings();
    setupMobileNavigation();

    searchInput?.addEventListener("input", renderListings);
    categoryFilter?.addEventListener("change", renderListings);

    document.querySelectorAll("[data-open-listing]").forEach((button) => {
        button.addEventListener("click", openListingDialog);
    });

    document.querySelectorAll("[data-close-listing]").forEach((button) => {
        button.addEventListener("click", closeListingDialog);
    });

    listingForm?.addEventListener("submit", handleListingSubmit);

    listingDialog?.addEventListener("click", (event) => {
        if (event.target === listingDialog) {
            closeListingDialog();
        }
    });
}

function login(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail")?.value.trim();
    if (!email) {
        return;
    }
    window.alert(`Đăng nhập thành công!\n\nEmail: ${email}`);
    window.location.href = "index.html";
}

function register(event) {
    event.preventDefault();
    const password = document.getElementById("registerPassword")?.value || "";
    const confirm = document.getElementById("registerConfirm")?.value || "";

    if (password !== confirm) {
        window.alert("Mật khẩu xác nhận không trùng khớp!");
        return;
    }

    window.alert("Đăng ký tài khoản thành công!");
    window.location.href = "login.html";
}

function postProduct(event) {
    event.preventDefault();
    const name = document.getElementById("productName")?.value.trim();
    if (!name) {
        return;
    }
    window.alert(`Đăng sản phẩm thành công!\n\nSản phẩm: ${name}`);
    window.location.href = "products.html";
}

function contactSeller() {
    window.alert("Tính năng nhắn tin sẽ được phát triển ở phần Backend.");
}

window.login = login;
window.register = register;
window.postProduct = postProduct;
window.contactSeller = contactSeller;
setupDashboard();
