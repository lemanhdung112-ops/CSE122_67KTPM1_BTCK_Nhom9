# ReUseHub — Tái sử dụng, cho tặng và sửa chữa đồ dùng

Website mô phỏng một nền tảng kết nối người có đồ, người nhận, điểm sửa chữa và quản trị viên trong cộng đồng trường học.

| Thông tin | Nội dung |
|---|---|
| Học phần | Phát triển ứng dụng Web cơ bản (CSE122), lớp học phần 67KTPM1 |
| Đề tài | BTL-34 — ReUseHub |
| Nhóm | Nhóm 9 |
| Sinh viên thực hiện | Lê Mạnh Dũng — lớp 67CNTT2 |
| Phạm vi | Frontend tĩnh, dữ liệu demo lưu trong trình duyệt |

## Cấu trúc repository

```text
.
├── admin/       # Kiểm duyệt tin, quản lý danh mục, báo cáo
├── css/         # CSS cho marketplace cũ và portal đa vai trò
├── html/        # Trang vào/chọn vai trò và marketplace cũ
├── js/          # Store demo, logic portal và marketplace
├── owner/       # Các màn hình người có đồ
├── partner/     # Các màn hình điểm sửa chữa/tái sử dụng
├── receiver/    # Các màn hình người nhận
├── README.md
├── BTL-34_reusehub-tai-su-dung-cho-tang-va-sua-chua-o-dung.md
└── Bao-cao-BTL-34-ReUseHub.docx
```

## Các màn hình

| Vai trò | Tệp | Chức năng |
|---|---|---|
| Bắt đầu | [`html/index.html`](html/index.html) | Chọn vai trò demo |
| Người có đồ | [`owner/owner-item-create.html`](owner/owner-item-create.html) | Tạo tin, nhận gợi ý mô tả và gửi duyệt |
| Người có đồ | [`owner/owner-my-items.html`](owner/owner-my-items.html) | Quản lý tin đăng và phản hồi yêu cầu |
| Người có đồ | [`owner/owner-reuse-options.html`](owner/owner-reuse-options.html) | Xem gợi ý phương án tái sử dụng |
| Người nhận | [`receiver/receiver-item-browse.html`](receiver/receiver-item-browse.html) | Tìm kiếm, lọc và khám phá đồ |
| Người nhận | [`receiver/receiver-item-detail.html`](receiver/receiver-item-detail.html) | Xem chi tiết và gửi yêu cầu |
| Người nhận | [`receiver/receiver-my-requests.html`](receiver/receiver-my-requests.html) | Theo dõi, sửa hoặc hủy yêu cầu đang chờ |
| Đối tác | [`partner/partner-service-management.html`](partner/partner-service-management.html) | Quản lý dịch vụ sửa chữa |
| Đối tác | [`partner/partner-intake-list.html`](partner/partner-intake-list.html) | Tiếp nhận và cập nhật ca sửa chữa |
| Đối tác | [`partner/partner-impact-dashboard.html`](partner/partner-impact-dashboard.html) | Theo dõi số liệu và tiến độ xử lý |
| Quản trị | [`admin/admin-category-management.html`](admin/admin-category-management.html) | Quản lý danh mục |
| Quản trị | [`admin/admin-listing-moderation.html`](admin/admin-listing-moderation.html) | Duyệt hoặc từ chối tin đăng |
| Quản trị | [`admin/admin-circularity-report.html`](admin/admin-circularity-report.html) | Xem báo cáo hoạt động |

Các trang [`html/browse.html`](html/browse.html), [`html/item-detail.html`](html/item-detail.html) và [`html/my-requests.html`](html/my-requests.html) là giao diện marketplace cũ; luồng đa vai trò hiện tại bắt đầu tại `html/index.html`.

## Chạy thử

1. Clone hoặc tải repository về máy.
2. Mở thư mục dự án bằng VS Code.
3. Dùng Live Server để mở `html/index.html`; hoặc mở tệp này trực tiếp bằng trình duyệt.
4. Chọn một vai trò để vào các màn hình tương ứng.

Không cần cài package hay chạy backend. JavaScript và `localStorage` cần được bật trong trình duyệt. Dữ liệu được lưu theo origin; đổi trình duyệt, thiết bị hoặc địa chỉ chạy có thể không dùng chung dữ liệu.

## Luồng demo đề xuất

```text
Người có đồ tạo tin
→ Quản trị viên kiểm duyệt
→ Người nhận tìm đồ và gửi yêu cầu
→ Người có đồ hoặc đối tác cập nhật xử lý
→ Xem trạng thái và báo cáo
```

Để bắt đầu nhanh, mở `html/index.html`, sau đó thử các trang trong bảng màn hình. Mỗi vai trò có thể được mở trực tiếp bằng tệp HTML tương ứng.

## Cấu trúc xử lý

| Tệp | Vai trò |
|---|---|
| `js/reusehub-store.js` | Dữ liệu mẫu, thao tác nghiệp vụ và lưu/đọc dữ liệu từ `localStorage` |
| `js/portal.js` | Logic dùng chung cho các màn hình đa vai trò |
| `css/portal.css` | Giao diện dùng chung của portal |
| `js/script.js` | Tương tác cho trang vào và marketplace cũ |
| `js/marketplace.js` | Tương tác của các trang marketplace cũ |
| `css/style.css` | Kiểu dáng cho trang vào và marketplace cũ |

Các trang trong `admin/`, `owner/`, `partner/` và `receiver/` dùng `portal.css` và `portal.js`; một số trang có thêm CSS hoặc phần hiển thị riêng được nhúng trong HTML.

## Dữ liệu và giới hạn

- Website sử dụng dữ liệu demo phía trình duyệt, gồm tin đăng, yêu cầu, dịch vụ, danh mục và vai trò demo.
- Chọn vai trò chỉ giúp trình diễn các luồng giao diện; không có đăng nhập thật hoặc cơ chế phân quyền an toàn.
- Các nội dung gợi ý mang nhãn AI được mô phỏng bằng quy tắc JavaScript; website chưa gọi API AI.
- Không có backend, cơ sở dữ liệu máy chủ hoặc đồng bộ dữ liệu giữa người dùng/thiết bị.

## GitHub Pages

Repository không có `index.html` ở thư mục gốc; trang bắt đầu nằm tại `html/index.html`. Nếu bật GitHub Pages từ nhánh `main` và thư mục `/(root)`, mở trang tại đường dẫn `/html/` của website Pages, không phải đường dẫn gốc. Ví dụ URL sau khi triển khai:

`https://github.com/lemanhdung112-ops/CSE122_67KTPM1_BTCK_Nhom9`

Thiết lập tại **Repository → Settings → Pages → Build and deployment**: chọn **Deploy from a branch**, branch **`main`**, folder **`/(root)`**. URL trên chỉ hoạt động sau khi Pages được bật và triển khai thành công.
