const marketplaceStore = window.ReUseHubStore;
const toastElement = document.getElementById("toast");
let marketplaceToastTimeout;

function showMarketplaceToast(message, isError = false) {
    if (!toastElement) {
        return;
    }
    window.clearTimeout(marketplaceToastTimeout);
    toastElement.textContent = message;
    toastElement.classList.toggle("toast-error", isError);
    toastElement.classList.add("visible");
    marketplaceToastTimeout = window.setTimeout(() => {
        toastElement.classList.remove("visible");
    }, 3400);
}

function setupMarketplaceNavigation() {
    const toggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("primary-navigation");
    if (!toggle || !navigation) {
        return;
    }

    toggle.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu");
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            navigation.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Mở menu");
        }
    });
}

function normalizeSearchText(value) {
    return value.toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function makeProductCard(listing) {
    const card = document.createElement("article");
    card.className = "product-card marketplace-card";

    const artwork = document.createElement("a");
    artwork.className = "product-art marketplace-art";
    artwork.dataset.category = listing.category;
    artwork.href = `item-detail.html?id=${encodeURIComponent(listing.id)}`;
    artwork.setAttribute("aria-label", `Xem ${listing.name}`);
    if (listing.image) {
        artwork.classList.add("has-image");
        const image = document.createElement("img");
        image.src = listing.image;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
            artwork.classList.remove("has-image");
            image.remove();
            artwork.textContent = listing.icon || "♻️";
        }, { once: true });
        artwork.append(image);
    } else {
        artwork.textContent = listing.icon || "♻️";
    }

    const info = document.createElement("div");
    info.className = "product-info";

    const meta = document.createElement("div");
    meta.className = "product-meta";
    const category = document.createElement("span");
    category.className = "category-tag";
    category.textContent = listing.category;
    const condition = document.createElement("span");
    condition.className = "status-tag";
    condition.textContent = listing.condition;
    meta.append(category, condition);

    const title = document.createElement("h2");
    title.className = "marketplace-card-title";
    const titleLink = document.createElement("a");
    titleLink.href = `item-detail.html?id=${encodeURIComponent(listing.id)}`;
    titleLink.textContent = listing.name;
    title.append(titleLink);

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = listing.description || `${listing.condition} · ${listing.method}`;

    const owner = document.createElement("p");
    owner.className = "owner-line";
    owner.textContent = `${listing.ownerName} · ${listing.location}`;

    const footer = document.createElement("div");
    footer.className = "product-footer";
    const method = document.createElement("span");
    method.className = "product-method";
    method.textContent = listing.method;
    const age = document.createElement("span");
    age.textContent = listing.age || "Vừa đăng";
    footer.append(method, age);

    const action = document.createElement("a");
    action.className = "button button-secondary card-action";
    action.href = `item-detail.html?id=${encodeURIComponent(listing.id)}`;
    action.textContent = listing.method === "Cần sửa chữa" ? "Xem thông tin sửa chữa" : "Xem chi tiết";

    info.append(meta, title, description, owner, footer, action);
    card.append(artwork, info);
    return card;
}

function setupBrowsePage() {
    const search = document.getElementById("browse-search");
    const category = document.getElementById("browse-category");
    const method = document.getElementById("browse-method");
    const sort = document.getElementById("browse-sort");
    const grid = document.getElementById("browse-grid");
    const count = document.getElementById("browse-count");
    const empty = document.getElementById("browse-empty");
    if (!search || !category || !method || !sort || !grid || !count || !empty) {
        return;
    }

    function render() {
        const keyword = normalizeSearchText(search.value.trim());
        const visibleListings = marketplaceStore.getListings().filter((listing) => {
            const isOtherOwner = listing.ownerId !== marketplaceStore.currentUser.id;
            const isAvailable = listing.status === "active" || listing.status === "repair";
            const searchTarget = normalizeSearchText(
                `${listing.name} ${listing.description} ${listing.ownerName} ${listing.location}`
            );
            return isOtherOwner
                && isAvailable
                && searchTarget.includes(keyword)
                && (category.value === "all" || listing.category === category.value)
                && (method.value === "all" || listing.method === method.value);
        });

        if (sort.value === "name") {
            visibleListings.sort((left, right) => left.name.localeCompare(right.name, "vi"));
        }

        grid.replaceChildren(...visibleListings.map(makeProductCard));
        count.textContent = `${visibleListings.length} món đồ đang được chia sẻ`;
        empty.hidden = visibleListings.length > 0;
        grid.hidden = visibleListings.length === 0;
    }

    function resetFilters() {
        search.value = "";
        category.value = "all";
        method.value = "all";
        sort.value = "newest";
        render();
        search.focus();
    }

    [search, category, method, sort].forEach((control) => {
        control.addEventListener(control === search ? "input" : "change", render);
    });
    document.getElementById("reset-filters")?.addEventListener("click", resetFilters);
    document.querySelector("[data-reset-filters]")?.addEventListener("click", resetFilters);
    render();
}
