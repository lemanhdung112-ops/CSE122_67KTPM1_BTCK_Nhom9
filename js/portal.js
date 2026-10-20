(function () {
    const store = window.ReUseHubStore;
    const pageId = document.body.dataset.page;
    const root = document.getElementById("portal-root");
    const state = {
        aiDescription: "",
        aiMethod: "",
        aiMatches: [],
        detailId: new URLSearchParams(window.location.search).get("id") || "",
        toastTimer: 0
    };

    const screens = [
        { id: "owner-item-create", role: "Người có đồ", label: "Đăng món đồ", path: "../owner/owner-item-create.html" },
        { id: "owner-my-items", role: "Người có đồ", label: "Đồ của tôi", path: "../owner/owner-my-items.html" },
        { id: "owner-reuse-options", role: "Người có đồ", label: "Phương án xử lý", path: "../owner/owner-reuse-options.html" },
        { id: "receiver-item-browse", role: "Người nhận", label: "Khám phá đồ", path: "../receiver/receiver-item-browse.html" },
        { id: "receiver-item-detail", role: "Người nhận", label: "Chi tiết món đồ", path: "../receiver/receiver-item-detail.html" },
        { id: "receiver-my-requests", role: "Người nhận", label: "Yêu cầu của tôi", path: "../receiver/receiver-my-requests.html" },
        { id: "partner-service-management", role: "Điểm sửa chữa", label: "Quản lý dịch vụ", path: "../partner/partner-service-management.html" },
        { id: "partner-intake-list", role: "Điểm sửa chữa", label: "Danh sách tiếp nhận", path: "../partner/partner-intake-list.html" },
        { id: "partner-impact-dashboard", role: "Điểm sửa chữa", label: "Bảng tác động", path: "../partner/partner-impact-dashboard.html" },
        { id: "admin-category-management", role: "Quản trị viên", label: "Quản lý danh mục", path: "../admin/admin-category-management.html" },
        { id: "admin-listing-moderation", role: "Quản trị viên", label: "Kiểm duyệt tin", path: "../admin/admin-listing-moderation.html" },
        { id: "admin-circularity-report", role: "Quản trị viên", label: "Báo cáo tuần hoàn", path: "../admin/admin-circularity-report.html" }
    ];
    const descriptions = {
        "owner-item-create": "Đăng thông tin rõ ràng để món đồ có thể được kiểm duyệt và tìm thấy người cần.",
        "owner-my-items": "Quản lý tin của bạn và phản hồi các yêu cầu nhận đồ trong cùng một nơi.",
        "owner-reuse-options": "Cân nhắc cho tặng, sửa chữa hoặc tái sử dụng trước khi quyết định.",
        "receiver-item-browse": "Tìm món phù hợp trong cộng đồng và xem gợi ý dựa trên nhu cầu.",
        "receiver-item-detail": "Kiểm tra tình trạng, phương án và gửi lời nhắn tới người đăng.",
        "receiver-my-requests": "Theo dõi yêu cầu đã gửi, cập nhật lời nhắn hoặc hủy yêu cầu đang chờ.",
        "partner-service-management": "Cập nhật dịch vụ để cộng đồng biết nơi có thể sửa hoặc tái sử dụng đồ.",
        "partner-intake-list": "Tiếp nhận yêu cầu sửa chữa và cập nhật tiến độ xử lý.",
        "partner-impact-dashboard": "Theo dõi số yêu cầu và món đồ đã được xử lý tại điểm của bạn.",
        "admin-category-management": "Duy trì danh mục nhất quán cho các tin đăng.",
        "admin-listing-moderation": "Duyệt tin mới trước khi chúng xuất hiện trong danh sách cộng đồng.",
        "admin-circularity-report": "Tổng hợp dữ liệu tin đăng, yêu cầu và kết quả tuần hoàn."
    };
    const roleHome = {
        owner: "../owner/owner-my-items.html",
        receiver: "../receiver/receiver-item-browse.html",
        partner: "../partner/partner-intake-list.html",
        admin: "../admin/admin-listing-moderation.html"
    };

    if (!root || !screens.some((screen) => screen.id === pageId)) {
        return;
    }

    const screen = screens.find((entry) => entry.id === pageId);
    const roleViews = window.ReUseHubRoleViews?.[screen.id.split("-")[0]];
    if (!roleViews) {
        console.error(`Không tìm thấy phần hiển thị cho vai trò của màn hình ${pageId}.`);
        return;
    }
    const roleResult = store.setCurrentRole(screen.id.split("-")[0]);
    if (!roleResult.ok) {
        console.error("Không thể chọn vai trò cho màn hình này:", roleResult.reason);
    }
    document.title = `${screen.label} — ReUseHub`;
    document.body.classList.add("portal-body");
    buildShell();
    populateCategorySelects();
    wireEvents();
    renderScreen();

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

    function wireEvents() {
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
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
        const body = [title, tags, description, details];
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

    async function handleClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const { action, id } = button.dataset;

        if (action === "ai-describe") return generateDescription(button);
        if (action === "ai-advisor") return generateAdvice(button);
        if (action === "ai-match") return generateMatches(button, "browse");
        if (action === "ai-partner-match") return generateMatches(button, "partner");

        if (action === "show-detail") {
            window.location.href = `receiver-item-detail.html?id=${encodeURIComponent(id)}`;
        } else if (action === "approve-listing" || action === "reject-listing") {
            const reason = action === "reject-listing"
                ? window.prompt("Nhập lý do từ chối để người đăng biết:", "Vui lòng bổ sung thông tin tình trạng.")
                : "";
            if (action === "reject-listing" && reason === null) return;
            const result = store.moderateListing(id, action === "approve-listing" ? "active" : "rejected", reason || "");
            showToast(result.ok ? "Đã lưu kết quả kiểm duyệt." : result.reason, !result.ok);
            renderScreen();
        } else if (action === "request-status" || action === "request-status-reject"
            || action === "request-progress" || action === "request-complete") {
            const nextStatus = action === "request-status"
                ? "accepted"
                : action === "request-status-reject"
                    ? "rejected"
                    : action === "request-progress"
                        ? "in_progress"
                        : "completed";
            const result = store.updateRequestStatus(id, nextStatus);
            showToast(result.ok ? "Đã cập nhật trạng thái yêu cầu." : result.reason, !result.ok);
            renderScreen();
        } else if (action === "request-cancel") {
            const result = store.cancelRequest(id);
            showToast(result.ok ? "Đã hủy yêu cầu." : result.reason, !result.ok);
            renderScreen();
        } else if (action === "request-edit") {
            const requests = store.getRequests();
            const request = requests.find((entry) => entry.id === id);
            if (!request) return;
            const message = window.prompt("Sửa lời nhắn (tối đa 240 ký tự):", request.message || "");
            if (message === null) return;
            if (message.length > 240) {
                showToast("Lời nhắn không được dài quá 240 ký tự.", true);
                return;
            }
            request.message = message.trim();
            const result = store.saveRequests(requests);
            showToast(result ? "Đã cập nhật lời nhắn." : "Không thể lưu lời nhắn.", !result);
            renderScreen();
        } else if (action === "archive-listing") {
            const result = store.archiveListing(id);
            showToast(result.ok ? "Đã lưu trữ món đồ." : result.reason, !result.ok);
            renderScreen();
        } else if (action === "edit-listing") {
            openListingEditor(id);
        } else if (action === "close-dialog") {
            document.getElementById("edit-listing-dialog")?.close();
        } else if (action === "toggle-service" || action === "archive-service" || action === "edit-service") {
            updateService(action, id);
        } else if (action === "toggle-category") {
            const categories = store.getCategories();
            const category = categories.find((entry) => entry.id === id);
            if (!category) return;
            category.active = category.active === false;
            const saved = store.saveCategories(categories);
            showToast(saved ? "Đã cập nhật danh mục." : "Không thể lưu danh mục.", !saved);
            populateCategorySelects();
            renderScreen();
        } else if (action === "edit-category") {
            const categories = store.getCategories();
            const category = categories.find((entry) => entry.id === id);
            if (!category) return;
            const name = window.prompt("Tên danh mục mới:", category.name);
            if (name === null) return;
            const normalizedName = name.trim();
            if (!normalizedName) {
                showToast("Tên danh mục không được để trống.", true);
                return;
            }
            if (categories.some((entry) => entry.id !== id
                && entry.name.toLocaleLowerCase("vi") === normalizedName.toLocaleLowerCase("vi"))) {
                showToast("Tên danh mục này đã tồn tại.", true);
                return;
            }
            category.name = normalizedName;
            const saved = store.saveCategories(categories);
            showToast(saved ? "Đã đổi tên danh mục." : "Không thể lưu danh mục.", !saved);
            populateCategorySelects();
            renderScreen();
        } else if (action === "ai-accept") {
            if (pageId === "owner-item-create") {
                document.getElementById("item-description").value = state.aiDescription;
                showToast("Đã đưa mô tả gợi ý vào ô mô tả để bạn kiểm tra.");
            } else if (pageId === "owner-reuse-options") {
                state.aiMethod = button.dataset.method || "Cho tặng";
                document.getElementById("advice-method").value = state.aiMethod;
                showToast("Đã chọn phương án. Bấm Lưu món đồ để tạo tin chờ duyệt.");
            }
        } else if (action === "ai-reject") {
            const result = document.getElementById("ai-description-result")
                || document.getElementById("ai-advisor-result")
                || document.getElementById("ai-match-result");
            result?.replaceChildren(empty("Đã bỏ qua gợi ý. Bạn có thể nhập thủ công hoặc thử lại."));
        } else if (action === "ai-regenerate") {
            if (pageId === "owner-item-create") return generateDescription(button);
            if (pageId === "owner-reuse-options") return generateAdvice(button);
            return generateMatches(button, pageId === "partner-intake-list" ? "partner" : "browse");
        } else if (action === "ai-edit-search") {
            document.getElementById("browse-category")?.focus();
        } else if (action === "ai-save-search") {
            try {
                localStorage.setItem("reusehub-saved-search", document.getElementById("browse-category").value);
                showToast("Đã lưu tiêu chí gợi ý trên trình duyệt.");
            } catch (error) {
                console.error("Không thể lưu tiêu chí tìm kiếm:", error);
                showToast("Không thể lưu tiêu chí gợi ý.", true);
            }
        } else if (action === "ai-save-advice") {
            saveAdviceListing();
        } else if (action === "ai-save-partner-match") {
            try {
                localStorage.setItem("reusehub-saved-partner-match", id);
                showToast("Đã lưu gợi ý ghép ca.");
            } catch (error) {
                console.error("Không thể lưu gợi ý ghép ca:", error);
                showToast("Không thể lưu gợi ý ghép ca.", true);
            }
        }
    }

    function openListingEditor(id) {
        const listing = store.getListings().find((entry) => entry.id === id);
        const dialog = document.getElementById("edit-listing-dialog");
        const form = document.getElementById("edit-listing-form");
        if (!listing || !dialog || !form) return;
        form.elements.id.value = listing.id;
        form.elements.name.value = listing.name;
        form.elements.description.value = listing.description || "";
        dialog.showModal();
    }

    function updateService(action, id) {
        const services = store.getServices();
        const service = services.find((entry) => entry.id === id);
        if (!service) return;
        if (action === "toggle-service") {
            service.status = service.status === "active" ? "paused" : "active";
        } else if (action === "archive-service") {
            service.status = "archived";
        } else {
            const name = window.prompt("Tên dịch vụ:", service.name);
            if (name === null) return;
            const location = window.prompt("Địa điểm:", service.location);
            if (location === null) return;
            service.name = name.trim() || service.name;
            service.location = location.trim() || service.location;
        }
        const saved = store.saveServices(services);
        showToast(saved ? "Đã cập nhật dịch vụ." : "Không thể lưu dịch vụ.", !saved);
        renderScreen();
    }

    async function generateDescription(button) {
        const name = document.getElementById("item-name").value.trim();
        const keywords = document.getElementById("item-keywords").value.trim();
        const category = document.getElementById("item-category").value;
        const condition = document.getElementById("item-condition").value;
        const method = document.getElementById("item-method").value;
        const result = document.getElementById("ai-description-result");
        const keywordWords = keywords.split(/\s+/).filter(Boolean);
        if (!name || !category || !condition || keywordWords.length < 3) {
            result.replaceChildren(node("p", "portal-error",
                "Chưa đủ thông tin: hãy nhập tên, chọn danh mục và tình trạng, đồng thời cung cấp ít nhất 3 từ khóa."));
            return;
        }
        await showLoading(button, result, "Đang tạo mô tả gợi ý...");
        const keywordSentence = `${keywordWords.join(" ")}.`;
        const capitalizedKeywordSentence = keywordSentence.charAt(0).toLocaleUpperCase("vi")
            + keywordSentence.slice(1);
        const methodSentence = method ? ` Phương án mong muốn: ${method.toLocaleLowerCase("vi")}.` : "";
        state.aiDescription = `${name} thuộc danh mục ${category.toLocaleLowerCase("vi")}. `
            + `Món đồ hiện ${condition.toLocaleLowerCase("vi")}. `
            + `${capitalizedKeywordSentence}${methodSentence}`;
        const panel = node("div", "portal-ai-result");
        panel.append(node("strong", "", "Mô tả đề xuất (bạn cần kiểm tra):"));
        panel.append(node("p", "", state.aiDescription));
        panel.append(node("p", "portal-help", "Gợi ý dựa trên tên và từ khóa bạn nhập; đây là mô phỏng quy tắc, không gọi dịch vụ AI thật."));
        const actions = node("div", "portal-actions");
        actions.append(actionButton("Dùng và chỉnh sửa", "ai-accept", "", "primary"));
        actions.append(actionButton("Tạo lại", "ai-regenerate"));
        actions.append(actionButton("Bỏ qua", "ai-reject"));
        panel.append(actions);
        result.replaceChildren(panel);
    }

    async function generateAdvice(button) {
        const form = document.getElementById("advice-form");
        const name = form.elements.namedItem("advice-name").value.trim();
        const condition = form.elements.namedItem("advice-condition").value;
        const category = form.elements.namedItem("advice-category").value;
        const notes = form.elements.namedItem("advice-notes").value.trim();
        const result = document.getElementById("ai-advisor-result");
        if (!name || !condition) {
            result.replaceChildren(node("p", "portal-error", "Hãy nhập tên món đồ và tình trạng để nhận gợi ý."));
            return;
        }
        await showLoading(button, result, "Đang cân nhắc các phương án...");
        if (condition === "Cần sửa chữa" && !notes) {
            result.replaceChildren(node("p", "portal-error", "Chưa đủ thông tin để phân biệt nên sửa hay tái chế. Hãy bổ sung lỗi cụ thể hoặc chọn phương án thủ công."));
            return;
        }
        state.aiMethod = condition === "Cần sửa chữa" ? "Cần sửa chữa" : "Cho tặng";
        const explanation = condition === "Cần sửa chữa"
            ? "Món đồ có thể còn hữu ích sau khi sửa. Hãy mô tả lỗi và chờ điểm sửa chữa tiếp nhận."
            : "Tình trạng cho thấy món đồ còn có thể dùng tiếp; chia sẻ với người cần sẽ kéo dài vòng đời.";
        const panel = node("div", "portal-ai-result");
        panel.append(node("strong", "", `Gợi ý: ${state.aiMethod}`));
        panel.append(node("p", "", explanation));
        panel.append(node("p", "portal-help", `Món đồ: ${name}${category ? ` · ${category}` : ""}. Đây là gợi ý mô phỏng, quyết định cuối cùng thuộc về bạn.`));
        const methodSelect = document.createElement("select");
        methodSelect.id = "advice-method";
        methodSelect.className = "portal-control";
        ["Cho tặng", "Trao đổi", "Cần sửa chữa"].forEach((method) => {
            const option = node("option", "", method);
            option.value = method;
            methodSelect.append(option);
        });
        methodSelect.value = state.aiMethod;
        const actions = node("div", "portal-actions");
        actions.append(methodSelect, actionButton("Chấp nhận gợi ý", "ai-accept", "", "primary"));
        actions.append(actionButton("Tạo lại", "ai-regenerate"));
        actions.append(actionButton("Bỏ qua", "ai-reject"));
        actions.append(actionButton("Lưu món đồ", "ai-save-advice"));
        panel.append(actions);
        result.replaceChildren(panel);
    }

    async function generateMatches(button, target) {
        const result = document.getElementById(target === "browse" ? "ai-match-result" : "partner-match-result");
        await showLoading(button, result, "Đang tìm phương án phù hợp...");
        if (target === "browse") {
            const items = store.getListings().filter((entry) =>
                entry.ownerId !== store.currentUser.id && ["active", "repair"].includes(entry.status)
            );
            const preference = document.getElementById("browse-category").value;
            const matches = items.filter((entry) => preference === "all" || entry.category === preference);
            if (!matches.length) {
                result.replaceChildren(node("p", "portal-error", "Chưa tìm thấy món phù hợp. Thử chọn danh mục khác hoặc dùng bộ lọc thủ công."));
                return;
            }
            state.aiMatches = matches.slice(0, 3);
            const panel = node("div", "portal-ai-result");
            panel.append(node("strong", "", `Tìm thấy ${matches.length} gợi ý phù hợp`));
            panel.append(node("p", "", `Tiêu chí: ${preference === "all" ? "các danh mục" : preference}, tin đang nhận yêu cầu. Đây là ghép theo quy tắc mô phỏng; hãy tự kiểm tra thông tin.`));
            const actions = node("div", "portal-actions");
            actions.append(actionButton("Sửa tiêu chí", "ai-edit-search"));
            actions.append(actionButton("Tạo lại", "ai-regenerate"));
            actions.append(actionButton("Lưu tiêu chí", "ai-save-search"));
            actions.append(actionButton("Bỏ qua", "ai-reject"));
            panel.append(actions);
            const suggestions = node("div", "portal-list");
            state.aiMatches.forEach((listing) => {
                const suggestion = makeListingCard(listing, true);
                const open = actionButton("Xem chi tiết", "show-detail", listing.id, "primary");
                suggestion.append(open);
                suggestions.append(suggestion);
            });
            panel.append(suggestions);
            result.replaceChildren(panel);
        } else {
            const repairItems = store.getRequests().filter((entry) =>
                entry.partnerId === store.currentUser.id && entry.status === "pending"
            );
            const services = store.getServices().filter((entry) => entry.status === "active");
            if (!repairItems.length || !services.length) {
                result.replaceChildren(node("p", "portal-error", "Chưa đủ dữ liệu để ghép ca. Cần có yêu cầu sửa chữa đang chờ và ít nhất một dịch vụ đang hoạt động."));
                return;
            }
            const listings = store.getListings();
            const panel = node("div", "portal-ai-result");
            panel.append(node("strong", "", "Gợi ý ghép dịch vụ sửa chữa"));
            panel.append(node("p", "", "Ghép dựa trên danh mục dịch vụ đang hoạt động; kết quả cần được nhân viên xác nhận."));
            const suggestions = node("div", "portal-list");
            repairItems.forEach((request) => {
                const listing = listings.find((entry) => entry.id === request.listingId);
                const service = services.find((entry) => listing && entry.category === listing.category) || services[0];
                const info = node("div");
                info.append(node("h3", "", request.listingName));
                info.append(node("p", "portal-muted", `Dịch vụ gợi ý: ${service.name} · ${service.location}`));
                info.append(node("p", "portal-help", `Lý do: ${listing ? listing.category : "chưa rõ danh mục"} phù hợp với ${service.category}.`));
                const suggestion = card(info, [
                    actionButton("Tiếp nhận ca", "request-status", request.id, "primary"),
                    actionButton("Lưu gợi ý", "ai-save-partner-match", request.id),
                    actionButton("Bỏ qua", "ai-reject")
                ]);
                suggestions.append(suggestion);
            });
            const actions = node("div", "portal-actions");
            actions.append(actionButton("Tạo lại gợi ý", "ai-regenerate"));
            panel.append(actions, suggestions);
            result.replaceChildren(panel);
        }
    }

    async function showLoading(button, target, message) {
        button.disabled = true;
        target.replaceChildren(node("p", "portal-loading", message));
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        button.disabled = false;
    }

    function saveAdviceListing() {
        const form = document.getElementById("advice-form");
        const name = form.elements.namedItem("advice-name").value.trim();
        const condition = form.elements.namedItem("advice-condition").value;
        const category = form.elements.namedItem("advice-category").value;
        const method = document.getElementById("advice-method")?.value || state.aiMethod;
        if (!name || !condition || !method) {
            showToast("Hãy nhập đủ tên, tình trạng và phương án.", true);
            return;
        }
        const result = addListing({
            name,
            category: category || "Khác",
            condition,
            method,
            description: form.elements.namedItem("advice-notes").value.trim()
        });
        showToast(result.ok ? "Đã lưu tin ở trạng thái chờ kiểm duyệt." : result.reason, !result.ok);
    }

    function addListing(values) {
        const user = store.currentUser;
        const listings = store.getListings();
        const icons = { "Sách": "📚", "Điện tử": "🎧", "Đồ gia dụng": "💡", "Khác": "♻️" };
        listings.unshift({
            id: `item-${Date.now()}`,
            ownerId: user.id,
            ownerName: user.name,
            location: user.campus,
            ...values,
            status: "pending",
            age: "Vừa đăng",
            icon: icons[values.category] || "♻️"
        });
        return store.saveListings(listings)
            ? { ok: true }
            : { ok: false, reason: "Không thể lưu tin. Hãy thử lại." };
    }

    function handleSubmit(event) {
        const form = event.target.closest("form[data-form]");
        if (!form) {
            if (event.target.id === "advice-form") event.preventDefault();
            return;
        }
        event.preventDefault();
        const data = new FormData(form);
        if (form.dataset.form === "listing") {
            if (store.getCurrentRole() !== "owner") {
                showToast("Chuyển sang vai trò Người có đồ để đăng tin.", true);
                return;
            }
            const values = Object.fromEntries(data.entries());
            const result = addListing({
                name: String(values.name).trim(),
                category: values.category,
                condition: values.condition,
                method: values.method,
                description: String(values.description).trim()
            });
            showToast(result.ok ? "Đã gửi tin để kiểm duyệt." : result.reason, !result.ok);
            if (result.ok) form.reset();
            return;
        }
        if (form.dataset.form === "request") {
            const result = store.createRequest(data.get("listingId"), data.get("message"));
            showToast(result.ok ? "Đã gửi yêu cầu. Bạn có thể theo dõi trạng thái." : result.reason, !result.ok);
            if (result.ok) roleViews.renderDetail(viewContext(), store.getListings());
            return;
        }
        if (form.dataset.form === "edit-listing") {
            const result = store.updateListing(data.get("id"), {
                name: String(data.get("name")).trim(),
                description: String(data.get("description")).trim()
            });
            showToast(result.ok ? "Đã cập nhật món đồ." : result.reason, !result.ok);
            document.getElementById("edit-listing-dialog").close();
            renderScreen();
            return;
        }
        if (form.dataset.form === "service") {
            if (store.getCurrentRole() !== "partner") {
                showToast("Chuyển sang vai trò Điểm sửa chữa để quản lý dịch vụ.", true);
                return;
            }
            const services = store.getServices();
            services.unshift({
                id: `service-${Date.now()}`,
                name: String(data.get("name")).trim(),
                category: data.get("category") || "Khác",
                location: String(data.get("location")).trim(),
                description: String(data.get("description")).trim(),
                status: "active"
            });
            const saved = store.saveServices(services);
            showToast(saved ? "Đã thêm dịch vụ." : "Không thể lưu dịch vụ.", !saved);
            if (saved) form.reset();
            renderScreen();
            return;
        }
        if (form.dataset.form === "category") {
            if (store.getCurrentRole() !== "admin") {
                showToast("Chuyển sang vai trò Quản trị viên để sửa danh mục.", true);
                return;
            }
            const categories = store.getCategories();
            const name = String(data.get("name")).trim();
            if (categories.some((entry) => entry.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"))) {
                showToast("Danh mục này đã tồn tại.", true);
                return;
            }
            categories.push({
                id: `category-${Date.now()}`,
                name,
                description: String(data.get("description")).trim(),
                active: true
            });
            const saved = store.saveCategories(categories);
            showToast(saved ? "Đã thêm danh mục." : "Không thể lưu danh mục.", !saved);
            if (saved) form.reset();
            renderScreen();
        }
    }

    function normalize(value) {
        return String(value).toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "");
    }
})();
