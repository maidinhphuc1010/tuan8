# Báo cáo thực hành Tuần 8

## Triển khai
- Next.js App Router, TypeScript; NextAuth v4, GitHub OAuth và Credentials.
- Hai tài khoản demo được cấp qua biến môi trường. Mật khẩu băm scrypt với salt ngẫu nhiên; không lưu mật khẩu rõ. Chưa tích hợp database/đăng ký.
- GitHub luôn có vai trò user. Quyền Credentials lấy từ cấu hình máy chủ, không lấy từ form.
- Session và JWT được mở rộng kiểu id, role; phiên JWT hết hạn sau 1 giờ.

## Các lớp bảo vệ
```text
Request → Middleware (JWT, role cho /admin)
        → Server Page → requireRole() → getServerSession()
POST Server Action → requireRole('admin') → thao tác / redirect
```
Middleware không thay thế kiểm tra Server Action. Action mẫu xác minh quyền, không cập nhật dữ liệu. Trang /dashboard cho cả hai vai trò; /admin chỉ admin. Thiếu phiên chuyển đến đăng nhập; sai quyền chuyển /forbidden.

## SEO
Trang / và /about: title, description, canonical riêng, Open Graph và ảnh PNG /opengraph-image, JSON-LD WebPage. metadataBase lấy SITE_URL. HTML tiếng Việt; font hệ thống không tải font ngoài. Trang riêng có noindex.

## Kiểm chứng
- TypeScript: đã chạy tsc --noEmit thành công.
- ESLint: thành công sau khi sửa liên kết nội bộ.
- Production build: thành công, hai trang công khai prerender tĩnh.
- Build còn cảnh báo workspace có nhiều lockfile và lỗi tự vá SWC lockfile; không làm build thất bại trong môi trường hiện tại.
- OAuth thực tế chưa hoàn tất: cần người dùng đăng nhập/chấp thuận GitHub trên trình duyệt; không thay bằng mock hay tự nhận đã thành công.
- Đã chạy 6 kịch bản E2E bằng Playwright Chromium trên production server, thành công ở cả hai lần trước/sau: khách bị chặn ở trang riêng; mật khẩu sai không tạo session; user đăng nhập và bị chặn /admin; admin đăng nhập và thực hiện Server Action; replay POST Action bằng user bị Middleware chặn; đăng xuất xóa session.
- Test dùng email/mật khẩu/secret ngẫu nhiên hoặc riêng cho kiểm thử, truyền qua môi trường tiến trình, không sửa .env. Kết quả ở reports/before/e2e.json và reports/after/e2e.json.
- Chưa kiểm chứng độc lập nhánh từ chối của page/Server Action khi bỏ qua Middleware. POST thử trên route công khai trả 200 không chứng minh Action đã chạy, nên không tính là một ca bảo mật đạt.

## Lighthouse / PageSpeed
Đo thật bằng Lighthouse 13.5.0, Chromium Playwright, Mobile mặc định/simulated throttling, production localhost:3100. Mỗi trang 3 lượt, lấy trung vị từng nhóm. Báo cáo HTML/JSON từng lượt nằm trong reports/before và reports/after; scores.json chứa số liệu tổng hợp từng lượt. Đây là Lighthouse local, không phải PageSpeed Insights online.

| Trang | Performance trước → sau | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| / | 90 → 84 | 100 → 100 | 100 → 100 | 100 → 100 |
| /about | 86 → 86 | 100 → 100 | 100 → 100 | 100 → 100 |

Performance từng lượt: / trước [79,90,93], sau [85,84,82]; /about trước [86,89,81], sau [81,90,86]. Không có bằng chứng tăng Performance: trang chủ giảm trung vị 6 điểm, giới thiệu không đổi. Dao động môi trường local lớn; không kết luận quan hệ nhân quả chỉ từ phép đo này.

Mốc trước là mã hiện tại trước khi tắt prefetch /dashboard và /admin trên thanh điều hướng. Mốc sau chỉ thay đổi prefetch này. Cả hai mốc đều đã có SEO/NextAuth; KHÔNG phải so sánh trước/sau tích hợp ban đầu vì không còn baseline đầy đủ. Không tạo lại điểm lịch sử.

Chạy lại từ thư mục dự án: npm run build rồi node scripts/validate.mjs before hoặc node scripts/validate.mjs after. Cần cổng 3100 và 9222 trống; npx playwright install chromium để cài browser. Lệnh ghi đè báo cáo của phase tương ứng, nên sao lưu nếu cần giữ chứng cứ.

## Giới hạn trước production
Cần database, rate limiting dùng kho chia sẻ, kiểm thử bảo mật/E2E, cơ chế thu hồi phiên khi đổi quyền, và rà soát/cập nhật dependency lên bản vá được hỗ trợ. Không đưa bản demo này trực tiếp vào production.
