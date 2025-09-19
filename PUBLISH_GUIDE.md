# Hướng dẫn Deploy JSON Viewer React lên NPM

## 📋 Checklist trước khi publish

- ✅ Package.json đã được chuẩn bị
- ✅ Build thành công (dist/ folder có sẵn)
- ✅ README.md chi tiết đã tạo
- ✅ LICENSE file đã tạo
- ⏳ Cần đăng nhập npm
- ⏳ Cần publish package

## 🔐 Bước 1: Đăng nhập NPM

### Nếu bạn chưa có tài khoản NPM:
1. Truy cập https://www.npmjs.com/signup
2. Tạo tài khoản mới
3. Xác nhận email

### Đăng nhập vào NPM:
```bash
npm login
```

Hoặc nếu bạn sử dụng 2FA:
```bash
npm login --auth-type=web
```

Nhập thông tin:
- Username: tên đăng nhập npm của bạn
- Password: mật khẩu
- Email: email đã đăng ký
- OTP (nếu có 2FA): mã xác thực

### Kiểm tra đăng nhập:
```bash
npm whoami
```

## 📦 Bước 2: Kiểm tra package trước khi publish

### Kiểm tra files sẽ được publish:
```bash
npm pack --dry-run
```

### Kiểm tra package size:
```bash
npm pack
ls -la *.tgz
```

### Test package locally:
```bash
# Tạo symlink để test
npm link

# Trong project khác để test
npm link @your-scope/json-viewer-react
```

## 🚀 Bước 3: Publish package

### Publish lần đầu:
```bash
npm publish --access public
```

**Lưu ý:** Vì package có scope (@your-scope/), cần thêm `--access public` để publish công khai.

### Nếu gặp lỗi về tên package đã tồn tại:
1. Thay đổi tên trong package.json:
```json
{
  "name": "@your-username/json-viewer-react"
}
```

2. Hoặc sử dụng tên khác:
```json
{
  "name": "@your-username/react-json-tree-viewer"
}
```

## 🔄 Bước 4: Update version cho lần publish tiếp theo

### Tăng version:
```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

### Publish version mới:
```bash
npm publish
```

## 📊 Bước 5: Kiểm tra package đã publish

### Kiểm tra trên NPM:
```bash
npm view @your-scope/json-viewer-react
```

### Truy cập trang NPM:
https://www.npmjs.com/package/@your-scope/json-viewer-react

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **Package name đã tồn tại:**
   - Thay đổi tên package trong package.json
   - Sử dụng scope với username của bạn

2. **Cần đăng nhập:**
   ```bash
   npm login
   ```

3. **Lỗi 2FA:**
   ```bash
   npm login --auth-type=web
   ```

4. **Package private:**
   ```bash
   npm publish --access public
   ```

5. **Version đã tồn tại:**
   ```bash
   npm version patch
   npm publish
   ```

## 📝 Các lệnh hữu ích

```bash
# Xem thông tin package
npm view @your-scope/json-viewer-react

# Xem tất cả versions
npm view @your-scope/json-viewer-react versions --json

# Unpublish (chỉ trong 72h đầu)
npm unpublish @your-scope/json-viewer-react@1.0.0

# Deprecate version
npm deprecate @your-scope/json-viewer-react@1.0.0 "Please use version 1.0.1"
```

## 🎉 Sau khi publish thành công

1. **Cập nhật README.md** với tên package chính xác
2. **Test cài đặt** từ npm:
   ```bash
   npm install @your-scope/json-viewer-react
   ```
3. **Chia sẻ** package với cộng đồng
4. **Tạo GitHub release** nếu có repository

## 📈 Theo dõi package

- **NPM Stats:** https://www.npmjs.com/package/@your-scope/json-viewer-react
- **Download stats:** https://npmcharts.com/compare/@your-scope/json-viewer-react
- **Bundle size:** https://bundlephobia.com/package/@your-scope/json-viewer-react

---

**Lưu ý quan trọng:** 
- Tên package phải unique trên NPM
- Không thể unpublish sau 72h
- Luôn test kỹ trước khi publish
- Sử dụng semantic versioning (semver)