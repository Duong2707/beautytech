import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = [
  { name: "Tất cả", icon: "grid-outline" as const },
  { name: "Làm sạch", icon: "water-outline" as const },
  { name: "Serum", icon: "flask-outline" as const },
  { name: "Dưỡng ẩm", icon: "flower-outline" as const },
  { name: "Chống nắng", icon: "sunny-outline" as const },
];

const products = [
  {
    name: "Glow Serum",
    detail: "Serum dưỡng sáng da",
    price: "259.000đ",
    oldPrice: "320.000đ",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80",
    color: "#F8E4E9",
    tag: "BÁN CHẠY",
  },
  {
    name: "Hydra Cream",
    detail: "Kem dưỡng ẩm sâu",
    price: "320.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80",
    color: "#F5EBDD",
    tag: "YÊU THÍCH",
  },
  {
    name: "Pure Cleanser",
    detail: "Sữa rửa mặt dịu nhẹ",
    price: "189.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80",
    color: "#E8EDE4",
    tag: "MỚI",
  },
  {
    name: "Daily Sunscreen",
    detail: "Kem chống nắng SPF 50+",
    price: "285.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    color: "#F8EAD7",
    tag: "NỔI BẬT",
  },
  {
    name: "Rose Toner",
    detail: "Nước cân bằng da dịu nhẹ",
    price: "199.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&auto=format&fit=crop&q=80",
    color: "#F8E4E9",
    tag: "BÁN CHẠY",
  },
  {
    name: "Vitamin C Serum",
    detail: "Serum vitamin C chăm sóc da",
    price: "349.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80",
    color: "#F5EBDD",
    tag: "NỔI BẬT",
  },
  {
    name: "Soft Cleansing Oil",
    detail: "Dầu tẩy trang làm sạch",
    price: "229.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80",
    color: "#E8EDE4",
    tag: "MỚI",
  },
  {
    name: "Repair Night Cream",
    detail: "Kem dưỡng da ban đêm",
    price: "389.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&auto=format&fit=crop&q=80",
    color: "#F8EAD7",
    tag: "YÊU THÍCH",
  },
  {
    name: "Lip Care Balm",
    detail: "Son dưỡng môi mềm mịn",
    price: "129.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80",
    color: "#F8E4E9",
    tag: "MỚI",
  },
  {
    name: "Hydrating Face Mask",
    detail: "Mặt nạ cấp ẩm cho da",
    price: "79.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&auto=format&fit=crop&q=80",
    color: "#E8EDE4",
    tag: "GIÁ TỐT",
  },
  {
    name: "Eye Repair Cream",
    detail: "Kem dưỡng vùng da quanh mắt",
    price: "299.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80",
    color: "#F5EBDD",
    tag: "YÊU THÍCH",
  },
  {
    name: "Body Lotion",
    detail: "Sữa dưỡng thể mềm mịn",
    price: "219.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80",
    color: "#F8EAD7",
    tag: "NỔI BẬT",
  },
];

function productCategory(name: string) {
  if (name.includes("Serum")) return "Serum";

  if (name.includes("Cream") || name.includes("Lotion")) {
    return "Dưỡng ẩm";
  }

  if (
    name.includes("Cleanser") ||
    name.includes("Cleansing") ||
    name.includes("Toner")
  ) {
    return "Làm sạch";
  }

  if (name.includes("Sunscreen")) return "Chống nắng";

  return "";
}

export default function ProductsScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        `${product.name} ${product.detail}`
          .toLowerCase()
          .includes(keyword);

      const matchesCategory =
        selectedCategory === "Tất cả" ||
        productCategory(product.name) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const openProduct = (product: (typeof products)[number]) => {
    router.push({
      pathname: "/product-detail",
      params: {
        name: product.name,
        detail: product.detail,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        color: product.color,
        tag: product.tag,
      },
    });
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  const addToCart = (name: string) => {
    setCart((current) => [...current, name]);
    Alert.alert("Đã thêm vào giỏ hàng", `${name} đã được thêm.`);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              Beauty<Text style={styles.logoAccent}>Tech.</Text>
            </Text>

            <Text style={styles.subtitle}>
              YOUR PERSONAL BEAUTY SPACE
            </Text>
          </View>

          <Pressable
            style={styles.cartButton}
            onPress={() =>
              Alert.alert(
                "Giỏ hàng",
                `Bạn đã thêm ${cart.length} sản phẩm.`
              )
            }
          >
            <Ionicons
              name="bag-handle-outline"
              size={23}
              color="#BC6280"
            />

            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cart.length > 99 ? "99+" : cart.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.eyebrow}>BEAUTY COLLECTION</Text>
          <Text style={styles.pageTitle}>Khám phá mỹ phẩm</Text>

          <Text style={styles.description}>
            Tìm sản phẩm chăm sóc bản thân yêu thích của bạn.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#B58A99"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm serum, kem dưỡng..."
            placeholderTextColor="#B9A5AC"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#B58A99"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = selectedCategory === category.name;

            return (
              <Pressable
                key={category.name}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Ionicons
                  name={category.icon}
                  size={17}
                  color={active ? "#FFFFFF" : "#BC7890"}
                />

                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.productHeading}>
          <View>
            <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>

            <Text style={styles.resultText}>
              {filteredProducts.length} sản phẩm
            </Text>
          </View>

          <View style={styles.sortLabel}>
            <Ionicons
              name="sparkles-outline"
              size={16}
              color="#BC6280"
            />
            <Text style={styles.sortText}>Beauty picks</Text>
          </View>
        </View>

        {filteredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => {
              const isFavorite = favorites.includes(product.name);

              return (
                <View key={product.name} style={styles.productCard}>
                  <Pressable
                    style={[
                      styles.productImageWrap,
                      { backgroundColor: product.color },
                    ]}
                    onPress={() => openProduct(product)}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

                    {!!product.tag && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          {product.tag}
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <Pressable
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(product.name)}
                  >
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorite ? "#D85D85" : "#A77C8A"}
                    />
                  </Pressable>

                  <Pressable
                    style={styles.productInfo}
                    onPress={() => openProduct(product)}
                  >
                    <Text
                      style={styles.productName}
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>

                    <Text
                      style={styles.productDetail}
                      numberOfLines={2}
                    >
                      {product.detail}
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {product.price}
                      </Text>
                    </View>

                    {!!product.oldPrice && (
                      <Text style={styles.oldPrice}>
                        {product.oldPrice}
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    style={styles.addButton}
                    onPress={() => addToCart(product.name)}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.addButtonText}>
                      Thêm vào giỏ
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={42}
              color="#D9A8B9"
            />

            <Text style={styles.emptyTitle}>
              Không tìm thấy sản phẩm
            </Text>

            <Text style={styles.emptyText}>
              Hãy thử từ khóa hoặc danh mục khác nhé.
            </Text>

            <Pressable
              style={styles.resetButton}
              onPress={() => {
                setSearch("");
                setSelectedCategory("Tất cả");
              }}
            >
              <Text style={styles.resetButtonText}>
                Xem tất cả sản phẩm
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/home")}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#A58B93"
          />
          <Text style={styles.navText}>Trang chủ</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => {
            setSearch("");
            setSelectedCategory("Tất cả");
          }}
        >
          <Ionicons name="grid" size={22} color="#BC6280" />
          <Text style={styles.navActiveText}>Sản phẩm</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/login")}
        >
          <Ionicons
            name="scan-outline"
            size={22}
            color="#A58B93"
          />
          <Text style={styles.navText}>Beauty AI</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/login")}
        >
          <Ionicons
            name="time-outline"
            size={22}
            color="#A58B93"
          />
          <Text style={styles.navText}>Nhật ký da</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/login")}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#A58B93"
          />
          <Text style={styles.navText}>Tài khoản</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFAF8",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    fontSize: 27,
    fontWeight: "800",
    color: "#45323A",
    letterSpacing: -0.8,
  },
  logoAccent: {
    color: "#D76F91",
  },
  subtitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#B58A99",
    marginTop: 3,
  },
  cartButton: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#F9E9EE",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#D85D85",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  titleArea: {
    marginBottom: 20,
  },
  eyebrow: {
    color: "#C17B96",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 7,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#49323B",
  },
  description: {
    fontSize: 12,
    color: "#9E858F",
    marginTop: 7,
    lineHeight: 18,
  },
  searchBox: {
    height: 49,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E0E6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    color: "#49323B",
    fontSize: 13,
    paddingVertical: 0,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#49323B",
  },
  categoryList: {
    gap: 9,
    paddingBottom: 24,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#F0DDE4",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: "#C87391",
    borderColor: "#C87391",
  },
  categoryText: {
    fontSize: 11,
    color: "#987581",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  productHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultText: {
    fontSize: 11,
    color: "#AE929D",
    marginTop: 4,
  },
  sortLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F9E9EE",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  sortText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#BC6280",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
  },
  productCard: {
    width: "48.3%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4E8EC",
    padding: 8,
    overflow: "hidden",
  },
  productImageWrap: {
    height: 155,
    borderRadius: 13,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  tag: {
    position: "absolute",
    top: 8,
    left: 7,
    backgroundColor: "#FFFFFFE8",
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  tagText: {
    color: "#BC6280",
    fontSize: 8,
    fontWeight: "800",
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    paddingHorizontal: 3,
    paddingTop: 11,
  },
  productName: {
    color: "#49323B",
    fontSize: 13,
    fontWeight: "800",
  },
  productDetail: {
    fontSize: 10,
    color: "#A58B93",
    lineHeight: 15,
    marginTop: 5,
    minHeight: 30,
  },
  priceRow: {
    marginTop: 8,
  },
  productPrice: {
    color: "#C45F83",
    fontSize: 13,
    fontWeight: "800",
  },
  oldPrice: {
    color: "#BDAAB1",
    fontSize: 10,
    textDecorationLine: "line-through",
    marginTop: 3,
  },
  addButton: {
    height: 34,
    backgroundColor: "#C87391",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 15,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#49323B",
    marginTop: 13,
  },
  emptyText: {
    fontSize: 12,
    color: "#A58B93",
    textAlign: "center",
    marginTop: 7,
  },
  resetButton: {
    backgroundColor: "#F3DCE5",
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 17,
  },
  resetButtonText: {
    color: "#A95073",
    fontSize: 12,
    fontWeight: "800",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2E4E9",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingBottom: 5,
    elevation: 12,
    shadowColor: "#8D5368",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  navActiveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#BC6280",
    textAlign: "center",
  },
  navText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#A58B93",
    textAlign: "center",
  },
});