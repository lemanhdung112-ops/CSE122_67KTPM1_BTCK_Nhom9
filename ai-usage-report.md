# Báo cáo sử dụng AI – ReUseHub (BTL-34, CSE122, Nhóm 9)

Sinh viên: Lê Mạnh Dũng – MSV 2551060603 – lớp 67CNTT2.

## 1. Công cụ AI đã dùng
- Claude (Anthropic): hỗ trợ giải thích yêu cầu đề/barem, rà soát mã, soạn kịch bản video, báo cáo và tài liệu ôn tập.
- Trợ lý AI trong VS Code (agent): hỗ trợ đọc mã, sửa lỗi và chỉnh tài liệu trong repo.
- Gemini: hỗ trợ soạn thảo kịch bản quay video OBS
- Figma: thiết kế ra bản phác thảo bài tập lớn, là tiền đề để nhóm làm ra sản phẩm từ html, css và js.

## 2. Câu lệnh (prompt) chính
- Yêu cầu phân tích đề BTL-34 và lập bảng kiểm kê màn hình cho 12 giao diện.
- Yêu cầu dựng khung portal đa vai trò (portal.js, reusehub-store.js) và các màn hình theo vai trò.
- Yêu cầu rà soát lỗi: dữ liệu mock, lỗi hiển thị, kiểm tra quyền, trạng thái rỗng/đang tải/lỗi.
- Yêu cầu soạn báo cáo, README và kịch bản quay video OBS.

## 3. Phần AI sinh ra
- Bản nháp mã cho các hàm hiển thị theo vai trò, hàm AI mô phỏng, các hàm trong store.
- Bản nháp tài liệu: báo cáo Word, README, kịch bản video, bộ câu hỏi ôn.

## 4. Phần sinh viên chỉnh sửa và tự làm
- Chạy thử toàn bộ luồng owner → admin → receiver trên trình duyệt, báo lỗi và yêu cầu sửa.
- Đọc và giải thích được cấu trúc `reusehub-store.js`, `portal.js` và các hàm render.
- Tự gõ, chạy thử phần chỉnh sửa trực tiếp trong video (ví dụ: bộ đếm ký tự, đếm tin chờ duyệt, sắp xếp danh sách).
- Tự quyết định phạm vi, chọn trang quay và hoàn thiện thiết kế Canva/Figma. (Sửa lại cho đúng phần bạn thật sự đã làm.)

## 5. Lỗi AI gặp phải
- AI từng đọc nhầm bản mã cũ nên nhận xét lỗi đã được sửa.
- Một số gợi ý chưa chạy thử nên phải kiểm tra lại trước khi dùng.
- Tài liệu do AI nháp từng để trống thông tin cá nhân hoặc ghi chưa sát hiện trạng, phải đối chiếu lại với mã.

## 6. Cách sinh viên kiểm chứng
- Mở site bằng Live Server, bấm đủ các luồng, kiểm tra console (F12) không lỗi.
- Đối chiếu hàm với mã nguồn thật, thử các trường hợp rỗng, nhập sai, gửi trùng.
- Kiểm tra responsive bằng chế độ thiết bị của trình duyệt.

## 7. Điều sinh viên học được
- Cách chia ứng dụng thành vai trò, màn hình, kho dữ liệu dùng chung.
- DOM, sự kiện, event delegation, form validation, localStorage, filter/sort.
- Thiết kế trạng thái giao diện (rỗng, đang tải, lỗi, thành công) và trải nghiệm AI có kiểm soát.
- Không tin AI tuyệt đối: phải đọc, chạy và kiểm chứng.

## 8. Mock và API thật
- Toàn bộ tính năng AI (AI-1 gợi ý phương án, AI-2 mô tả, AI-3 ghép món/ca) là MÔ PHỎNG bằng quy tắc JavaScript.
- Không có API AI thật, không có backend; dữ liệu lưu trong localStorage của trình duyệt.
