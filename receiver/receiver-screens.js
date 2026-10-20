(function () {
    window.ReUseHubRoleViews = window.ReUseHubRoleViews || {};
    window.ReUseHubRoleViews.receiver = {
        renderBrowse(context, listings) {
            const { store, node, actionButton, makeListingCard, empty, normalize } = context;
            const host = document.getElementById("browse-list");
            const roleUser = store.currentUser;
            const keyword = normalize(document.getElementById("browse-search").value);
            const category = document.getElementById("browse-category").value;
            const method = document.getElementById("browse-method").value;
            const visible = listings.filter((listing) => {
                const text = normalize(`${listing.name} ${listing.description} ${listing.ownerName} ${listing.location}`);
                return listing.ownerId !== roleUser.id
                    && ["active", "repair"].includes(listing.status)
                    && text.includes(keyword)
                    && (category === "all" || listing.category === category)
                    && (method === "all" || listing.method === method);
            });
            host.replaceChildren();
            document.getElementById("browse-count").textContent = `${visible.length} món phù hợp`;
            if (!visible.length) host.append(empty("Không tìm thấy món phù hợp. Hãy thử bỏ bớt bộ lọc."));
            visible.forEach((listing) => {
                const result = makeListingCard(listing, true);
                const action = actionButton("Xem chi tiết", "show-detail", listing.id, "primary");
                result.querySelector(".portal-card-actions")?.remove();
                const area = node("div", "portal-card-actions");
                area.append(action);
                result.append(area);
                host.append(result);
            });
        },

        renderDetail(context, listings) {
            const { store, state, node } = context;
            const available = listings.filter((entry) =>
                entry.ownerId !== store.currentUser.id && ["active", "repair"].includes(entry.status)
            );
            const select = document.getElementById("detail-item-select");
            const existing = state.detailId || select.value;
            select.replaceChildren();
            const placeholder = node("option", "", available.length ? "Chọn món đồ" : "Không có món đang nhận yêu cầu");
            placeholder.value = "";
            select.append(placeholder);
            available.forEach((listing) => {
                const option = node("option", "", `${listing.name} — ${listing.ownerName}`);
                option.value = listing.id;
                select.append(option);
            });
            if (available.some((entry) => entry.id === existing)) select.value = existing;
            state.detailId = select.value;
            this.showDetail(context, listings.find((entry) => entry.id === select.value));
        },

        showDetail(context, listing) {
            const { node, statusBadge, empty } = context;
            const panel = document.getElementById("detail-panel");
            panel.replaceChildren();
            if (!listing) {
                panel.append(empty("Chọn món đồ để xem thông tin và gửi yêu cầu."));
                return;
            }
            const title = node("h2", "", listing.name);
            const tags = node("div", "portal-tags");
            tags.append(node("span", "portal-badge", listing.category), statusBadge(listing.status));
            const description = node("p", "portal-muted", listing.description || "Chủ món đồ chưa thêm mô tả.");
            const facts = node("p", "portal-muted",
                `${listing.condition} · ${listing.method} · ${listing.location} · Đăng bởi ${listing.ownerName}`);
            const form = document.createElement("form");
            form.className = "portal-form";
            form.dataset.form = "request";
            const hidden = document.createElement("input");
            hidden.type = "hidden";
            hidden.name = "listingId";
            hidden.value = listing.id;
            const label = node("label", "", "Lời nhắn (không bắt buộc)");
            label.htmlFor = "request-message";
            const field = node("div", "portal-field portal-field-wide");
            const message = document.createElement("textarea");
            message.id = "request-message";
            message.name = "message";
            message.maxLength = 240;
            message.placeholder = "Giới thiệu ngắn hoặc đề xuất trao đổi...";
            const submit = node("button", "portal-action-button primary",
                listing.method === "Cần sửa chữa" ? "Gửi yêu cầu sửa chữa" : "Gửi yêu cầu");
            submit.type = "submit";
            field.append(label, message);
            const actionRow = node("div", "portal-field-wide");
            actionRow.append(submit);
            form.append(hidden, field, actionRow);
            panel.append(title, tags, description, facts, form);
        },

        renderRequests(context, requests) {
            const { store, makeRequestCard, empty } = context;
            const host = document.getElementById("my-request-list");
            const status = document.getElementById("request-status-filter").value;
            const own = requests.filter((entry) =>
                entry.requesterId === store.currentUser.id
                && (status === "all" || entry.status === status)
            );
            host.replaceChildren();
            if (!own.length) host.append(empty("Chưa có yêu cầu ở trạng thái này. Khám phá đồ để bắt đầu."));
            own.forEach((request) => host.append(makeRequestCard(request, "receiver")));
        },

        handleChange(context, event) {
            const { store, state } = context;
            if (["browse-search", "browse-category", "browse-method"].includes(event.target.id)) {
                this.renderBrowse(context, store.getListings());
            }
            if (event.target.id === "detail-item-select") {
                state.detailId = event.target.value;
                this.showDetail(context, store.getListings().find((entry) => entry.id === state.detailId));
            }
            if (event.target.id === "request-status-filter") {
                this.renderRequests(context, store.getRequests());
            }
        }
    };
})();
