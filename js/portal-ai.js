(function () {
    window.ReUseHubPortalAI = function (portal) {
        const { store, state, pageId } = portal;
        const { node, actionButton, showToast, makeListingCard } = portal.ui;

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

        return { generateDescription, generateAdvice, generateMatches, showLoading, saveAdviceListing, addListing };
    };
})();
