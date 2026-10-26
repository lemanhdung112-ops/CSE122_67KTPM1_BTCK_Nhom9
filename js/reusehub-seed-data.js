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
            image: "../assets/items/calculus-1.png",
            location: "Thư viện trung tâm"
        },
        {
            id: "shared-calculus-2",
            ownerId: "student-minh",
            ownerName: "Minh Trần",
            name: "Giáo trình Giải tích 2",
            category: "Sách",
            condition: "Còn tốt",
            method: "Cho tặng",
            description: "Sách còn nguyên vẹn, phù hợp cho sinh viên đang học Giải tích 2.",
            status: "active",
            age: "Hôm nay",
            icon: "📖",
            image: "../assets/items/calculus-2.png",
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
            image: "../assets/items/keyboard.png",
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
            image: "../assets/items/study-chair.png",
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
            image: "../assets/items/backpack.png",
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
            image: "../assets/items/desk-lamp.png",
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
            image: "../assets/items/calculator.png",
            location: "Khu nhà A"
        }
    ];

    window.ReUseHubSeedData = Object.freeze({
        LISTINGS_KEY,
        REQUESTS_KEY,
        ROLE_KEY,
        CURRENT_USER,
        DEMO_USERS,
        DEMO_SERVICES,
        seedListings
    });
})();
