(function () {
    window.ReUseHubPortalActionsForms = function (portal) {
        const { store, pageId, state, roleViews } = portal;
        const { showToast, renderScreen, populateCategorySelects, viewContext } = portal.ui;
        const { addListing } = portal.ai;

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

        return { handleSubmit };
    };
})();

(function () {
    window.ReUseHubPortalActions = function (portal) {
        const { store, pageId, state, roleViews } = portal;
        const { showToast, renderScreen, populateCategorySelects, empty, viewContext } = portal.ui;
        const { generateDescription, generateAdvice, generateMatches, saveAdviceListing, addListing } = portal.ai;

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

        const forms = window.ReUseHubPortalActionsForms(portal);
        return { handleClick, openListingEditor, updateService, handleSubmit: forms.handleSubmit };
    };
})();

