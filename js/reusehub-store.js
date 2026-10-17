(function () {
    const LISTINGS_KEY = "reusehub-listings";
    const REQUESTS_KEY = "reusehub-requests";
    const CURRENT_USER = {
        id: "student-linh",
        name: "Linh Nguyễn",
        campus: "Khuôn viên trường"
    };

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
        currentUser: CURRENT_USER,
        getListings() {
            return normalizeListings(readCollection(LISTINGS_KEY, seedListings));
        },
        saveListings(listings) {
            return writeCollection(LISTINGS_KEY, listings);
        },
        getRequests() {
            return readCollection(REQUESTS_KEY, []);
        },
        createRequest(listingId, message) {
            const listing = this.getListings().find((entry) => entry.id === listingId);
            if (!listing || listing.ownerId === CURRENT_USER.id
                || (listing.status !== "active" && listing.status !== "repair")) {
                return { ok: false, reason: "Món đồ này hiện không nhận yêu cầu." };
            }

            const requests = this.getRequests();
            const existingRequest = requests.find((request) =>
                request.listingId === listingId
                && request.requesterId === CURRENT_USER.id
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
                requesterId: CURRENT_USER.id,
                requesterName: CURRENT_USER.name,
                message: String(message || "").trim(),
                status: "pending",
                createdAt: new Date().toISOString()
            });

            return writeCollection(REQUESTS_KEY, requests)
                ? { ok: true }
                : { ok: false, reason: "Không thể lưu yêu cầu. Hãy thử lại." };
        },
        cancelRequest(requestId) {
            const requests = this.getRequests();
            const request = requests.find((entry) =>
                entry.id === requestId
                && entry.requesterId === CURRENT_USER.id
                && entry.status === "pending"
            );
            if (!request) {
                return { ok: false, reason: "Không tìm thấy yêu cầu đang chờ để hủy." };
            }
            request.status = "cancelled";
            return writeCollection(REQUESTS_KEY, requests)
                ? { ok: true }
                : { ok: false, reason: "Không thể lưu thay đổi. Hãy thử lại." };
        }
    });
})();
