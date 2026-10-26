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

    const portal = { store, pageId, root, state, screen, roleViews, screens, descriptions, roleHome };
    portal.ui = window.ReUseHubPortalUI(portal);
    portal.ai = window.ReUseHubPortalAI(portal);
    const actions = window.ReUseHubPortalActions(portal);
    portal.ui.buildShell();
    portal.ui.populateCategorySelects();
    portal.ui.wireEvents({ handleClick: actions.handleClick, handleSubmit: actions.handleSubmit });
    portal.ui.renderScreen();
})();
