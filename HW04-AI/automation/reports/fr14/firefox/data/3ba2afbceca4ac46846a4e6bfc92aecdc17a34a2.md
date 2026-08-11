# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14-category-management.spec.js >> FR-14 Category management >> FR14-AUTO-009 Category text is rendered safely >> FR14-AUTO-009-02 Script payload
- Location: tests\fr14-category-management.spec.js:25:9

# Error details

```
Error: browserContext.close: Protocol error (Browser.removeBrowserContext): can't access property "_maybeDontRestoreTabs", this._windows[aWindow.__SSi] is undefined
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - heading "EShop Admin" [level=1] [ref=e5]
    - list [ref=e6]:
      - listitem [ref=e7] [cursor=pointer]: Dashboard
      - listitem [ref=e8] [cursor=pointer]: Danh mục
      - listitem [ref=e9] [cursor=pointer]: Sản phẩm
      - listitem [ref=e10] [cursor=pointer]: Mã Giảm Giá
      - listitem [ref=e11] [cursor=pointer]: Đơn hàng
      - listitem [ref=e12] [cursor=pointer]: Người dùng
      - listitem [ref=e13] [cursor=pointer]: Đăng xuất
  - generic [ref=e15]:
    - heading "Quản lý Danh mục" [level=2] [ref=e16]
    - generic [ref=e17]:
      - textbox "Tên danh mục mới" [ref=e18]
      - button "Thêm mới" [active] [ref=e19] [cursor=pointer]
    - table [ref=e20]:
      - rowgroup [ref=e21]:
        - row [ref=e22]:
          - columnheader "ID" [ref=e23]
          - columnheader "Tên Danh Mục" [ref=e24]
          - columnheader "Hành động" [ref=e25]
      - rowgroup [ref=e26]:
        - row [ref=e27]:
          - cell "#801" [ref=e28]
          - cell "<script>alert(1)</script>" [ref=e29]
          - cell [ref=e30]:
            - button "Xóa" [ref=e31] [cursor=pointer]
```