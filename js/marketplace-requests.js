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

    const visual = makeDetailElement("div", `detail-art${listing.image ? " has-image" : ""}`);
    visual.dataset.category = listing.category;
    if (listing.image) {
        const image = makeDetailElement("img");
        image.src = listing.image;
        image.alt = listing.name;
        image.decoding = "async";
        image.addEventListener("error", () => {
            visual.classList.remove("has-image");
            image.remove();
            visual.textContent = listing.icon || "♻️";
            visual.setAttribute("aria-hidden", "true");
        }, { once: true });
        visual.append(image);
    } else {
        visual.textContent = listing.icon || "♻️";
        visual.setAttribute("aria-hidden", "true");
    }

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
