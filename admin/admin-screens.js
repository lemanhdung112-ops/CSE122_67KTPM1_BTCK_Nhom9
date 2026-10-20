(function () {
    window.ReUseHubRoleViews = window.ReUseHubRoleViews || {};
    window.ReUseHubRoleViews.admin = {
        renderCategories(context) {
            const { store, node, actionButton, card, empty } = context;
            const host = document.getElementById("category-list");
            const categories = store.getCategories();
            host.replaceChildren();
            if (!categories.length) host.append(empty("Chưa có danh mục."));
            categories.forEach((category) => {
                const info = node("div");
                info.append(node("h3", "", category.name));
                info.append(node("p", "portal-muted", category.description || "Danh mục dùng khi đăng món đồ."));
                const actions = [
                    actionButton("Sửa tên", "edit-category", category.id),
                    actionButton(category.active === false ? "Hiện lại" : "Ẩn danh mục", "toggle-category", category.id)
                ];
                host.append(card(info, actions));
            });
        },

        renderModeration(context, listings) {
            const { node, actionButton, makeListingCard, empty } = context;
            const host = document.getElementById("moderation-list");
            const pending = listings.filter((entry) => entry.status === "pending");
            host.replaceChildren();
            if (!pending.length) host.append(empty("Hàng đợi kiểm duyệt đang trống."));
            pending.forEach((listing) => {
                const item = makeListingCard(listing, true);
                const actions = node("div", "portal-card-actions");
                actions.append(actionButton("Duyệt tin", "approve-listing", listing.id, "primary"));
                actions.append(actionButton("Từ chối", "reject-listing", listing.id, "danger"));
                item.append(actions);
                host.append(item);
            });
        },

        renderReport(context, listings, requests) {
            const { statBox, empty, node } = context;
            const counts = (entries, status) => entries.filter((entry) => entry.status === status).length;
            const stats = document.getElementById("report-stats");
            stats.replaceChildren(
                statBox("Tổng tin đăng", listings.length),
                statBox("Đang chờ duyệt", counts(listings, "pending")),
                statBox("Tin đang chia sẻ", counts(listings, "active") + counts(listings, "repair")),
                statBox("Yêu cầu hoàn tất", counts(requests, "completed"))
            );
            this.renderBars(node, empty, document.getElementById("report-listings"), [
                ["Chờ duyệt", counts(listings, "pending")],
                ["Đang chia sẻ", counts(listings, "active")],
                ["Cần sửa", counts(listings, "repair")],
                ["Bị từ chối", counts(listings, "rejected")],
                ["Đã lưu trữ", counts(listings, "archived")],
                ["Đã trao/hoàn tất", counts(listings, "donated") + counts(listings, "completed")]
            ]);
            this.renderBars(node, empty, document.getElementById("report-requests"), [
                ["Đang chờ", counts(requests, "pending")],
                ["Đã chấp nhận", counts(requests, "accepted")],
                ["Đang xử lý", counts(requests, "in_progress")],
                ["Hoàn tất", counts(requests, "completed")],
                ["Bị từ chối/đã hủy", counts(requests, "rejected") + counts(requests, "cancelled")]
            ]);
            const categoryCounts = new Map();
            listings.forEach((entry) => categoryCounts.set(entry.category, (categoryCounts.get(entry.category) || 0) + 1));
            this.renderBars(node, empty, document.getElementById("report-categories"), [...categoryCounts.entries()]);
        },

        renderBars(node, empty, host, entries) {
            host.replaceChildren();
            if (!entries.length || entries.every((entry) => entry[1] === 0)) {
                host.append(empty("Chưa có dữ liệu để tổng hợp."));
                return;
            }
            const max = Math.max(1, ...entries.map((entry) => entry[1]));
            entries.forEach(([label, count]) => {
                const row = node("div", "portal-report-row");
                const text = node("div", "portal-report-label");
                text.append(node("span", "", label), node("strong", "", String(count)));
                const bar = node("div", "portal-progress");
                const fill = node("span");
                fill.style.width = `${Math.round((count / max) * 100)}%`;
                bar.append(fill);
                row.append(text, bar);
                host.append(row);
            });
        }
    };
})();
