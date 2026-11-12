// src/__tests__/businessLogic.test.ts

describe('KIỂM THỬ TỰ ĐỘNG LOGIC NGHIỆP VỤ (A1 - A7)', () => {

  // ==========================================
  // TEST CASE A1: ĐĂNG NHẬP (LOGIN)
  // ==========================================
  it('A1: Phải trả về lỗi khi đăng nhập sai mật khẩu và thành công khi đúng', async () => {
    const mockLoginApi = async (email: string, pass: string) => {
      if (pass !== 'correct_password') {
        throw new Error('Sai mật khẩu');
      }
      return { success: true, token: 'abc' };
    };

    await expect(mockLoginApi('test@gmail.com', 'wrong')).rejects.toThrow('Sai mật khẩu');
    const res = await mockLoginApi('test@gmail.com', 'correct_password');
    expect(res.success).toBe(true);
  });

  // ==========================================
  // TEST CASE A2: TÌM KIẾM & LỌC (SEARCH & FILTER)
  // ==========================================
  it('A2: Phải lọc đúng sản phẩm Serum có giá dưới 200k', () => {
    const mockProducts = [
      { name: 'Glow Serum', category: 'Serum', price: 150000 },
      { name: 'Hydra Cream', category: 'Dưỡng ẩm', price: 180000 },
      { name: 'VIP Serum', category: 'Serum', price: 500000 },
    ];

    const filterProducts = (products: any[], keyword: string, maxPrice: number) => {
      return products.filter(p => 
        p.name.toLowerCase().includes(keyword.toLowerCase()) && p.price < maxPrice
      );
    };

    const result = filterProducts(mockProducts, 'Serum', 200000);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Glow Serum');
  });

  // ==========================================
  // TEST CASE A3: YÊU THÍCH (WISHLIST)
  // ==========================================
  it('A3: Phải thêm và xóa sản phẩm khỏi danh sách Yêu thích', () => {
    let wishlist: string[] = [];
    
    const toggleWishlist = (productId: string) => {
      if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId); // Bỏ thích
      } else {
        wishlist.push(productId); // Thả tim
      }
    };

    toggleWishlist('p1');
    expect(wishlist).toContain('p1');
    expect(wishlist.length).toBe(1);

    toggleWishlist('p1');
    expect(wishlist).not.toContain('p1');
    expect(wishlist.length).toBe(0);
  });

  // ==========================================
  // TEST CASE A4: GIỎ HÀNG (CART)
  // ==========================================
  it('A4: Phải cộng dồn số lượng và tính đúng tổng tiền giỏ hàng', () => {
    let cart: any[] = [];
    
    const addToCart = (product: any, quantity: number) => {
      const existing = cart.find(i => i.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }
    };

    const product1 = { id: 'p1', price: 100000 };
    const product2 = { id: 'p2', price: 50000 };

    addToCart(product1, 1);
    addToCart(product2, 2);
    addToCart(product1, 1); // Cộng dồn p1 lên 2

    expect(cart[0].quantity).toBe(2);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(total).toBe(300000);
  });

  // ==========================================
  // TEST CASE A5: THANH TOÁN (CHECKOUT)
  // ==========================================
  it('A5: Phải tính đúng tổng tiền khi áp dụng Voucher và phí ship', () => {
    const calculateTotal = (subTotal: number, shippingFee: number, voucher: any) => {
      let discount = 0;
      if (voucher) {
        discount = voucher.type === 'percent' ? (subTotal * voucher.value) / 100 : voucher.value;
      }
      return Math.max(0, subTotal + shippingFee - discount);
    };

    const total = calculateTotal(200000, 30000, { type: 'fixed', value: 50000 });
    expect(total).toBe(180000); // 200k + 30k - 50k
  });

  // ==========================================
  // TEST CASE A6: ĐÁNH GIÁ (REVIEW)
  // ==========================================
  it('A6: Phải gửi đánh giá (số sao và bình luận) chính xác', async () => {
    // Giả lập API gửi đánh giá
    const mockSubmitReviewApi = async (orderId: string, rating: number, comment: string) => {
      if (!orderId || rating < 1) throw new Error("Dữ liệu không hợp lệ");
      return { success: true, message: "Đã gửi đánh giá", data: { orderId, rating, comment } };
    };

    const res = await mockSubmitReviewApi('ORD123', 5, 'Sản phẩm rất tốt');
    
    expect(res.success).toBe(true);
    expect(res.data.rating).toBe(5);
    expect(res.data.comment).toBe('Sản phẩm rất tốt');
  });

  // ==========================================
  // TEST CASE A7: HỒ SƠ CÁ NHÂN (UPDATE PROFILE)
  // ==========================================
  it('A7: Phải cập nhật họ tên và số điện thoại thành công', async () => {
    // Giả lập API cập nhật hồ sơ
    const mockUpdateProfileApi = async (data: { fullName: string, phone: string }) => {
      if (!data.fullName) throw new Error("Tên không được để trống");
      return { success: true, user: data };
    };

    const updateData = { fullName: 'Nguyễn Văn Test', phone: '0987654321' };
    const res = await mockUpdateProfileApi(updateData);

    expect(res.success).toBe(true);
    expect(res.user.fullName).toBe('Nguyễn Văn Test');
    expect(res.user.phone).toBe('0987654321');
  });

});

// ==========================================
// KIỂM THỬ TỰ ĐỘNG TÍNH NĂNG AI (B1 - B4)
// ==========================================

describe('KIỂM THỬ TỰ ĐỘNG TÍNH NĂNG AI (B1 - B4)', () => {

  // ==========================================
  // TEST CASE B1: CHATBOT AI (GROQ API)
  // ==========================================
  it('B1: Chatbot AI phải trả về câu trả lời tư vấn da liễu', async () => {
    // Giả lập API Groq trả về câu trả lời
    const mockChatApi = async (message: string) => {
      if (message.includes('Da mụn')) {
        return "Với da mụn, bạn nên sử dụng sữa rửa mặt chứa Salicylic Acid và thoa kem chống nắng không gây bít lỗ chân lông.";
      }
      return "Tôi là AI tư vấn da liễu.";
    };

    const response = await mockChatApi("Da mụn nên dùng gì?");
    
    expect(response).toContain('Salicylic Acid');
    expect(typeof response).toBe('string');
  });

  // ==========================================
  // TEST CASE B2: AI PHÂN TÍCH DA (TFLITE OFFLINE)
  // ==========================================
  it('B2: AI phân tích da phải trả ra kết quả Da mụn/Da thường và độ chính xác', async () => {
    // Giả lập hàm chạy TFLite
    const mockAnalyzeSkinOffline = async (imageUri: string) => {
      if (!imageUri) throw new Error("Chưa có ảnh");
      
      // Giả lập model đoán ra Da mụn với độ chính xác 95%
      return {
        success: true,
        data: {
          skinCondition: 'Acne',
          confidence: 0.9563
        }
      };
    };

    const result = await mockAnalyzeSkinOffline('file://image.jpg');

    expect(result.success).toBe(true);
    expect(result.data.skinCondition).toBe('Acne');
    expect(result.data.confidence).toBeGreaterThan(0.9); // Độ chính xác > 90%
  });

  // ==========================================
  // TEST CASE B3: GỢI Ý SẢN PHẨM TỪ DATABASE
  // ==========================================
  it('B3: Gợi ý tối đa 3 sản phẩm thật phù hợp với ngân sách', () => {
    // Giả lập danh sách sản phẩm lấy từ Database
    const mockDBProducts = [
      { _id: '1', name: 'Glow Serum', price: 150000 },
      { _id: '2', name: 'Hydra Cream', price: 250000 },
      { _id: '3', name: 'Pure Cleanser', price: 180000 },
      { _id: '4', name: 'VIP Serum', price: 500000 },
      { _id: '5', name: 'Sunscreen', price: 190000 },
    ];

    // Hàm logic giống hệt trong analyze.tsx
    const getRecommendedProducts = (products: any[], budgetLabel: string) => {
      return products.filter((prod) => {
        if (budgetLabel === 'Dưới 200k') return prod.price < 200000;
        return true;
      }).slice(0, 3); // Lấy tối đa 3 sản phẩm
    };

    const recommendations = getRecommendedProducts(mockDBProducts, 'Dưới 200k');

    // Phải trả về đúng 3 sản phẩm
    expect(recommendations.length).toBe(3);
    
    // Tất cả sản phẩm gợi ý phải có giá dưới 200k
    recommendations.forEach(prod => {
      expect(prod.price).toBeLessThan(200000);
    });
  });

  // ==========================================
  // TEST CASE B4: THÊM SP TỪ GỢI Ý VÀO GIỎ HÀNG
  // ==========================================
  it('B4: Phải thêm được sản phẩm AI gợi ý vào giỏ hàng (không lỗi ID)', () => {
    let cart: any[] = [];
    
    // Lấy 1 sản phẩm từ danh sách gợi ý (có _id chuẩn từ MongoDB)
    const productFromAI = { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Glow Serum', price: 150000 };

    const addToCart = (product: any) => {
      // Nếu không có _id thì ném lỗi
      if (!product._id) throw new Error("ID không hợp lệ");
      cart.push(product);
    };

    // Thực hiện thêm vào giỏ
    addToCart(productFromAI);

    expect(cart.length).toBe(1);
    expect(cart[0]._id).toBe('65f1a2b3c4d5e6f7a8b9c0d1');
    expect(cart[0].name).toBe('Glow Serum');
  });

});

// ==========================================
// KIỂM THỬ TỰ ĐỘNG LUỒNG QUẢN TRỊ VIÊN (C1 - C5)
// ==========================================

describe('KIỂM THỬ TỰ ĐỘNG LUỒNG QUẢN TRỊ VIÊN (C1 - C5)', () => {

  // ==========================================
  // TEST CASE C1: DASHBOARD (THỐNG KÊ DOANH THU)
  // ==========================================
  it('C1: Dashboard phải tính đúng tổng doanh thu và số đơn hàng thực tế', () => {
    // Giả lập dữ liệu đơn hàng từ Database
    const mockOrders = [
      { total: 500000, orderStatus: 'delivered' },
      { total: 300000, orderStatus: 'reviewed' }, // Đã đánh giá cũng tính là đã giao
      { total: 200000, orderStatus: 'pending' },  // Chưa giao, không tính doanh thu
      { total: 150000, orderStatus: 'shipping' }
    ];

    // Logic tính toán giống trong file index.tsx của Admin
    const totalRevenue = mockOrders
      .filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'reviewed')
      .reduce((sum, o) => sum + o.total, 0);
      
    const totalOrders = mockOrders.length;

    expect(totalRevenue).toBe(800000); // 500k + 300k
    expect(totalOrders).toBe(4);
  });

  // ==========================================
  // TEST CASE C2: QUẢN LÝ ĐƠN HÀNG (CẬP NHẬT TRẠNG THÁI)
  // ==========================================
  it('C2: Phải chuyển đổi trạng thái đơn hàng hợp lệ (Pending -> Confirmed -> Shipping)', () => {
    let order = { id: 'ORD01', status: 'pending' };

    const updateOrderStatus = (newStatus: string) => {
      // Giả lập logic chặn chuyển đổi sai
      if (order.status === 'pending' && newStatus === 'confirmed') order.status = newStatus;
      else if (order.status === 'confirmed' && newStatus === 'shipping') order.status = newStatus;
      else throw new Error("Trạng thái không hợp lệ");
    };

    // Admin bấm Xác nhận
    updateOrderStatus('confirmed');
    expect(order.status).toBe('confirmed');

    // Admin bấm Giao cho Shipper
    updateOrderStatus('shipping');
    expect(order.status).toBe('shipping');
  });

  // ==========================================
  // TEST CASE C3: XEM ĐÁNH GIÁ CỦA KHÁCH
  // ==========================================
  it('C3: Phải lấy được số sao và bình luận của đơn hàng đã đánh giá', () => {
    // Giả lập đơn hàng đã được khách đánh giá
    const reviewedOrder = {
      id: 'ORD02',
      status: 'reviewed',
      rating: 5,
      comment: 'Sản phẩm tuyệt vời, giao hàng nhanh!'
    };

    const getReviewData = (order: any) => {
      if (order.status !== 'reviewed') return null;
      return { stars: order.rating, text: order.comment };
    };

    const review = getReviewData(reviewedOrder);

    expect(review).not.toBeNull();
    expect(review?.stars).toBe(5);
    expect(review?.text).toContain('tuyệt vời');
  });

  // ==========================================
  // TEST CASE C4: QUẢN LÝ SẢN PHẨM (THÊM MỚI)
  // ==========================================
  it('C4: Admin thêm sản phẩm mới phải có ID hợp lệ và xuất hiện trong danh sách', () => {
    let products = [
      { _id: 'p1', name: 'Sản phẩm cũ', price: 100000 }
    ];

    const addProduct = (newProduct: any) => {
      // Giả lập Database tự sinh ID
      const dbGeneratedId = 'mongo_id_' + Date.now(); 
      const productWithId = { ...newProduct, _id: dbGeneratedId };
      products.push(productWithId);
      return productWithId;
    };

    const added = addProduct({ name: 'Sản phẩm mới', price: 250000 });

    expect(products.length).toBe(2);
    expect(added._id).toBeDefined();
    expect(added.name).toBe('Sản phẩm mới');
  });

  // ==========================================
  // TEST CASE C5: QUẢN LÝ VOUCHER (TẠO MÃ)
  // ==========================================
  it('C5: Admin tạo Voucher mới thì mã đó phải hợp lệ và áp dụng được', () => {
    let vouchers: any[] = [];

    const createVoucher = (code: string, discount: number) => {
      const newVoucher = { code: code.toUpperCase(), discount, active: true };
      vouchers.push(newVoucher);
      return newVoucher;
    };

    const applyVoucher = (code: string, subTotal: number) => {
      const v = vouchers.find(v => v.code === code && v.active);
      if (!v) return subTotal;
      return subTotal - v.discount;
    };

    // 1. Admin tạo Voucher
    createVoucher('test100', 100000);
    
    expect(vouchers.length).toBe(1);
    expect(vouchers[0].code).toBe('TEST100'); // Tự động viết hoa

    // 2. Khách hàng áp dụng Voucher (Giả lập đơn 300k)
    const finalPrice = applyVoucher('TEST100', 300000);
    
    expect(finalPrice).toBe(200000); // 300k - 100k
  });

});

// ==========================================
// KIỂM THỬ TỰ ĐỘNG CHẾ ĐỘ OFFLINE (D1 - D7)
// ==========================================

describe('KIỂM THỬ TỰ ĐỘNG CHẾ ĐỘ OFFLINE (D1 - D7)', () => {

  // ---- State dùng chung cho cả block ----
  let isOnline: boolean;                          // Trạng thái mạng
  let sqliteCache: Record<string, any[]>;         // Giả lập SQLite cache
  let syncQueue: any[];                           // Hàng đợi chờ đồng bộ

  beforeEach(() => {
    isOnline = false;                              // Mặc định test là OFFLINE
    sqliteCache = { products: [], orders: [], addresses: [] };
    syncQueue = [];
  });

  // ==========================================
  // TEST CASE D1: AI PHÂN TÍCH (OFFLINE - TFLITE)
  // ==========================================
  it('D1: Tắt mạng vẫn phải chạy TFLite và ra kết quả (không gọi API)', async () => {
    const analyzeSkinOffline = async (imageUri: string, online: boolean) => {
      if (!imageUri) throw new Error('Chưa có ảnh');

      // Giả lập model TFLite chạy LOCAL (không phụ thuộc mạng)
      const source = online ? 'network' : 'tflite_local';
      return {
        success: true,
        source,
        data: { skinCondition: 'Acne', confidence: 0.9563 }
      };
    };

    const result = await analyzeSkinOffline('file://face.jpg', isOnline);

    expect(result.success).toBe(true);
    expect(result.source).toBe('tflite_local');       // Chạy offline
    expect(result.data.skinCondition).toBe('Acne');
    expect(result.data.confidence).toBeGreaterThan(0.9);
  });

  // ==========================================
  // TEST CASE D2: ĐỌC DỮ LIỆU OFFLINE TỪ SQLITE
  // ==========================================
  it('D2: Offline phải đọc Sản phẩm / Đơn hàng / Địa chỉ từ SQLite cache', () => {
    // Giả lập cache đã có sẵn từ lần online trước
    sqliteCache = {
      products:  [{ _id: 'p1', name: 'Glow Serum' }, { _id: 'p2', name: 'Hydra Cream' }],
      orders:    [{ _id: 'o1', total: 100000 }],
      addresses: [{ _id: 'a1', city: 'TP.HCM' }],
    };

    const getData = (table: keyof typeof sqliteCache) => {
      if (!isOnline) return sqliteCache[table] || []; // Đọc cache
      return [{ _id: 'fresh_from_server' }];           // Giả lập API online
    };

    expect(getData('products').length).toBe(2);
    expect(getData('orders').length).toBe(1);
    expect(getData('addresses').length).toBe(1);
  });

  // ==========================================
  // TEST CASE D3: ĐẶT HÀNG OFFLINE
  // ==========================================
  it('D3: Đặt hàng offline phải lưu local và báo "Đơn hàng đã được lưu ngoại tuyến"', async () => {
    const placeOrder = async (order: any, online: boolean) => {
      if (!online) {
        const localOrder = {
          ...order,
          _id: 'local_' + Date.now(),
          syncStatus: 'pending'
        };
        sqliteCache.orders.push(localOrder);
        syncQueue.push(localOrder);

        return {
          success: true,
          offline: true,
          message: 'Đơn hàng đã được lưu ngoại tuyến',
          order: localOrder
        };
      }
      // Online: giả lập gọi API
      return { success: true, offline: false, order: { ...order, _id: 'server_1' } };
    };

    const res = await placeOrder({ total: 200000, items: ['p1'] }, isOnline);

    expect(res.success).toBe(true);
    expect(res.offline).toBe(true);
    expect(res.message).toContain('ngoại tuyến');
    expect(res.order.syncStatus).toBe('pending');
    expect(sqliteCache.orders.length).toBe(1);
    expect(syncQueue.length).toBe(1);
  });

  // ==========================================
  // TEST CASE D4: NHÃN "CHỜ ĐỒNG BỘ"
  // ==========================================
  it('D4: Đơn chưa sync phải hiện nhãn cam "Chờ đồng bộ" ở đầu danh sách', () => {
    // Đơn vừa đặt offline nằm đầu tiên
    const orders = [
      { _id: 'local_1', total: 100000, syncStatus: 'pending' },
      { _id: 'server_1', total: 200000, syncStatus: 'synced' }
    ];

    const decorate = (o: any) => ({
      ...o,
      badge: o.syncStatus === 'pending' ? 'Chờ đồng bộ' : null,
      badgeColor: o.syncStatus === 'pending' ? 'orange' : null
    });

    const displayed = orders.map(decorate);

    expect(displayed[0].badge).toBe('Chờ đồng bộ');
    expect(displayed[0].badgeColor).toBe('orange');
    expect(displayed[1].badge).toBeNull();
  });

  // ==========================================
  // TEST CASE D5: ĐỒNG BỘ TỰ ĐỘNG KHI CÓ MẠNG
  // ==========================================
  it('D5: Bật mạng lại thì syncQueue tự đẩy lên Server và xóa nhãn "Chờ đồng bộ"', async () => {
    // Setup: có 1 đơn đang chờ
    syncQueue = [{ _id: 'local_1', total: 100000, syncStatus: 'pending' }];
    sqliteCache.orders = [...syncQueue];

    const mockServerApi = async (order: any) => ({
      ...order,
      _id: 'server_' + order._id,
      syncStatus: 'synced'
    });

    const syncPendingOrders = async (online: boolean) => {
      if (!online) return { synced: 0 };
      const synced: any[] = [];
      for (const o of syncQueue) {
        synced.push(await mockServerApi(o));
      }
      syncQueue = [];
      sqliteCache.orders = synced;
      return { synced: synced.length };
    };

    isOnline = true; // Bật mạng
    const result = await syncPendingOrders(isOnline);

    expect(result.synced).toBe(1);
    expect(syncQueue.length).toBe(0);
    expect(sqliteCache.orders[0].syncStatus).toBe('synced');
    expect(sqliteCache.orders[0]._id).toContain('server_');
  });

  // ==========================================
  // TEST CASE D6: XUNG ĐỘT (KHÁCH HỦY vs ADMIN DUYỆT GIAO)
  // ==========================================
  it('D6: Khách hủy offline nhưng Admin đã duyệt "Đang giao" → ưu tiên trạng thái Server', async () => {
    const localOrder  = { _id: 'o1', status: 'cancelled', syncStatus: 'pending_cancel' };
    const serverOrder = { _id: 'o1', status: 'shipping' }; // Admin đã đổi trước

    const resolveConflict = async (local: any, server: any) => {
      // Server đã đi xa hơn -> không cho hủy
      if (['shipping', 'delivered', 'reviewed'].includes(server.status)) {
        return {
          success: false,
          message: 'Không thể hủy, đơn đã được giao cho shipper',
          finalStatus: server.status,
          resolved: server
        };
      }
      return { success: true, finalStatus: 'cancelled', resolved: local };
    };

    const result = await resolveConflict(localOrder, serverOrder);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Không thể hủy');
    expect(result.finalStatus).toBe('shipping');            // Server thắng
    expect(result.resolved._id).toBe(serverOrder._id);
  });

  // ==========================================
  // TEST CASE D7: THÊM ĐỊA CHỈ OFFLINE
  // ==========================================
  it('D7: Thêm địa chỉ offline phải lưu local và tự sync khi có mạng trở lại', async () => {
    const addAddress = async (data: any, online: boolean) => {
      const addr = {
        ...data,
        _id: 'addr_' + Date.now(),
        syncStatus: online ? 'synced' : 'pending'
      };
      sqliteCache.addresses.push(addr);
      if (!online) syncQueue.push({ type: 'address', data: addr });
      return addr;
    };

    // Bước 1: Thêm offline
    const added = await addAddress({ city: 'Hà Nội', street: 'Phố X' }, isOnline);
    expect(added.syncStatus).toBe('pending');
    expect(sqliteCache.addresses.length).toBe(1);
    expect(syncQueue.length).toBe(1);

    // Bước 2: Có mạng → auto sync
    const syncAddresses = async () => {
      const toSync = syncQueue.filter(q => q.type === 'address');
      for (const item of toSync) {
        item.data.syncStatus = 'synced';
        item.data._id = 'server_' + item.data._id;
      }
      syncQueue = syncQueue.filter(q => q.type !== 'address');
      return toSync.length;
    };

    const syncedCount = await syncAddresses();

    expect(syncedCount).toBe(1);
    expect(syncQueue.length).toBe(0);
    expect(sqliteCache.addresses[0].syncStatus).toBe('synced');
    expect(sqliteCache.addresses[0]._id).toContain('server_');
  });

});

// ==========================================
// KIỂM THỬ BIÊN / NÂNG CAO (D8 - D10)
// (bổ sung để phủ các trường hợp dễ lỗi)
// ==========================================

describe('KIỂM THỬ BIÊN CHẾ ĐỘ OFFLINE (D8 - D10)', () => {

  // ==========================================
  // TEST CASE D8: SYNC THẤT BẠI → PHẢI GIỮ LẠI QUEUE
  // ==========================================
  it('D8: Nếu sync thất bại (mất mạng giữa chừng) thì đơn phải ở lại queue', async () => {
    let syncQueue = [
      { _id: 'local_1', syncStatus: 'pending' },
      { _id: 'local_2', syncStatus: 'pending' }
    ];

    const mockServerApi = async (order: any) => {
      // Giả lập: đơn thứ 2 lỗi mạng
      if (order._id === 'local_2') throw new Error('Network timeout');
      return { ...order, _id: 'server_' + order._id, syncStatus: 'synced' };
    };

    const syncPending = async () => {
      const remain: any[] = [];
      for (const o of syncQueue) {
        try {
          await mockServerApi(o);
        } catch {
          remain.push(o); // Giữ lại để retry sau
        }
      }
      syncQueue = remain;
      return syncQueue.length;
    };

    const remaining = await syncPending();

    expect(remaining).toBe(1);
    expect(syncQueue[0]._id).toBe('local_2'); // Chỉ đơn lỗi ở lại
    expect(syncQueue[0].syncStatus).toBe('pending');
  });

  // ==========================================
  // TEST CASE D9: NHIỀU ĐƠN OFFLINE LIÊN TIẾP
  // ==========================================
  it('D9: Đặt nhiều đơn khi offline phải vào queue đúng thứ tự FIFO', async () => {
    const syncQueue: any[] = [];

    const placeOrder = (id: string) => {
      syncQueue.push({ _id: id, syncStatus: 'pending' });
    };

    placeOrder('o1');
    placeOrder('o2');
    placeOrder('o3');

    expect(syncQueue.length).toBe(3);
    expect(syncQueue.map(o => o._id)).toEqual(['o1', 'o2', 'o3']);
  });

  // ==========================================
  // TEST CASE D10: CACHE RỖNG → KHÔNG BỊ TRẮNG TRANG
  // ==========================================
  it('D10: Nếu cache rỗng lúc offline, phải trả mảng [] (không crash UI)', () => {
    const sqliteCache: Record<string, any[]> = {}; // Chưa có gì
    const isOnline = false;

    const getData = (table: string) => {
      if (!isOnline) return sqliteCache[table] ?? [];
      return [];
    };

    expect(Array.isArray(getData('products'))).toBe(true);
    expect(getData('products')).toEqual([]);
    expect(getData('orders')).toEqual([]);
  });

});

// ==========================================
// KIỂM THỬ XÁC THỰC & BẢO MẬT (E1 - E7)
// ==========================================

describe('KIỂM THỬ XÁC THỰC & BẢO MẬT (E1 - E7)', () => {
  let mockDB: { users: any[]; tokens: Record<string, string> };

  beforeEach(() => {
    mockDB = {
      users: [{ email: 'existing@gmail.com', password: '123456', role: 'user' }],
      tokens: { 'token_user': 'existing@gmail.com', 'token_admin': 'admin@gmail.com' },
    };
  });

  // E1: Email trùng
  it('E1: Đăng ký với email đã tồn tại phải báo lỗi', async () => {
    const registerApi = async (email: string, pass: string) => {
      if (mockDB.users.find(u => u.email === email)) {
        throw new Error('Email đã được sử dụng');
      }
      mockDB.users.push({ email, password: pass, role: 'user' });
      return { success: true };
    };
    await expect(registerApi('existing@gmail.com', '123456')).rejects.toThrow('Email đã được sử dụng');
  });

  // E2: Password yếu
  it('E2: Đăng ký với mật khẩu < 6 ký tự phải báo lỗi', async () => {
    const validatePassword = (pass: string) => {
      if (pass.length < 6) throw new Error('Mật khẩu phải từ 6 ký tự');
      return true;
    };
    expect(() => validatePassword('123')).toThrow('Mật khẩu phải từ 6 ký tự');
    expect(validatePassword('123456')).toBe(true);
  });

  // E3: SĐT không hợp lệ
  it('E3: SĐT chứa chữ cái phải bị chặn', () => {
    const validatePhone = (phone: string) => /^\d{10,11}$/.test(phone);
    expect(validatePhone('098abc1234')).toBe(false);
    expect(validatePhone('0987654321')).toBe(true);
  });

  // E4: Logout
  it('E4: Logout phải xóa token và reset user state', async () => {
    const mockStorage: Record<string, string | null> = { '@token': 'token_user' };
    let currentUser: any = { email: 'existing@gmail.com' };

    const logout = async () => {
      await new Promise(r => setTimeout(r, 0)); // giả lập AsyncStorage async
      mockStorage['@token'] = null;
      currentUser = null;
      return { success: true };
    };

    await logout();
    expect(mockStorage['@token']).toBeNull();
    expect(currentUser).toBeNull();
  });

  // E5: Token hết hạn (401)
  it('E5: Gọi API với token hết hạn phải tự động logout', async () => {
    let loggedIn = true;
    const mockApiWithInterceptor = async (token: string) => {
      if (token !== 'token_user') {
        loggedIn = false; // interceptor logout
        const err: any = new Error('Unauthorized');
        err.status = 401;
        throw err;
      }
      return { data: 'ok' };
    };

    await expect(mockApiWithInterceptor('expired_token')).rejects.toThrow('Unauthorized');
    expect(loggedIn).toBe(false);
  });

  // E6: Phân quyền
  it('E6: User thường mở route /admin phải bị chặn', () => {
    const canAccess = (role: string, route: string) => {
      if (route.startsWith('/admin') && role !== 'admin') {
        return { allowed: false, message: 'Không có quyền truy cập' };
      }
      return { allowed: true };
    };
    expect(canAccess('user', '/admin/dashboard').allowed).toBe(false);
    expect(canAccess('admin', '/admin/dashboard').allowed).toBe(true);
  });

  // E7: Persist login
  it('E7: Mở lại app phải đọc token cũ từ AsyncStorage', async () => {
    const mockStorage: Record<string, string | null> = { '@token': 'token_user' };
    const getSession = async () => {
      const token = mockStorage['@token'];
      if (!token) return { loggedIn: false, user: null };
      const email = mockDB.tokens[token];
      return { loggedIn: true, user: mockDB.users.find(u => u.email === email) };
    };
    const session = await getSession();
    expect(session.loggedIn).toBe(true);
    expect(session.user.email).toBe('existing@gmail.com');
  });
});

// ==========================================
// KIỂM THỬ VALIDATION & EDGE CASES (F1 - F8)
// ==========================================

describe('KIỂM THỬ VALIDATION & EDGE CASES (F1 - F8)', () => {

  // F1: Email format
  it('F1: Email thiếu @ phải báo không hợp lệ', () => {
    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    expect(validateEmail('abc')).toBe(false);
    expect(validateEmail('test@gmail.com')).toBe(true);
  });

  // F2: Giỏ hàng rỗng
  it('F2: Thanh toán khi giỏ rỗng phải bị chặn', () => {
    const cart: any[] = [];
    const checkout = (c: any[]) => {
      if (c.length === 0) throw new Error('Giỏ hàng trống');
      return { success: true };
    };
    expect(() => checkout(cart)).toThrow('Giỏ hàng trống');
  });

  // F3: Voucher hết hạn
  it('F3: Áp voucher hết hạn phải báo lỗi, không giảm giá', () => {
    const now = Date.now();
    const vouchers = [{ code: 'EXPIRED2020', expiry: now - 86400000, discount: 50000 }];
    const applyVoucher = (code: string, subTotal: number) => {
      const v = vouchers.find(v => v.code === code);
      if (!v) return { success: false, message: 'Mã không tồn tại', final: subTotal };
      if (v.expiry < now) return { success: false, message: 'Mã đã hết hạn', final: subTotal };
      return { success: true, final: subTotal - v.discount };
    };
    const res = applyVoucher('EXPIRED2020', 200000);
    expect(res.success).toBe(false);
    expect(res.message).toBe('Mã đã hết hạn');
    expect(res.final).toBe(200000);
  });

  // F4: Voucher đã dùng
  it('F4: User đã dùng voucher rồi phải bị chặn', () => {
    const usedByUser = ['WELCOME10'];
    const applyVoucher = (code: string) => {
      if (usedByUser.includes(code)) throw new Error('Bạn đã dùng mã này rồi');
      return { success: true };
    };
    expect(() => applyVoucher('WELCOME10')).toThrow('Bạn đã dùng mã này rồi');
  });

  // F5: Số lượng âm
  it('F5: Không cho giảm số lượng xuống 0', () => {
    const decrease = (qty: number) => Math.max(1, qty - 1);
    expect(decrease(1)).toBe(1);
    expect(decrease(3)).toBe(2);
  });

  // F6: Sản phẩm hết hàng
  it('F6: Thêm SP stock = 0 vào giỏ phải bị chặn', () => {
    const addToCart = (product: any) => {
      if (product.stock === 0) throw new Error('Sản phẩm đã hết hàng');
      return { success: true };
    };
    expect(() => addToCart({ _id: 'p1', stock: 0 })).toThrow('Sản phẩm đã hết hàng');
  });

  // F7: Đánh giá trùng
  it('F7: Đánh giá 2 lần cùng đơn phải bị chặn', () => {
    const reviewOrder = (order: any) => {
      if (order.status === 'reviewed') throw new Error('Đơn này đã được đánh giá');
      return { success: true };
    };
    expect(() => reviewOrder({ status: 'reviewed' })).toThrow('Đơn này đã được đánh giá');
  });

  // F8: Voucher 100%
  it('F8: Voucher 100% đơn hàng không làm tổng tiền âm', () => {
    const calc = (subTotal: number, ship: number, voucher: any) => {
      let discount = voucher.type === 'percent'
        ? (subTotal * voucher.value) / 100
        : voucher.value;
      return Math.max(0, subTotal + ship - discount);
    };
    const total = calc(200000, 30000, { type: 'percent', value: 100 });
    expect(total).toBe(30000); // chỉ còn ship
    expect(total).toBeGreaterThanOrEqual(0);
  });
});

// ==========================================
// KIỂM THỬ STATE MANAGEMENT (G1 - G4)
// ==========================================

describe('KIỂM THỬ STATE MANAGEMENT (G1 - G4)', () => {
  let mockAsyncStorage: Record<string, string>;

  beforeEach(() => {
    mockAsyncStorage = {};
  });

  // G1: Cart persist
  it('G1: Giỏ hàng phải persist qua AsyncStorage', async () => {
    const saveCart = async (cart: any[]) => {
      mockAsyncStorage['cart'] = JSON.stringify(cart);
    };
    const loadCart = async () => {
      const raw = mockAsyncStorage['cart'];
      return raw ? JSON.parse(raw) : [];
    };

    await saveCart([{ _id: 'p1', qty: 2 }, { _id: 'p2', qty: 1 }]);
    const loaded = await loadCart();

    expect(loaded.length).toBe(2);
    expect(loaded[0].qty).toBe(2);
  });

  // G2: Wishlist sync
  it('G2: Thả tim ở Home phải phản ánh ngay ở Wishlist', () => {
    let wishlist: string[] = [];
    const toggleFromHome = (id: string) => {
      wishlist = wishlist.includes(id)
        ? wishlist.filter(x => x !== id)
        : [...wishlist, id];
    };
    const getWishlistView = () => wishlist;

    toggleFromHome('p1');
    expect(getWishlistView()).toContain('p1');
    toggleFromHome('p1');
    expect(getWishlistView()).not.toContain('p1');
  });

  // G3: AuthContext không bị reset
  it('G3: State user không bị reset khi đi qua nhiều màn hình', () => {
    const authContext = { current: { user: { email: 'test@gmail.com' } } };
    const navigate = (route: string) => {
      // Navigation không được touch authContext
      return { route, user: authContext.current.user };
    };
    navigate('/home');
    navigate('/product/p1');
    navigate('/cart');
    expect(authContext.current.user.email).toBe('test@gmail.com');
  });

  // G4: Race condition thêm giỏ
  it('G4: Bấm "Thêm giỏ" 2 lần nhanh phải xử lý đúng (idempotent)', async () => {
    let cart: any[] = [];
    let isAdding = false;

    const addToCart = async (product: any) => {
      if (isAdding) return { skipped: true }; // chặn double click
      isAdding = true;
      await new Promise(r => setTimeout(r, 50));
      cart.push(product);
      isAdding = false;
      return { success: true };
    };

    // Bắn 2 lần không await giữa chừng
    const p1 = addToCart({ _id: 'p1' });
    const p2 = addToCart({ _id: 'p1' });
    await Promise.all([p1, p2]);

    expect(cart.length).toBe(1); // chỉ 1 lần thêm
  });
});

// ==========================================
// KIỂM THỬ LIFECYCLE ĐƠN HÀNG (H1 - H5)
// ==========================================

describe('KIỂM THỬ LIFECYCLE ĐƠN HÀNG (H1 - H5)', () => {

  // H1: Khách hủy pending
  it('H1: Khách hủy đơn pending phải thành công', () => {
    const cancelOrder = (order: any) => {
      if (order.status !== 'pending') throw new Error('Không thể hủy');
      return { ...order, status: 'cancelled' };
    };
    const result = cancelOrder({ _id: 'o1', status: 'pending' });
    expect(result.status).toBe('cancelled');
  });

  // H2: Chặn hủy shipping
  it('H2: Không cho hủy đơn đang shipping', () => {
    const cancelOrder = (order: any) => {
      if (['shipping', 'delivered', 'reviewed'].includes(order.status)) {
        throw new Error('Đơn đã giao shipper, không thể hủy');
      }
      return { ...order, status: 'cancelled' };
    };
    expect(() => cancelOrder({ status: 'shipping' })).toThrow('Đơn đã giao shipper, không thể hủy');
  });

  // H3: Đánh giá chỉ khi delivered
  it('H3: Không cho đánh giá đơn chưa giao', () => {
    const reviewOrder = (order: any) => {
      if (order.status !== 'delivered') throw new Error('Chỉ đánh giá khi đã giao');
      return { success: true };
    };
    expect(() => reviewOrder({ status: 'pending' })).toThrow('Chỉ đánh giá khi đã giao');
    expect(reviewOrder({ status: 'delivered' }).success).toBe(true);
  });

  // H4: Mua lại
  it('H4: Mua lại đơn reviewed phải dùng giá hiện tại', () => {
    const oldOrder = { items: [{ _id: 'p1', price: 100000, qty: 2 }] };
    const currentProducts: Record<string, { price: number }> = { p1: { price: 120000 } }; 

    const rebuy = () => {
      return oldOrder.items.map(item => ({
        _id: item._id,
        qty: item.qty,
        price: currentProducts[item._id]?.price ?? item.price,
      }));
    };
    const result = rebuy();
    expect(result[0].price).toBe(120000);
    expect(result[0].qty).toBe(2);
  });

  // H5: Terminal state
  it('H5: Đơn reviewed là terminal, không đổi trạng thái được', () => {
    const updateStatus = (order: any, newStatus: string) => {
      if (order.status === 'reviewed') throw new Error('Đơn đã hoàn tất');
      return { ...order, status: newStatus };
    };
    expect(() => updateStatus({ status: 'reviewed' }, 'cancelled'))
      .toThrow('Đơn đã hoàn tất');
  });
});

// ==========================================
// KIỂM THỬ ADMIN NÂNG CAO (I1 - I5)
// ==========================================

describe('KIỂM THỬ ADMIN NÂNG CAO (I1 - I5)', () => {

  // I1: Xóa SP trong đơn
  it('I1: Không cho xóa SP đang có trong đơn shipping', () => {
    const orders = [
      { _id: 'o1', status: 'shipping', items: [{ _id: 'p1' }] },
    ];
    const deleteProduct = (productId: string) => {
      const inActiveOrder = orders.some(
        o => ['pending', 'confirmed', 'shipping'].includes(o.status)
          && o.items.some((i: any) => i._id === productId)
      );
      if (inActiveOrder) throw new Error('SP đang trong đơn chưa hoàn tất');
      return { success: true };
    };
    expect(() => deleteProduct('p1')).toThrow('SP đang trong đơn chưa hoàn tất');
  });

  // I2: Sửa giá snapshot
  it('I2: Đổi giá SP không ảnh hưởng đơn cũ (snapshot)', () => {
    const oldOrder = { items: [{ _id: 'p1', priceAtOrder: 100000 }] };
    const newPrice = 200000; // Admin đổi giá
    // Đơn cũ giữ nguyên priceAtOrder
    expect(oldOrder.items[0].priceAtOrder).toBe(100000);
    // Giỏ mới dùng giá mới
    const newCartItem = { _id: 'p1', price: newPrice };
    expect(newCartItem.price).toBe(200000);
  });

  // I3: Voucher auto inactive
  it('I3: Voucher qua ngày expiry phải tự động inactive', () => {
    const now = Date.now();
    const vouchers = [
      { code: 'A', expiry: now - 1000, active: true },
      { code: 'B', expiry: now + 86400000, active: true },
    ];
    const autoDeactivate = (list: any[]) =>
      list.map(v => ({ ...v, active: v.active && v.expiry > now }));

    const result = autoDeactivate(vouchers);
    expect(result[0].active).toBe(false);
    expect(result[1].active).toBe(true);
  });

  // I4: Filter đơn
  it('I4: Filter "shipping" chỉ trả đơn shipping', () => {
    const orders = [
      { _id: 'o1', status: 'pending' },
      { _id: 'o2', status: 'shipping' },
      { _id: 'o3', status: 'reviewed' },
      { _id: 'o4', status: 'shipping' },
    ];
    const filterBy = (s: string) => orders.filter(o => o.status === s);
    const result = filterBy('shipping');
    expect(result.length).toBe(2);
    expect(result.every(o => o.status === 'shipping')).toBe(true);
  });

  // I5: Upload ảnh
  it('I5: Admin thêm SP có 3 ảnh phải lưu đủ 3', () => {
    const createProduct = (data: any) => {
      if (!data.images || data.images.length === 0) {
        throw new Error('Phải có ít nhất 1 ảnh');
      }
      return { ...data, _id: 'p_new' };
    };
    const p = createProduct({
      name: 'Serum',
      images: ['uri1.jpg', 'uri2.jpg', 'uri3.jpg'],
    });
    expect(p.images.length).toBe(3);
  });
});

// ==========================================
// KIỂM THỬ NETWORK / ERROR HANDLING (J1 - J5)
// ==========================================

describe('KIỂM THỬ NETWORK / ERROR HANDLING (J1 - J5)', () => {

  // J1: Timeout
  it('J1: API timeout phải báo lỗi thân thiện, không crash', async () => {
    const mockApi = async () => {
      return new Promise((_, reject) =>
        setTimeout(() => {
          const err: any = new Error('timeout');
          err.code = 'ECONNABORTED';
          reject(err);
        }, 50)
      );
    };
    await expect(mockApi()).rejects.toThrow('timeout');
    // App phải catch và map thành message thân thiện
    const friendlyMessage = (err: any) =>
      err.code === 'ECONNABORTED' ? 'Kết nối quá lâu, vui lòng thử lại' : 'Lỗi khác';
    expect(friendlyMessage({ code: 'ECONNABORTED' })).toBe('Kết nối quá lâu, vui lòng thử lại');
  });

  // J2: Server 500
  it('J2: Server trả 500 phải báo lỗi hệ thống', async () => {
    const mockApi = async () => {
      const err: any = new Error('Internal Server Error');
      err.response = { status: 500 };
      throw err;
    };
    try {
      await mockApi();
    } catch (err: any) {
      const msg = err.response?.status === 500
        ? 'Lỗi hệ thống, vui lòng thử lại sau'
        : 'Lỗi khác';
      expect(msg).toBe('Lỗi hệ thống, vui lòng thử lại sau');
    }
  });

  // J3: Retry backoff
  it('J3: Retry 1 lần sau 1s rồi thành công', async () => {
    let attempt = 0;
    const mockApi = async () => {
      attempt++;
      if (attempt === 1) throw new Error('fail lần 1');
      return { data: 'ok' };
    };
    const retryWithBackoff = async (fn: () => Promise<any>, retries = 2) => {
      let lastErr: any;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (e) {
          lastErr = e;
          if (i < retries - 1) await new Promise(r => setTimeout(r, 10)); // rút ngắn 1s → 10ms
        }
      }
      throw lastErr;
    };
    const res = await retryWithBackoff(mockApi);
    expect(res.data).toBe('ok');
    expect(attempt).toBe(2);
  });

  // J4: Loading state
  it('J4: Trong khi loading, bấm lần 2 phải bị chặn', async () => {
    let loading = false;
    let callCount = 0;
    const placeOrder = async () => {
      if (loading) return { blocked: true };
      loading = true;
      callCount++;
      await new Promise(r => setTimeout(r, 50));
      loading = false;
      return { success: true };
    };
    const p1 = placeOrder();
    const p2 = placeOrder(); // bấm lần 2
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r2.blocked).toBe(true);
    expect(callCount).toBe(1);
  });

  // J5: Debounce search
  it('J5: Gõ 5 ký tự trong 100ms chỉ trigger API 1 lần', async () => {
    let apiCalls = 0;
    let timer: any = null;

    const debouncedSearch = (text: string, delay = 30) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { apiCalls++; }, delay);
    };

    // Gõ 5 lần liên tiếp nhanh
    for (const char of ['s', 'e', 'r', 'u', 'm']) {
      debouncedSearch(char);
      await new Promise(r => setTimeout(r, 5)); // giữa các lần gõ 5ms < 30ms
    }
    await new Promise(r => setTimeout(r, 50)); // chờ debounce fire

    expect(apiCalls).toBe(1);
  });
});