(function () {
    const LISTINGS_KEY = "reusehub-listings";
    const REQUESTS_KEY = "reusehub-requests";
    const ROLE_KEY = "reusehub-demo-role";
    const CURRENT_USER = {
        id: "student-linh",
        name: "Linh Nguyễn",
        campus: "Khuôn viên trường"
    };
    const DEMO_USERS = {
        owner: CURRENT_USER,
        receiver: {
            id: "student-minh",
            name: "Minh Trần",
            campus: "Khuôn viên trường"
        },
        partner: {
            id: "partner-campus",
            name: "Trạm Sửa chữa Xanh",
            campus: "Khuôn viên trường"
        },
        admin: {
            id: "admin-cse",
            name: "Quản trị viên",
            campus: "Khuôn viên trường"
        }
    };
    const DEMO_SERVICES = [
        {
            id: "service-bike",
            name: "Sửa xe đạp",
            category: "Di chuyển",
            description: "Kiểm tra phanh, săm lốp và căn chỉnh xe.",
            location: "Nhà xe khu A",
            status: "active"
        },
        {
            id: "service-electronics",
            name: "Sửa đồ điện tử nhỏ",
            category: "Điện tử",
            description: "Kiểm tra và sửa các thiết bị học tập nhỏ.",
            location: "Phòng sinh hoạt cộng đồng",
            status: "active"
        }
    ];

    const seedListings = [
        {
            id: "sample-book",
            ownerId: CURRENT_USER.id,
            ownerName: CURRENT_USER.name,
            name: "Giáo trình Lập trình C++",
            category: "Sách",
            condition: "Còn tốt",
            method: "Cho tặng",
            description: "Sách còn sạch, có thể dùng tốt cho học kỳ này.",
            status: "active",
            age: "2 ngày trước",
            icon: "📚",
            location: CURRENT_USER.campus
        },
        {
            id: "sample-headphones",
            ownerId: CURRENT_USER.id,
            ownerName: CURRENT_USER.name,
            name: "Tai nghe Bluetooth",
            category: "Điện tử",
            condition: "Đã qua sử dụng",
            method: "Trao đổi",
            description: "Hoạt động bình thường, pin vẫn dùng ổn.",
            status: "active",
            age: "4 ngày trước",
            icon: "🎧",
            location: CURRENT_USER.campus
        },
        {
            id: "sample-lamp",
            ownerId: CURRENT_USER.id,
            ownerName: CURRENT_USER.name,
            name: "Đèn bàn học",
            category: "Đồ gia dụng",
            condition: "Cần sửa chữa",
            method: "Cần sửa chữa",
            description: "Đèn vẫn sáng, cần thay công tắc.",
            status: "repair",
            age: "1 tuần trước",
            icon: "💡",
            location: CURRENT_USER.campus
        },
        {
            id: "shared-calculus",
            ownerId: "student-minh",
            ownerName: "Minh Trần",
            name: "Sách Giải tích 1",
            category: "Sách",
            condition: "Còn tốt",
            method: "Cho tặng",
            description: "Không ghi chú vào sách, bìa và gáy còn chắc.",
            status: "active",
            age: "Hôm nay",
            icon: "📖",
            location: "Thư viện trung tâm"
        },
        {
            id: "shared-keyboard",
            ownerId: "student-hoa",
            ownerName: "Hòa Phạm",
            name: "Bàn phím cơ mini",
            category: "Điện tử",
            condition: "Đã qua sử dụng",
            method: "Trao đổi",
            description: "Đủ phím, đang hoạt động tốt. Muốn đổi lấy chuột không dây.",
            status: "active",
            age: "1 ngày trước",
            icon: "⌨️",
            location: "Ký túc xá A"
        },
        {
            id: "shared-chair",
            ownerId: "student-tuan",
            ownerName: "Tuấn Lê",
            name: "Ghế học tập",
            category: "Đồ gia dụng",
            condition: "Cần sửa chữa",
            method: "Cần sửa chữa",
            description: "Khung ghế chắc chắn, cần siết lại một chân ghế.",
            status: "repair",
            age: "2 ngày trước",
            icon: "🪑",
            location: "Khu nhà C"
        },
        {
            id: "shared-backpack",
            ownerId: "student-anh",
            ownerName: "Anh Võ",
            name: "Ba lô đi học",
            category: "Khác",
            condition: "Còn tốt",
            method: "Cho tặng",
            description: "Ba lô sạch, khóa kéo còn tốt, phù hợp đi học hằng ngày.",
            status: "active",
            age: "3 ngày trước",
            icon: "🎒",
            location: "Cổng trường"
        },
        {
            id: "shared-lamp",
            ownerId: "student-thao",
            ownerName: "Thảo Nguyễn",
            name: "Đèn học chống cận",
            category: "Đồ gia dụng",
            condition: "Còn tốt",
            method: "Cho tặng",
            description: "Đèn còn sáng tốt, có thể điều chỉnh độ sáng.",
            status: "active",
            age: "4 ngày trước",
            icon: "💡",
            location: "Ký túc xá B"
        },
        {
            id: "shared-calculator",
            ownerId: "student-khoa",
            ownerName: "Khoa Đặng",
            name: "Máy tính cầm tay",
            category: "Điện tử",
            condition: "Đã qua sử dụng",
            method: "Cho tặng",
            description: "Máy vẫn hoạt động, màn hình rõ, kèm nắp bảo vệ.",
            status: "active",
            age: "5 ngày trước",
            icon: "🧮",
            location: "Khu nhà A"
        }
    ];

    function readCollection(key, fallback) {
        try {
            const savedValue = localStorage.getItem(key);
            if (savedValue === null) {
                return fallback.map((entry) => ({ ...entry }));
            }
            const parsedValue = JSON.parse(savedValue);
            if (!Array.isArray(parsedValue)) {
                throw new Error(`Dữ liệu trong "${key}" không phải danh sách.`);
            }
            return parsedValue;
        } catch (error) {
            console.error(`Không thể đọc dữ liệu ReUseHub (${key}):`, error);
            return fallback.map((entry) => ({ ...entry }));
        }
    }

    function writeCollection(key, values) {
        try {
            localStorage.setItem(key, JSON.stringify(values));
            return true;
        } catch (error) {
            console.error(`Không thể lưu dữ liệu ReUseHub (${key}):`, error);
            return false;
        }
    }

    function getCurrentUser() {
        let role = "owner";
        try {
            role = localStorage.getItem(ROLE_KEY) || "owner";
        } catch (error) {
            console.error("Không thể đọc vai trò demo:", error);
        }
        return DEMO_USERS[role] ? DEMO_USERS[role] : DEMO_USERS.owner;
    }

    function normalizeListings(listings) {
        return listings.map((listing) => ({
            ...listing,
            ownerId: listing.ownerId || CURRENT_USER.id,
            ownerName: listing.ownerName || CURRENT_USER.name,
            location: listing.location || CURRENT_USER.campus,
            icon: listing.icon || "♻️"
        }));
    }

    window.ReUseHubStore = Object.freeze({
        get currentUser() {
            return getCurrentUser();
        },
        getCurrentRole() {
            try {
                const role = localStorage.getItem(ROLE_KEY) || "owner";
                return DEMO_USERS[role] ? role : "owner";
            } catch (error) {
                console.error("Không thể đọc vai trò demo:", error);
                return "owner";
            }
        },
        setCurrentRole(role) {
            if (!DEMO_USERS[role]) {
                return { ok: false, reason: "Vai trò demo không hợp lệ." };
            }
            try {
                localStorage.setItem(ROLE_KEY, role);
                return { ok: true };
            } catch (error) {
                console.error("Không thể lưu vai trò demo:", error);
                return { ok: false, reason: "Không thể lưu vai trò trên trình duyệt." };
            }
        },
        getRoles() {
            return [
                { id: "owner", label: "Người có đồ", user: DEMO_USERS.owner },
                { id: "receiver", label: "Người nhận", user: DEMO_USERS.receiver },
                { id: "partner", label: "Điểm sửa chữa", user: DEMO_USERS.partner },
                { id: "admin", label: "Quản trị viên", user: DEMO_USERS.admin }
            ];
        },
        getListings() {
            return normalizeListings(readCollection(LISTINGS_KEY, seedListings));
        },
        saveListings(listings) {
            return writeCollection(LISTINGS_KEY, listings);
        },
        getRequests() {
            return readCollection(REQUESTS_KEY, []);
        },
        saveRequests(requests) {
            return writeCollection(REQUESTS_KEY, requests);
        },
        moderateListing(listingId, decision, reason = "") {
            if (this.getCurrentRole() !== "admin" || !["active", "rejected"].includes(decision)) {
                return { ok: false, reason: "Bạn không có quyền kiểm duyệt tin này." };
            }

            const listings = this.getListings();
            const listing = listings.find((entry) => entry.id === listingId && entry.status === "pending");
            if (!listing) {
                return { ok: false, reason: "Không tìm thấy tin đang chờ kiểm duyệt." };
            }

            listing.status = decision;
            listing.moderationReason = decision === "rejected" ? String(reason).trim() : "";
            return this.saveListings(listings)
                ? { ok: true }
                : { ok: false, reason: "Không thể lưu kết quả kiểm duyệt." };
        },
        updateListing(listingId, updates) {
            const user = this.currentUser;
            const listings = this.getListings();
            const listing = listings.find((entry) => entry.id === listingId && entry.ownerId === user.id);
            if (!listing) {
                return { ok: false, reason: "Không tìm thấy món đồ thuộc tài khoản demo hiện tại." };
            }

            Object.assign(listing, updates);
            return this.saveListings(listings)
                ? { ok: true }
                : { ok: false, reason: "Không thể lưu thay đổi món đồ." };
        },
        archiveListing(listingId) {
            return this.updateListing(listingId, { status: "archived" });
        },
        getServices() {
            return readCollection("reusehub-services", DEMO_SERVICES);
        },
        saveServices(services) {
            if (this.getCurrentRole() !== "partner") {
                console.error("Vai trò hiện tại không được phép sửa dịch vụ.");
                return false;
            }
            return writeCollection("reusehub-services", services);
        },
        getCategories() {
            return readCollection("reusehub-categories", [
                { id: "books", name: "Sách", active: true },
                { id: "electronics", name: "Điện tử", active: true },
                { id: "home", name: "Đồ gia dụng", active: true },
                { id: "other", name: "Khác", active: true }
            ]);
        },
        saveCategories(categories) {
            if (this.getCurrentRole() !== "admin") {
                console.error("Vai trò hiện tại không được phép sửa danh mục.");
                return false;
            }
            return writeCollection("reusehub-categories", categories);
        },
        createRequest(listingId, message) {
            const user = this.currentUser;
            const listing = this.getListings().find((entry) => entry.id === listingId);
            if (this.getCurrentRole() !== "receiver" || !listing || listing.ownerId === user.id
                || (listing.status !== "active" && listing.status !== "repair")) {
                return { ok: false, reason: "Món đồ này hiện không nhận yêu cầu." };
            }

            const requests = this.getRequests();
            const existingRequest = requests.find((request) =>
                request.listingId === listingId
                && request.requesterId === user.id
                && request.status === "pending"
            );
            if (existingRequest) {
                return { ok: false, reason: "Bạn đã gửi yêu cầu cho món đồ này rồi." };
            }

            requests.unshift({
                id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                listingId,
                listingName: listing.name,
                ownerId: listing.ownerId,
                ownerName: listing.ownerName,
                method: listing.method,
                requesterId: user.id,
                requesterName: user.name,
                message: String(message || "").trim(),
                partnerId: listing.method === "Cần sửa chữa" ? "partner-campus" : "",
                status: "pending",
                createdAt: new Date().toISOString()
            });

            return writeCollection(REQUESTS_KEY, requests)
                ? { ok: true }
                : { ok: false, reason: "Không thể lưu yêu cầu. Hãy thử lại." };
        },
        cancelRequest(requestId) {
            const user = this.currentUser;
            const requests = this.getRequests();
            const request = requests.find((entry) =>
                entry.id === requestId
                && entry.requesterId === user.id
                && entry.status === "pending"
            );
            if (!request) {
                return { ok: false, reason: "Không tìm thấy yêu cầu đang chờ để hủy." };
            }
            request.status = "cancelled";
            return writeCollection(REQUESTS_KEY, requests)
                ? { ok: true }
                : { ok: false, reason: "Không thể lưu thay đổi. Hãy thử lại." };
        },
        updateRequestStatus(requestId, status) {
            const role = this.getCurrentRole();
            const user = this.currentUser;
            const allowedStatuses = ["accepted", "rejected", "in_progress", "completed"];
            if (!allowedStatuses.includes(status)) {
                return { ok: false, reason: "Trạng thái yêu cầu không hợp lệ." };
            }

            const originalRequests = this.getRequests();
            const requests = originalRequests.map((entry) => ({ ...entry }));
            const request = requests.find((entry) => entry.id === requestId);
            if (!request) {
                return { ok: false, reason: "Không tìm thấy yêu cầu." };
            }

            const isRepairRequest = request.method === "Cần sửa chữa";
            const isOwner = role === "owner" && request.ownerId === user.id && !isRepairRequest;
            const isPartner = role === "partner" && isRepairRequest
                && request.partnerId === user.id;
            if (!isOwner && !isPartner) {
                return { ok: false, reason: "Bạn không có quyền cập nhật yêu cầu này." };
            }

            const validTransition = status === "accepted" || status === "rejected"
                ? request.status === "pending"
                : status === "in_progress"
                    ? isPartner && request.status === "accepted"
                    : request.status === "accepted" || request.status === "in_progress";
            if (!validTransition) {
                return { ok: false, reason: "Không thể chuyển yêu cầu từ trạng thái hiện tại." };
            }

            const originalListings = this.getListings();
            const listings = originalListings.map((entry) => ({ ...entry }));
            let listingsChanged = false;

            request.status = status;
            request.updatedAt = new Date().toISOString();

            if (status === "accepted" && !isRepairRequest) {
                requests.forEach((otherRequest) => {
                    if (otherRequest.listingId === request.listingId
                        && otherRequest.id !== request.id
                        && otherRequest.status === "pending") {
                        otherRequest.status = "rejected";
                        otherRequest.updatedAt = new Date().toISOString();
                    }
                });
                const listing = listings.find((entry) => entry.id === request.listingId);
                if (listing) {
                    if (!["active", "repair"].includes(listing.status)) {
                        return { ok: false, reason: "Món đồ không còn nhận yêu cầu mới." };
                    }
                    listing.status = "reserved";
                    listingsChanged = true;
                }
            }

            if (status === "completed" && !isRepairRequest) {
                const listing = listings.find((entry) => entry.id === request.listingId);
                if (listing) {
                    listing.status = request.method === "Cho tặng" ? "donated" : "completed";
                    listingsChanged = true;
                }
            }

            if (!this.saveRequests(requests)) {
                return { ok: false, reason: "Không thể lưu trạng thái yêu cầu." };
            }
            if (listingsChanged && !this.saveListings(listings)) {
                const rolledBack = this.saveRequests(originalRequests);
                return {
                    ok: false,
                    reason: rolledBack
                        ? "Không thể lưu trạng thái món đồ; thay đổi yêu cầu đã được hủy."
                        : "Không thể lưu trạng thái món đồ và không thể khôi phục yêu cầu. Hãy tải lại để kiểm tra dữ liệu."
                };
            }
            return { ok: true };
        }
    });
})();
