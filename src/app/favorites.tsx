import { useState } from "react";
import { View, Text, FlatList, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const demoProducts = [
  {
    name: "Glow Serum",
    detail: "Serum dưỡng sáng da",
    price: "259.000đ",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600",
  },
  {
    name: "Hydra Cream",
    detail: "Kem dưỡng ẩm sâu",
    price: "320.000đ",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",
  },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#49313C" />
        </Pressable>
        <Text style={styles.title}>Sản phẩm yêu thích</Text>
        <Ionicons name="heart" size={23} color="#BC6280" />
      </View>

      <FlatList
        data={demoProducts.filter((p) => favorites.includes(p.name))}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={60} color="#D7A1B3" />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptyText}>
              Hãy khám phá và lưu những sản phẩm bạn thích nhé!
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => router.replace("/home")}
            >
              <Text style={styles.buttonText}>Khám phá sản phẩm</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <Pressable
              onPress={() =>
                setFavorites((prev) => prev.filter((n) => n !== item.name))
              }
            >
              <Ionicons name="heart" size={23} color="#BC6280" />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFAF8" },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 19, fontWeight: "800", color: "#49313C" },
  list: { padding: 20, flexGrow: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#49313C", marginTop: 18 },
  emptyText: { fontSize: 13, color: "#A18B94", textAlign: "center", marginTop: 8, lineHeight: 20 },
  button: { backgroundColor: "#BC6280", paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, marginTop: 20 },
  buttonText: { color: "#FFFFFF", fontWeight: "700" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 18, marginBottom: 12, gap: 12 },
  image: { width: 75, height: 80, borderRadius: 12, backgroundColor: "#F8E4E9" },
  info: { flex: 1, gap: 5 },
  name: { fontSize: 14, fontWeight: "800", color: "#49313C" },
  detail: { fontSize: 12, color: "#A18B94" },
  price: { fontSize: 14, fontWeight: "800", color: "#BC6280" },
});