(function () {
    window.ReUseHubPortalUI = function (portal) {
        const { store, pageId, root, state, screen, roleViews, screens, descriptions, roleHome } = portal;

    function node(tag, className, text) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (text !== undefined) element.textContent = text;
            return element;
        }

    function actionButton(label, action, id, style = "") {
            const button = node("button", `portal-action-button ${style}`.trim(), label);
            button.type = "button";
            button.dataset.action = action;
            if (id) button.dataset.id = id;
            return button;
        }

    function statusBadge(status, type = "") {
            const labels = {
                pending: "Chờ xử lý",
                active: "Đang chia sẻ",
                repair: "Cần sửa chữa",
                reserved: "Đã có người nhận",
                donated: "Đã trao tặng",
                rejected: "Bị từ chối",
                cancelled: "Đã hủy",
                archived: "Đã lưu trữ",
                accepted: "Đã chấp nhận",
                in_progress: "Đang xử lý",
                completed: "Hoàn tất",
                paused: "Tạm ngưng"
            };
            if (type === "listing" && status === "pending") labels.pending = "Chờ kiểm duyệt";
            if (type === "listing" && status === "completed") labels.completed = "Đã trao xong";
            if (type === "request" && status === "pending") labels.pending = "Chờ phản hồi";
            if (type === "service" && status === "active") labels.active = "Đang hoạt động";
            return node("span", `portal-badge ${status || ""}`, labels[status] || status || "Chưa rõ");
        }

    function showToast(message, isError = false) {
            const toast = document.getElementById("portal-toast");
            if (!toast) return;
            window.clearTimeout(state.toastTimer);
            toast.textContent = message;
            toast.classList.toggle("error", isError);
            toast.hidden = false;
            state.toastTimer = window.setTimeout(() => {
                toast.hidden = true;
            }, 3200);
        }

    function buildShell() {
            const content = document.getElementById("portal-content");
            root.replaceChildren();
            const header = node("header", "portal-header");
            const brand = node("a", "brand");
            brand.href = roleHome[store.getCurrentRole()];
            brand.setAttribute("aria-label", "Về trang tổng quan");
            const mark = node("span", "brand-mark", "↻");
            mark.setAttribute("aria-hidden", "true");
            brand.append(mark, node("span", "", "ReUseHub"));
    
            const roleSelect = node("select", "portal-role");
            roleSelect.id = "demo-role";
            roleSelect.setAttribute("aria-label", "Chuyển vai trò demo");
            store.getRoles().forEach((role) => {
                const option = node("option", "", role.label);
                option.value = role.id;
                roleSelect.append(option);
            });
            roleSelect.value = store.getCurrentRole();
            header.append(brand, roleSelect, node("span", "portal-user", store.currentUser.name));
    
            const layout = node("div", "portal-layout");
            const sidebar = node("aside", "portal-sidebar");
            sidebar.setAttribute("aria-label", "Điều hướng các màn hình");
            const navigation = node("nav");
            const roleNames = ["Người có đồ", "Người nhận", "Điểm sửa chữa", "Quản trị viên"];
            roleNames.forEach((roleName) => {
                navigation.append(node("p", "portal-nav-heading", roleName));
                screens.filter((entry) => entry.role === roleName).forEach((entry) => {
                    const link = node("a", `portal-nav-link${entry.id === pageId ? " active" : ""}`, entry.label);
                    link.href = entry.path;
                    if (entry.id === pageId) link.setAttribute("aria-current", "page");
                    navigation.append(link);
                });
            });
            sidebar.append(navigation);
            navigation.addEventListener("click", (event) => {
                const link = event.target.closest("a.portal-nav-link");
                if (!link) return;
                const target = screens.find((entry) => entry.path === link.getAttribute("href"));
                if (!target) return;
                const roleByName = {
                    "Người có đồ": "owner",
                    "Người nhận": "receiver",
                    "Điểm sửa chữa": "partner",
                    "Quản trị viên": "admin"
                };
                const result = store.setCurrentRole(roleByName[target.role]);
                if (!result.ok) {
                    event.preventDefault();
                    showToast(result.reason, true);
                }
            });
    
            const main = node("main", "portal-main");
            const heading = node("section", "portal-page-heading");
            const headingCopy = node("div");
            headingCopy.append(node("p", "eyebrow", `${screen.role.toLocaleUpperCase("vi")} · REUSEHUB`));
            headingCopy.append(node("h1", "", screen.label));
            headingCopy.append(node("p", "", descriptions[pageId]));
            heading.append(headingCopy);
            main.append(heading, content);
            layout.append(sidebar, main);
    
            const footer = node("footer", "portal-footer");
            footer.append(node("span", "", "ReUseHub · Tái sử dụng hôm nay, gìn giữ ngày mai."));
            footer.append(node("span", "", "Nguyên mẫu frontend · Dữ liệu lưu trên trình duyệt."));
            const toast = node("div", "portal-toast");
            toast.id = "portal-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            toast.hidden = true;
    
            root.append(header, layout, footer, toast);
            roleSelect.addEventListener("change", () => {
                const result = store.setCurrentRole(roleSelect.value);
                if (!result.ok) {
                    showToast(result.reason, true);
                    return;
                }
                window.location.href = roleHome[roleSelect.value];
            });
        }

    function populateCategorySelects() {
            const categories = store.getCategories().filter((entry) => entry.active !== false);
            ["item-category", "advice-category", "browse-category", "service-category"].forEach((id) => {
                const select = document.getElementById(id);
                if (!select) return;
                select.replaceChildren();
                const allOption = node("option", "", id === "browse-category" ? "Tất cả danh mục" : "Chọn danh mục");
                allOption.value = id === "browse-category" ? "all" : "";
                select.append(allOption);
                categories.forEach((category) => {
                    const option = node("option", "", category.name);
                    option.value = category.name;
                    select.append(option);
                });
            });
        }

    function wireEvents(handlers) {
            document.addEventListener("click", handlers.handleClick);
            document.addEventListener("submit", handlers.handleSubmit);
            document.addEventListener("input", handleBrowseChange);
            document.addEventListener("change", handleBrowseChange);
        }

    function handleBrowseChange(event) {
            if (screen.id.startsWith("receiver-")) {
                roleViews.handleChange(viewContext(), event);
            }
        }

    function card(main, actions) {
            const element = node("article", "portal-card");
            const content = node("div", "portal-card-main");
            if (Array.isArray(main)) content.append(...main);
            else content.append(main);
            element.append(content);
            if (actions) {
                const actionArea = node("div", "portal-card-actions");
                actionArea.append(...actions);
                element.append(actionArea);
            }
            return element;
        }

    function makeListingCard(listing, includeOwner = false) {
            const title = node("h3", "", listing.name);
            const tags = node("div", "portal-tags");
            tags.append(node("span", "portal-badge", listing.category), statusBadge(listing.status, "listing"));
            const description = node("p", "portal-muted", listing.description || `${listing.condition} · ${listing.method}`);
            const details = node("p", "portal-muted", `${listing.condition} · ${listing.method}${includeOwner ? ` · ${listing.ownerName}` : ""}`);
            const image = listing.image ? node("img", "portal-listing-image") : null;
            if (image) Object.assign(image, { src: listing.image, alt: listing.name, loading: "lazy", decoding: "async" });
            image?.addEventListener("error", () => image.remove(), { once: true });
            const body = image ? [image] : [];
            body.push(title, tags, description, details);
            if (listing.moderationReason) body.push(node("p", "portal-error", `Lý do từ chối: ${listing.moderationReason}`));
            return card(body);
        }

    function makeRequestCard(request, view) {
            const title = node("h3", "", request.listingName || "Món đồ");
            const details = node("p", "portal-muted",
                `${view === "owner" ? `Người gửi: ${request.requesterName}` : `Người đăng: ${request.ownerName}`} · ${request.method}`);
            const message = node("p", "portal-muted", request.message ? `Lời nhắn: ${request.message}` : "Không có lời nhắn.");
            const tags = node("div", "portal-tags");
            tags.append(statusBadge(request.status, "request"));
            const actions = [];
            if (view === "owner" && request.status === "pending") {
                actions.push(actionButton("Chấp nhận", "request-status", request.id, "primary"));
                actions.push(actionButton("Từ chối", "request-status-reject", request.id, "danger"));
            } else if (view === "owner" && request.status === "accepted") {
                actions.push(actionButton("Đánh dấu đã trao", "request-complete", request.id, "primary"));
            } else if (view === "partner" && request.status === "pending") {
                actions.push(actionButton("Tiếp nhận", "request-status", request.id, "primary"));
                actions.push(actionButton("Từ chối", "request-status-reject", request.id, "danger"));
            } else if (view === "partner" && request.status === "accepted") {
                actions.push(actionButton("Bắt đầu sửa", "request-progress", request.id, "primary"));
            } else if (view === "partner" && request.status === "in_progress") {
                actions.push(actionButton("Đánh dấu hoàn tất", "request-complete", request.id, "primary"));
            } else if (view === "receiver" && request.status === "pending") {
                actions.push(actionButton("Sửa lời nhắn", "request-edit", request.id));
                actions.push(actionButton("Hủy yêu cầu", "request-cancel", request.id, "danger"));
            }
            return card([title, details, message, tags], actions);
        }

    function renderScreen() {
            const listings = store.getListings();
            const requests = store.getRequests();
            const context = viewContext();
            switch (pageId) {
                case "owner-item-create":
                    break;
                case "owner-my-items":
                    roleViews.renderItems(context, listings, requests);
                    break;
                case "owner-reuse-options":
                    break;
                case "receiver-item-browse":
                    roleViews.renderBrowse(context, listings);
                    break;
                case "receiver-item-detail":
                    roleViews.renderDetail(context, listings);
                    break;
                case "receiver-my-requests":
                    roleViews.renderRequests(context, requests);
                    break;
                case "partner-service-management":
                    roleViews.renderServices(context);
                    break;
                case "partner-intake-list":
                    roleViews.renderIntake(context, requests);
                    break;
                case "partner-impact-dashboard":
                    roleViews.renderImpact(context, requests);
                    break;
                case "admin-category-management":
                    roleViews.renderCategories(context);
                    break;
                case "admin-listing-moderation":
                    roleViews.renderModeration(context, listings);
                    break;
                case "admin-circularity-report":
                    roleViews.renderReport(context, listings, requests);
                    break;
            }
        }

    function statBox(label, value) {
            const stat = node("article", "portal-stat");
            stat.append(node("span", "", label), node("strong", "", String(value)));
            return stat;
        }

    function empty(message) {
            return node("p", "portal-empty", message);
        }

    function viewContext() {
            return {
                store,
                state,
                node,
                actionButton,
                statusBadge,
                card,
                makeListingCard,
                makeRequestCard,
                empty,
                statBox,
                normalize
            };
        }

    function normalize(value) {
            return String(value).toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "");
        }

        return { node, actionButton, statusBadge, showToast, buildShell, populateCategorySelects, wireEvents, handleBrowseChange, card, makeListingCard, makeRequestCard, renderScreen, statBox, empty, viewContext, normalize };
    };
})();
