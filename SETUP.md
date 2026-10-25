# Chạy dự án

Thư mục: `C:\Users\DELL\Desktop\Tuan8\tuan8-app`.

1. Sao chép `.env.example` thành `.env.local`.
2. Tạo NEXTAUTH_SECRET bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. Tạo GitHub OAuth App, callback `http://localhost:3000/api/auth/callback/github`; điền GITHUB_ID và GITHUB_SECRET.
4. Đặt ADMIN_EMAIL, USER_EMAIL khác nhau. Trong PowerShell, đặt `$env:PASSWORD_TO_HASH = 'mat-khau-rieng-it-nhat-12-ky-tu'`, chạy `node scripts/hash-password.mjs`, chép kết quả vào ADMIN_PASSWORD_HASH. Làm tương tự với mật khẩu khác cho USER_PASSWORD_HASH. Xóa biến bằng `Remove-Item Env:PASSWORD_TO_HASH`. Không commit mật khẩu/secret.
5. `npm run build`, sau đó `npm start`; mở http://localhost:3000.
6. Khi deploy, cập nhật NEXTAUTH_URL, SITE_URL và callback OAuth theo domain HTTPS thật.

Kiểm tra: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

Ma trận kiểm thử thủ công:
- Khách: vào /dashboard hoặc /admin → đăng nhập.
- User Credentials/GitHub: /dashboard thành công, /admin → /forbidden.
- Admin Credentials: /admin thành công, nút xác minh Server Action thành công.
- Sai mật khẩu: không tạo phiên.
- Đăng xuất rồi truy cập lại trang riêng: yêu cầu đăng nhập.
- Kiểm tra source / và /about có canonical, og:image, application/ld+json.

Đọc REPORT.md để biết giới hạn kiểm chứng và tình trạng đo Lighthouse.
