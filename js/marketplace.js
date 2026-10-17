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
    artwork.textContent = listing.icon || "♻️";

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

function makeDetailElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text) {
        element.textContent = text;
    }
    return element;
}

function setupDetailPage() {
    const content = document.getElementById("detail-content");
    const missing = document.getElementById("detail-missing");
    if (!content || !missing) {
        return;
    }

    const listingId = new URLSearchParams(window.location.search).get("id");
    const listing = marketplaceStore.getListings().find((item) => item.id === listingId);
    const canRequest = listing
        && listing.ownerId !== marketplaceStore.currentUser.id
        && (listing.status === "active" || listing.status === "repair");

    if (!canRequest) {
        content.hidden = true;
        missing.hidden = false;
        return;
    }

    const visual = makeDetailElement("div", "detail-art", listing.icon || "♻️");
    visual.dataset.category = listing.category;
    visual.setAttribute("aria-hidden", "true");

    const panel = makeDetailElement("div", "detail-panel");
    const eyebrow = makeDetailElement("p", "eyebrow", "MÓN ĐỒ ĐANG TÌM CHỦ MỚI");
    const tags = makeDetailElement("div", "detail-tags");
    tags.append(
        makeDetailElement("span", "category-tag", listing.category),
        makeDetailElement("span", "status-tag", listing.condition),
        makeDetailElement("span", "category-tag", listing.method)
    );

    const title = makeDetailElement("h1", "detail-title", listing.name);
    const owner = makeDetailElement("p", "detail-owner", `Đăng bởi ${listing.ownerName} · ${listing.age || "Vừa đăng"}`);
    const descriptionHeading = makeDetailElement("h2", "detail-subheading", "Mô tả món đồ");
    const description = makeDetailElement("p", "detail-description",
        listing.description || "Chủ món đồ chưa thêm mô tả.");
    const details = makeDetailElement("dl", "detail-facts");
    [
        ["Tình trạng", listing.condition],
        ["Phương án", listing.method],
        ["Địa điểm", listing.location]
    ].forEach(([label, value]) => {
        details.append(makeDetailElement("dt", "", label), makeDetailElement("dd", "", value));
    });

    const requestForm = makeDetailElement("form", "request-form");
    requestForm.id = "request-form";
    const messageLabel = makeDetailElement("label", "", "Lời nhắn cho người đăng (không bắt buộc)");
    messageLabel.htmlFor = "request-message";
    const messageInput = makeDetailElement("textarea");
    messageInput.id = "request-message";
    messageInput.name = "message";
    messageInput.rows = 3;
    messageInput.maxLength = 240;
    messageInput.placeholder = "Giới thiệu ngắn về bạn hoặc đề xuất trao đổi...";
    const error = makeDetailElement("p", "form-message");
    error.id = "request-error";
    error.setAttribute("role", "alert");
    const submit = makeDetailElement("button", "button button-primary");
    submit.type = "submit";
    submit.textContent = listing.method === "Cần sửa chữa"
        ? "Gửi yêu cầu hỗ trợ sửa chữa"
        : listing.method === "Trao đổi"
            ? "Gửi lời đề nghị trao đổi"
            : "Gửi yêu cầu nhận đồ";
    requestForm.append(messageLabel, messageInput, error, submit);

    const note = makeDetailElement("p", "request-note",
        "Đây là nguyên mẫu frontend; yêu cầu được lưu trên trình duyệt này để minh họa luồng.");
    panel.append(eyebrow, tags, title, owner, descriptionHeading, description, details, requestForm, note);
    content.replaceChildren(visual, panel);

    requestForm.addEventListener("submit", (event) => {
        event.preventDefault();
        error.textContent = "";
        submit.disabled = true;
        submit.textContent = "Đang gửi...";

        const result = marketplaceStore.createRequest(listing.id, messageInput.value);
        submit.disabled = false;
        submit.textContent = listing.method === "Cần sửa chữa"
            ? "Gửi yêu cầu hỗ trợ sửa chữa"
            : listing.method === "Trao đổi"
                ? "Gửi lời đề nghị trao đổi"
                : "Gửi yêu cầu nhận đồ";

        if (!result.ok) {
            error.textContent = result.reason;
            showMarketplaceToast(result.reason, true);
            return;
        }

        submit.disabled = true;
        submit.textContent = "Đã gửi yêu cầu";
        showMarketplaceToast("Đã gửi yêu cầu. Bạn có thể theo dõi trạng thái trong Yêu cầu của tôi.");
    });
}

function getRequestStatus(status) {
    const statuses = {
        pending: { label: "Đang chờ phản hồi", className: "status-pending" },
        accepted: { label: "Đã chấp nhận", className: "status-accepted" },
        rejected: { label: "Không được chấp nhận", className: "status-rejected" },
        cancelled: { label: "Đã hủy", className: "status-cancelled" }
    };
    return statuses[status] || { label: "Không xác định", className: "status-cancelled" };
}

function setupRequestsPage() {
    const list = document.getElementById("requests-list");
    const empty = document.getElementById("requests-empty");
    if (!list || !empty) {
        return;
    }

    let selectedStatus = "all";
    const tabs = [...document.querySelectorAll(".request-tab")];
    const emptyTitle = document.getElementById("requests-empty-title");
    const emptyDescription = document.getElementById("requests-empty-description");

    function render() {
        const allRequests = marketplaceStore.getRequests()
            .filter((request) => request.requesterId === marketplaceStore.currentUser.id);
        const requests = allRequests.filter((request) =>
            selectedStatus === "all" || request.status === selectedStatus
        );

        list.replaceChildren();
        requests.forEach((request) => {
            const card = makeDetailElement("article", "request-card");
            const main = makeDetailElement("div", "request-card-main");
            const title = makeDetailElement("h2", "", request.listingName);
            const subline = makeDetailElement("p", "request-subline",
                `Người đăng: ${request.ownerName} · ${request.method}`);
            const message = request.message
                ? makeDetailElement("p", "request-message", `Lời nhắn: ${request.message}`)
                : null;
            const dateText = new Intl.DateTimeFormat("vi-VN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(request.createdAt));
            const date = makeDetailElement("p", "request-date", `Gửi lúc ${dateText}`);
            main.append(title, subline);
            if (message) {
                main.append(message);
            }
            main.append(date);

            const actionArea = makeDetailElement("div", "request-card-actions");
            const status = getRequestStatus(request.status);
            actionArea.append(makeDetailElement("span", `status-tag ${status.className}`, status.label));

            if (request.status === "pending") {
                const cancel = makeDetailElement("button", "button button-secondary cancel-request");
                cancel.type = "button";
                cancel.dataset.requestId = request.id;
                cancel.textContent = "Hủy yêu cầu";
                actionArea.append(cancel);
            }
            card.append(main, actionArea);
            list.append(card);
        });

        list.hidden = requests.length === 0;
        empty.hidden = requests.length > 0;
        if (requests.length === 0 && allRequests.length > 0) {
            emptyTitle.textContent = "Không có yêu cầu ở trạng thái này";
            emptyDescription.textContent = "Chọn một trạng thái khác để xem các yêu cầu của bạn.";
        } else {
            emptyTitle.textContent = "Bạn chưa gửi yêu cầu nào";
            emptyDescription.textContent = "Khám phá món đồ trong cộng đồng để tìm thứ có thể dùng tiếp hoặc sửa chữa.";
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            selectedStatus = tab.dataset.status;
            tabs.forEach((entry) => {
                const isSelected = entry === tab;
                entry.classList.toggle("active", isSelected);
                entry.setAttribute("aria-pressed", String(isSelected));
            });
            render();
        });
    });

    list.addEventListener("click", (event) => {
        const cancelButton = event.target.closest(".cancel-request");
        if (!cancelButton) {
            return;
        }
        const result = marketplaceStore.cancelRequest(cancelButton.dataset.requestId);
        if (!result.ok) {
            showMarketplaceToast(result.reason, true);
            return;
        }
        showMarketplaceToast("Đã hủy yêu cầu.");
        render();
    });

    render();
}

setupMarketplaceNavigation();
setupBrowsePage();
setupDetailPage();
setupRequestsPage();
