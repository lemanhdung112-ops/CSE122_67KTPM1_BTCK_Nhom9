(function () {
    window.ReUseHubRoleViews = window.ReUseHubRoleViews || {};
    window.ReUseHubRoleViews.partner = {
        renderServices(context) {
            const { store, node, actionButton, statusBadge, card, empty } = context;
            const host = document.getElementById("service-list");
            const services = store.getServices();
            host.replaceChildren();
            if (!services.length) host.append(empty("Chưa có dịch vụ. Thêm dịch vụ để cộng đồng tìm thấy điểm của bạn."));
            services.forEach((service) => {
                const actions = [
                    actionButton("Sửa", "edit-service", service.id),
                    actionButton(service.status === "active" ? "Tạm ngưng" : "Kích hoạt", "toggle-service", service.id),
                    actionButton("Lưu trữ", "archive-service", service.id, "danger")
                ];
                const info = node("div");
                info.append(node("h3", "", service.name));
                const tags = node("div", "portal-tags");
                tags.append(node("span", "portal-badge", service.category), statusBadge(service.status, "service"));
                info.append(tags, node("p", "portal-muted", service.description || "Chưa có mô tả."),
                    node("p", "portal-muted", service.location));
                host.append(card(info, actions));
            });
        },

        renderIntake(context, requests) {
            const { store, makeRequestCard, empty } = context;
            const host = document.getElementById("intake-list");
            const incoming = requests.filter((entry) =>
                entry.partnerId === store.currentUser.id && entry.method === "Cần sửa chữa"
            );
            host.replaceChildren();
            if (!incoming.length) host.append(empty("Chưa có món đồ nào được gửi đến điểm sửa chữa."));
            incoming.forEach((request) => host.append(makeRequestCard(request, "partner")));
        },

        renderImpact(context, requests) {
            const { store, node, statBox, makeRequestCard, empty } = context;
            const partnerRequests = requests.filter((entry) => entry.partnerId === store.currentUser.id);
            const completed = partnerRequests.filter((entry) => entry.status === "completed");
            const stats = document.getElementById("partner-stats");
            stats.replaceChildren(
                statBox("Tổng ca tiếp nhận", partnerRequests.length),
                statBox("Đang chờ", partnerRequests.filter((entry) => entry.status === "pending").length),
                statBox("Đang xử lý", partnerRequests.filter((entry) => entry.status === "in_progress").length),
                statBox("Đã hoàn tất", completed.length)
            );
            const active = partnerRequests.filter((entry) => ["accepted", "in_progress"].includes(entry.status)).length;
            const total = Math.max(1, partnerRequests.length);
            const progress = document.getElementById("partner-progress");
            progress.replaceChildren(node("p", "portal-muted", `${active} trên ${total} ca đang được xử lý hoặc đã tiếp nhận`));
            const bar = node("div", "portal-progress");
            const fill = node("span");
            fill.style.width = `${Math.round((active / total) * 100)}%`;
            bar.append(fill);
            progress.append(bar);
            const doneHost = document.getElementById("partner-completed");
            doneHost.replaceChildren();
            if (!completed.length) doneHost.append(empty("Chưa có ca hoàn tất để báo cáo tác động."));
            completed.forEach((request) => doneHost.append(makeRequestCard(request, "report")));
        }
    };
})();
