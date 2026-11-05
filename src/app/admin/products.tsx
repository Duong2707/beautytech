import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import api from "../../data/datasources/remote/api"; // Dùng trực tiếp api instance

const PINK = "#E88BA8";
const DARK = "#30242A";
const MUTED = "#8E858A";
const BG = "#FFF8FA";

// 🌟 CẬP NHẬT TYPE CHO KHỚP VỚI DATABASE CỦA KHÁCH HÀNG
type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string; // "cleanser" | "serum" | "moisturizer" | "sunscreen" ...
  price: number;
  stock: number;
  description: string;
  image: string;
  sizes: string[]; // Mảng dung tích
  rating?: number;
  sold?: number;
};

// 🌟 MAP DANH MỤC: Hiển thị tiếng Việt nhưng lưu giá trị tiếng Anh vào DB
const CATEGORIES_MAP: Record<string, string> = {
  "Làm sạch": "cleanser",
  "Serum": "serum",
  "Dưỡng ẩm": "moisturizer",
  "Chống nắng": "sunscreen",
  "Chăm sóc môi": "lipcare",
  "Mặt nạ": "mask",
};

const categories = ["Tất cả", ...Object.keys(CATEGORIES_MAP)];

const adminMenu = [
  { label: "Tổng quan", icon: "grid-outline" as const, route: "/admin" },
  { label: "Sản phẩm", icon: "cube-outline" as const, route: "/admin/products" },
  { label: "Đơn hàng", icon: "receipt-outline" as const, route: "/admin/orders" },
//  { label: "Shipper", icon: "bicycle-outline" as const, route: "/admin/shippers" },
  { label: "Voucher", icon: "ticket-outline" as const, route: "/admin/vouchers" },
  { label: "Thông báo", icon: "notifications-outline" as const, route: "/admin/notifications" },
];

const formatPrice = (value: number | string) => {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toLocaleString("vi-VN")}đ` : value;
};

export default function AdminProducts() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [formCategory, setFormCategory] = useState("Serum");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState(""); // Lưu dạng chuỗi "30ml, 50ml"
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 🌟 GỌI API LẤY DANH SÁCH
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/products');
      const data = res.data.data || res.data;
      setProducts(data);
    } catch (err) {
      console.log("Lỗi lấy danh sách SP:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchName = product.name.toLowerCase().includes(keyword) || (product.brand && product.brand.toLowerCase().includes(keyword));
      
      // So sánh category từ DB (tiếng Anh) với category đang chọn (tiếng Việt)
      const dbCategoryValue = CATEGORIES_MAP[category];
      const matchCategory = category === "Tất cả" || product.category === dbCategoryValue;

      return matchName && matchCategory;
    });
  }, [products, search, category]);

  const totalStock = products.reduce((sum, item) => sum + (item.stock || 0), 0);
  const lowStock = products.filter((item) => item.stock < 15).length;

  const navigateAdmin = (route: string) => {
    setMenuOpen(false);
    router.push(route as any);
  };

  const handleLogout = () => {
    const confirmLogout = () => router.replace("/login" as any);
    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) confirmLogout();
    } else {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: confirmLogout },
      ]);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Cần cấp quyền", "Vui lòng cho phép ứng dụng truy cập thư viện ảnh.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError("");
      }
    } catch {
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh.");
    }
  };

  const resetForm = () => {
    setName(""); setBrand(""); setFormCategory("Serum"); setPrice(""); setStock(""); 
    setSizes(""); setDescription(""); setImageUri(null); setError(""); setEditingId(null);
  };

  const closeForm = () => {
    setModalVisible(false);
    resetForm();
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product._id);
    setName(product.name);
    setBrand(product.brand || "");
    
    // Tìm key tiếng Việt từ value tiếng Anh trong DB
    const vnCategory = Object.keys(CATEGORIES_MAP).find(key => CATEGORIES_MAP[key] === product.category);
    setFormCategory(vnCategory || "Serum");

    setPrice(String(product.price));
    setStock(String(product.stock || 0));
    setSizes(product.sizes ? product.sizes.join(", ") : "");
    setDescription(product.description || "");
    setImageUri(product.image || null);
    setError("");
    setModalVisible(true);
  };

  // 🌟 LƯU VÀO DATABASE
  const saveProduct = async () => {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      setError("Vui lòng nhập đầy đủ tên, giá và số lượng.");
      return;
    }

    const parsedPrice = Number(price.replace(/[.,\s]/g, ""));
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      setError("Giá và số lượng phải là số.");
      return;
    }

    // Xử lý mảng sizes: "30ml, 50ml" -> ["30ml", "50ml"]
    const parsedSizes = sizes.split(",").map(s => s.trim()).filter(Boolean);
    if (parsedSizes.length === 0) parsedSizes.push("Mặc định");

    const productData = {
      name: name.trim(),
      brand: brand.trim(),
      category: CATEGORIES_MAP[formCategory], // Lưu value tiếng Anh vào DB
      price: parsedPrice,
      stock: parsedStock,
      description: description.trim(),
      image: imageUri || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      sizes: parsedSizes,
    };

    try {
      if (editingId !== null) {
        await api.put(`/api/products/${editingId}`, productData);
      } else {
        await api.post('/api/products', productData);
      }
      closeForm();
      loadProducts(); // Tải lại danh sách từ DB
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm.");
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.delete(`/api/products/${deleteId}`);
      setDeleteId(null);
      loadProducts(); // Tải lại danh sách từ DB
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa sản phẩm này.");
    }
  };

  const renderMenu = () => (
    <>
      {adminMenu.map((item) => {
        const active = pathname === item.route;
        return (
          <Pressable
            key={item.route}
            onPress={() => navigateAdmin(item.route)}
            style={[styles.menuItem, active && styles.menuItemActive]}
          >
            <Ionicons name={item.icon} size={20} color={active ? PINK : MUTED} />
            <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
              {item.label}
            </Text>
            {active && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </>
  );

  const renderSidebar = (mobile = false) => (
    <View style={[styles.sidebar, mobile && styles.mobileSidebar]}>
      <View>
        <View style={{paddingTop: 30}} /> 
        <View style={styles.logoArea}>
          <View style={styles.logoRow}>
            <Ionicons name="flower-outline" size={27} color={PINK} />
            <Text style={styles.brandName}>BeautyTech.</Text>
          </View>
          <Text style={styles.brandSubtitle}>ADMIN PANEL</Text>
        </View>
        <Text style={styles.menuLabel}>MENU CHÍNH</Text>
        <View style={styles.menuList}>{renderMenu()}</View>
      </View>
      <View style={styles.sidebarBottom}>
        <View style={styles.adminProfile}>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={19} color={PINK} />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>Administrator</Text>
            <Text style={styles.adminRole}>Quản trị viên</Text>
          </View>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutRow}>
          <Ionicons name="log-out-outline" size={19} color="#D96C7C" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {!isMobile && renderSidebar()}
      <View style={styles.main}>
        <View style={{paddingTop: 20}} /> 
        <ScrollView contentContainerStyle={[styles.content, isMobile && styles.contentMobile]} showsVerticalScrollIndicator={false}>
          
          <View style={styles.pageHeading}>
            {isMobile && (
              <Pressable onPress={() => setMenuOpen(true)} style={styles.menuButton}>
                <Ionicons name="menu" size={23} color={DARK} />
              </Pressable>
            )}
            <View style={styles.pageHeadingText}>
              <Text style={styles.heading}>Quản lý sản phẩm</Text>
              <Text style={styles.subtitle}>Quản lý kho mỹ phẩm</Text>
            </View>
            <Pressable style={[styles.addButton, isMobile && { paddingHorizontal: 12 }]} onPress={openAddModal}>
              <Ionicons name="add" size={isMobile ? 24 : 19} color="#FFFFFF" />
              {!isMobile && <Text style={styles.addButtonText}>Thêm sản phẩm</Text>}
            </Pressable>
          </View>

          <View style={[styles.summaryGrid, isMobile && styles.summaryGridMobile]}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}><Ionicons name="cube-outline" size={21} color={PINK} /></View>
              <Text style={styles.summaryLabel}>Tổng sản phẩm</Text>
              <Text style={styles.summaryValue}>{products.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}><Ionicons name="layers-outline" size={21} color={PINK} /></View>
              <Text style={styles.summaryLabel}>Tổng tồn kho</Text>
              <Text style={styles.summaryValue}>{totalStock}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}><Ionicons name="alert-circle-outline" size={21} color="#D96C7C" /></View>
              <Text style={styles.summaryLabel}>Sắp hết hàng</Text>
              <Text style={styles.summaryValue}>{lowStock}</Text>
            </View>
          </View>

          <View style={styles.filterCard}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={MUTED} />
              <TextInput value={search} onChangeText={setSearch} placeholder="Tìm tên hoặc thương hiệu..." placeholderTextColor="#B6A9AE" style={styles.searchInput} />
              {!!search && <Pressable onPress={() => setSearch("")}><Ionicons name="close-circle" size={19} color={MUTED} /></Pressable>}
            </View>
            <Text style={styles.filterLabel}>Danh mục sản phẩm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {categories.map((item) => (
                  <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, category === item && styles.categoryActive]}>
                    <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.listHeading}>
            <Text style={styles.listTitle}>Danh sách sản phẩm</Text>
            <Text style={styles.resultCount}>{filteredProducts.length} sản phẩm</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={PINK} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <View key={product._id} style={[styles.productCard, isMobile && styles.productCardMobile]}>
                  <View style={[styles.productVisual, { backgroundColor: "#F8E4E9" }]}>
                    {product.image ? (
                      <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                      <Ionicons name="image-outline" size={48} color="#D9A7B7" />
                    )}
                    <View style={styles.productCategoryBadge}>
                      {/* Hiển thị tên danh mục tiếng Việt */}
                      <Text style={styles.productCategory}>
                        {Object.keys(CATEGORIES_MAP).find(k => CATEGORIES_MAP[k] === product.category) || product.category}
                      </Text>
                    </View>
                    {(product.sold || 0) > 0 && (
                      <View style={styles.productTag}>
                        <Text style={styles.productTagText}>Đã bán {product.sold}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDescription}>{product.brand || "Chưa có thương hiệu"}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    
                    <View style={styles.stockRow}>
                      <Text style={styles.stockLabel}>Tồn kho</Text>
                      <Text style={[styles.stockValue, product.stock < 15 && styles.lowStockText]}>
                        {product.stock} sản phẩm
                      </Text>
                    </View>

                    <View style={styles.actionRow}>
                      <Pressable style={styles.editButton} onPress={() => openEditModal(product)}>
                        <Ionicons name="create-outline" size={16} color={PINK} />
                        <Text style={styles.editText}>Sửa</Text>
                      </Pressable>
                      <Pressable style={styles.deleteButton} onPress={() => setDeleteId(product._id)}>
                        <Ionicons name="trash-outline" size={16} color="#D96C7C" />
                        <Text style={styles.deleteText}>Xóa</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={35} color="#C9AAB5" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* MOBILE SIDEBAR */}
      {isMobile && menuOpen && (
        <View style={styles.mobileOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
          {renderSidebar(true)}
        </View>
      )}

      {/* MODAL THÊM / SỬA SẢN PHẨM */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeForm}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId !== null ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</Text>
              <Pressable onPress={closeForm}><Ionicons name="close" size={24} color={DARK} /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Pressable style={styles.imagePicker} onPress={pickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={32} color={PINK} />
                    <Text style={styles.imagePickerText}>Chọn hình ảnh sản phẩm</Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.inputLabel}>Tên sản phẩm *</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Nhập tên sản phẩm" placeholderTextColor="#B6A9AE" style={styles.input} />

              <Text style={styles.inputLabel}>Thương hiệu</Text>
              <TextInput value={brand} onChangeText={setBrand} placeholder="Ví dụ: Cerave, BeautyTech..." placeholderTextColor="#B6A9AE" style={styles.input} />

              <Text style={styles.inputLabel}>Danh mục *</Text>
              <View style={styles.formCategoryWrap}>
                {Object.keys(CATEGORIES_MAP).map((item) => (
                  <Pressable key={item} onPress={() => setFormCategory(item)} style={[styles.formCategoryChip, formCategory === item && styles.formCategoryActive]}>
                    <Text style={[styles.formCategoryText, formCategory === item && styles.formCategoryTextActive]}>{item}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Giá bán (VNĐ) *</Text>
              <TextInput value={price} onChangeText={setPrice} placeholder="Ví dụ: 259000" placeholderTextColor="#B6A9AE" keyboardType="numeric" style={styles.input} />

              <Text style={styles.inputLabel}>Số lượng tồn kho *</Text>
              <TextInput value={stock} onChangeText={setStock} placeholder="Nhập số lượng" placeholderTextColor="#B6A9AE" keyboardType="numeric" style={styles.input} />

              <Text style={styles.inputLabel}>Dung tích (Cách nhau bởi dấu phẩy)</Text>
              <TextInput value={sizes} onChangeText={setSizes} placeholder="Ví dụ: 30ml, 50ml" placeholderTextColor="#B6A9AE" style={styles.input} />

              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput value={description} onChangeText={setDescription} placeholder="Mô tả sản phẩm..." placeholderTextColor="#B6A9AE" multiline style={[styles.input, styles.descriptionInput]} />

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={closeForm}><Text style={styles.cancelText}>Hủy</Text></Pressable>
                <Pressable style={styles.saveButton} onPress={saveProduct}><Text style={styles.saveText}>Lưu sản phẩm</Text></Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL XÁC NHẬN XÓA */}
      <Modal visible={deleteId !== null} transparent animationType="fade" onRequestClose={() => setDeleteId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}><Ionicons name="trash-outline" size={28} color="#D96C7C" /></View>
            <Text style={styles.confirmTitle}>Xóa sản phẩm?</Text>
            <Text style={styles.confirmDescription}>Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách?</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setDeleteId(null)}><Text style={styles.cancelText}>Hủy</Text></Pressable>
              <Pressable style={styles.deleteConfirmButton} onPress={confirmDelete}><Text style={styles.saveText}>Xóa sản phẩm</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Giữ nguyên toàn bộ style cũ của bạn)
  root: { flex: 1, flexDirection: "row", backgroundColor: BG, overflow: "hidden" },
  main: { flex: 1, minWidth: 0, backgroundColor: BG },
  sidebar: { width: 250, flexShrink: 0, backgroundColor: "#FFFFFF", paddingHorizontal: 18, paddingTop: 30, paddingBottom: 15, borderRightWidth: 1, borderRightColor: "#F3E9ED", justifyContent: "space-between" },
  logoArea: { paddingHorizontal: 7, marginBottom: 35 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandName: { fontSize: 22, fontWeight: '800', color: PINK },
  brandSubtitle: { fontSize: 10, color: MUTED, letterSpacing: 2, marginTop: 5, marginLeft: 35 },
  menuLabel: { fontSize: 10, fontWeight: '700', color: '#B0A5AA', letterSpacing: 1.5, marginBottom: 12, marginLeft: 10 },
  menuList: { gap: 0 },
  menuItem: { paddingVertical: 13, paddingHorizontal: 12, borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 6 },
  menuItemActive: { backgroundColor: "#FCEEF2" },
  menuItemText: { color: MUTED, fontSize: 13, fontWeight: "500", flex: 1 },
  menuItemTextActive: { color: PINK, fontWeight: "800" },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PINK },
  sidebarBottom: { paddingTop: 15, borderTopWidth: 1, borderTopColor: "#F3E9ED" },
  adminProfile: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 5 },
  adminAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FCEEF2", alignItems: "center", justifyContent: "center" },
  adminInfo: { flex: 1 },
  adminName: { color: DARK, fontSize: 12, fontWeight: "800" },
  adminRole: { color: MUTED, fontSize: 10, marginTop: 3 },
  logoutRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 11, paddingVertical: 12, marginTop: 8 },
  logoutText: { color: "#D96C7C", fontSize: 12, fontWeight: "600" },
  mobileOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 20, flexDirection: "row" },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(40,25,32,0.35)" },
  mobileSidebar: { width: 250, height: "100%", flexShrink: 0, elevation: 5, zIndex: 21 },
  content: { paddingHorizontal: 25, paddingTop: 28, paddingBottom: 50, maxWidth: 1250, width: "100%", alignSelf: "center" },
  contentMobile: { paddingHorizontal: 15, paddingTop: 20 },
  pageHeading: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 22 },
  pageHeadingText: { flex: 1, minWidth: 150 },
  heading: { fontSize: 25, fontWeight: "800", lineHeight: 30, color: DARK },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 18, marginTop: 5 },
  menuButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#FFF1F5", alignItems: "center", justifyContent: "center" },
  addButton: { backgroundColor: PINK, borderRadius: 11, paddingHorizontal: 15, paddingVertical: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  addButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  summaryGrid: { flexDirection: "row", gap: 14, marginBottom: 20 },
  summaryGridMobile: { flexWrap: "wrap", gap: 10 },
  summaryCard: { flex: 1, minWidth: 0, backgroundColor: "#FFFFFF", borderRadius: 15, padding: 16, borderWidth: 1, borderColor: "#F3E7EB" },
  summaryIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: "#FCEAF0", alignItems: "center", justifyContent: "center", marginBottom: 11 },
  summaryLabel: { color: MUTED, fontSize: 11, lineHeight: 15 },
  summaryValue: { color: DARK, fontSize: 22, fontWeight: "800", lineHeight: 27, marginTop: 5 },
  filterCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 15, borderWidth: 1, borderColor: "#F3E7EB", marginBottom: 22 },
  searchBox: { height: 45, borderRadius: 11, backgroundColor: "#FFFCFD", borderWidth: 1, borderColor: "#EEE3E8", paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, color: DARK, fontSize: 12, paddingVertical: 0 },
  filterLabel: { color: DARK, fontWeight: "700", fontSize: 12, marginTop: 16, marginBottom: 10 },
  categoryRow: { flexDirection: "row", gap: 8, paddingBottom: 2 },
  categoryChip: { borderRadius: 20, borderWidth: 1, borderColor: "#F0DDE4", paddingHorizontal: 13, paddingVertical: 8, backgroundColor: "#FFFFFF" },
  categoryActive: { backgroundColor: PINK, borderColor: PINK },
  categoryText: { color: "#927C84", fontSize: 11, fontWeight: "600" },
  categoryTextActive: { color: "#FFFFFF" },
  listHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  listTitle: { color: DARK, fontSize: 16, lineHeight: 21, fontWeight: "800" },
  resultCount: { color: MUTED, fontSize: 11 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  productCard: { width: "31.5%", minWidth: 220, flexGrow: 1, backgroundColor: "#FFFFFF", borderRadius: 15, overflow: "hidden", borderWidth: 1, borderColor: "#F1E5E9" },
  productCardMobile: { width: "100%", minWidth: 0, flexGrow: 0 },
  productVisual: { height: 190, position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  productImage: { width: "100%", height: "100%" },
  productCategoryBadge: { position: "absolute", left: 10, top: 10, backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  productCategory: { color: "#A65B75", fontSize: 9, fontWeight: "800" },
  productTag: { position: "absolute", right: 10, top: 10, backgroundColor: PINK, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  productTagText: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },
  productDetails: { padding: 14 },
  productName: { color: DARK, fontSize: 14, lineHeight: 19, fontWeight: "800", minHeight: 38 },
  productDescription: { color: MUTED, fontSize: 11, lineHeight: 16, minHeight: 32, marginTop: 5 },
  productPrice: { color: "#C45F80", fontSize: 15, lineHeight: 20, fontWeight: "800", marginTop: 10 },
  stockRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F4EDF0" },
  stockLabel: { color: MUTED, fontSize: 11 },
  stockValue: { color: DARK, fontSize: 11, fontWeight: "800" },
  lowStockText: { color: "#D96C7C" },
  actionRow: { flexDirection: "row", gap: 9, marginTop: 13 },
  editButton: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 9, backgroundColor: "#FFF2F6", borderRadius: 9 },
  editText: { color: PINK, fontWeight: "700", fontSize: 11 },
  deleteButton: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 9, backgroundColor: "#FFF1F1", borderRadius: 9 },
  deleteText: { color: "#D96C7C", fontWeight: "700", fontSize: 11 },
  emptyBox: { alignItems: "center", justifyContent: "center", padding: 45, backgroundColor: "#FFFFFF", borderRadius: 16, gap: 12 },
  emptyText: { color: MUTED, fontSize: 12, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(40,25,32,0.42)", justifyContent: "center", alignItems: "center", padding: 18 },
  modalCard: { width: "100%", maxWidth: 560, maxHeight: "92%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 22 },
  modalCardMobile: { padding: 17 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 17 },
  modalTitle: { color: DARK, fontSize: 17, lineHeight: 22, fontWeight: "800", flex: 1 },
  imagePicker: { height: 155, borderRadius: 15, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#E8B5C5", backgroundColor: "#FFF8FA", alignItems: "center", justifyContent: "center", marginBottom: 16, overflow: "hidden" },
  previewImage: { width: "100%", height: "100%" },
  imagePickerText: { color: "#B65D7B", fontWeight: "700", fontSize: 12, marginTop: 7 },
  imagePickerHint: { color: MUTED, fontSize: 10, marginTop: 4 },
  inputLabel: { color: DARK, fontSize: 11, fontWeight: "700", marginBottom: 7, marginTop: 11 },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#EEDFE5", backgroundColor: "#FFFBFC", borderRadius: 11, paddingHorizontal: 12, color: DARK, fontSize: 12 },
  descriptionInput: { minHeight: 85, textAlignVertical: "top", paddingTop: 12 },
  formCategoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  formCategoryChip: { borderWidth: 1, borderColor: "#EEDFE5", borderRadius: 18, paddingHorizontal: 11, paddingVertical: 8 },
  formCategoryActive: { backgroundColor: PINK, borderColor: PINK },
  formCategoryText: { color: "#927C84", fontSize: 10, fontWeight: "600" },
  formCategoryTextActive: { color: "#FFFFFF" },
  errorText: { color: "#D94F68", fontSize: 11, marginTop: 10 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20, marginBottom: 5 },
  cancelButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 11, backgroundColor: "#F5F0F2" },
  cancelText: { color: "#766970", fontWeight: "700", fontSize: 11 },
  saveButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 11, backgroundColor: PINK },
  saveText: { color: "#FFFFFF", fontWeight: "800", fontSize: 11 },
  confirmCard: { width: "100%", maxWidth: 390, padding: 24, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center" },
  confirmIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#FFF1F1", alignItems: "center", justifyContent: "center" },
  confirmTitle: { color: DARK, fontSize: 17, lineHeight: 22, fontWeight: "800", marginTop: 15 },
  confirmDescription: { color: MUTED, fontSize: 11, textAlign: "center", lineHeight: 18, marginTop: 8 },
  deleteConfirmButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 11, backgroundColor: "#D96C7C" },
});