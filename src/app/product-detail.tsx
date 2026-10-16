
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const defaultProducts = [
  {
    name: 'Glow Serum',
    detail: 'Serum dưỡng sáng da',
    price: '259.000đ',
    image:
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    tag: 'BÁN CHẠY',
    description:
      'Serum chăm sóc da hằng ngày, giúp làn da trông tươi tắn và rạng rỡ hơn. Phù hợp để bổ sung vào quy trình chăm sóc da cá nhân.',
    sizes: ['15ml', '30ml', '50ml'],
  },
  {
    name: 'Hydra Cream',
    detail: 'Kem dưỡng ẩm sâu',
    price: '320.000đ',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80',
    tag: 'YÊU THÍCH',
    description:
      'Kem dưỡng ẩm cho quy trình chăm sóc da hằng ngày. Sử dụng sau bước làm sạch và các sản phẩm dưỡng da phù hợp.',
    sizes: ['30ml', '50ml', '80ml'],
  },
  {
    name: 'Pure Cleanser',
    detail: 'Sữa rửa mặt dịu nhẹ',
    price: '189.000đ',
    image:
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&auto=format&fit=crop&q=80',
    tag: 'MỚI',
    description:
      'Sản phẩm làm sạch da trong quy trình chăm sóc hằng ngày. Hãy chọn sản phẩm phù hợp với loại da và nhu cầu của bạn.',
    sizes: ['100ml', '150ml', '200ml'],
  },
  {
    name: 'Daily Sunscreen',
    detail: 'Kem chống nắng SPF 50+',
    price: '285.000đ',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    tag: 'NỔI BẬT',
    description:
      'Kem chống nắng dùng trong quy trình chăm sóc da ban ngày. Thực hiện theo hướng dẫn sử dụng trên bao bì sản phẩm.',
    sizes: ['30ml', '50ml', '70ml'],
  },
  {
    name: 'Rose Toner',
    detail: 'Nước cân bằng da dịu nhẹ',
    price: '199.000đ',
    image:
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&auto=format&fit=crop&q=80',
    tag: 'BÁN CHẠY',
    description:
      'Nước cân bằng da có thể được sử dụng sau bước làm sạch, tùy theo nhu cầu và quy trình chăm sóc da của bạn.',
    sizes: ['100ml', '150ml', '200ml'],
  },
  {
    name: 'Vitamin C Serum',
    detail: 'Serum vitamin C chăm sóc da',
    price: '349.000đ',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80',
    tag: 'NỔI BẬT',
    description:
      'Serum vitamin C dành cho quy trình chăm sóc da. Nên thử sản phẩm trên một vùng da nhỏ và làm theo hướng dẫn của nhà sản xuất.',
    sizes: ['15ml', '30ml', '50ml'],
  },
  {
    name: 'Soft Cleansing Oil',
    detail: 'Dầu tẩy trang làm sạch',
    price: '229.000đ',
    image:
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    tag: 'MỚI',
    description:
      'Dầu tẩy trang hỗ trợ làm sạch lớp trang điểm và bụi bẩn. Sử dụng theo hướng dẫn trên bao bì.',
    sizes: ['100ml', '150ml', '200ml'],
  },
  {
    name: 'Repair Night Cream',
    detail: 'Kem dưỡng da ban đêm',
    price: '389.000đ',
    image:
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&auto=format&fit=crop&q=80',
    tag: 'YÊU THÍCH',
    description:
      'Kem dưỡng dùng trong quy trình chăm sóc da buổi tối. Lựa chọn sản phẩm phù hợp với nhu cầu của làn da.',
    sizes: ['30ml', '50ml', '80ml'],
  },
  {
    name: 'Lip Care Balm',
    detail: 'Son dưỡng môi mềm mịn',
    price: '129.000đ',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    tag: 'MỚI',
    description:
      'Sản phẩm chăm sóc môi tiện lợi, phù hợp để mang theo và sử dụng theo nhu cầu hằng ngày.',
    sizes: ['3g', '5g', '10g'],
  },
  {
    name: 'Hydrating Face Mask',
    detail: 'Mặt nạ cấp ẩm cho da',
    price: '79.000đ',
    image:
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop&q=80',
    tag: 'GIÁ TỐT',
    description:
      'Mặt nạ dùng bổ sung vào quy trình chăm sóc da. Thời gian sử dụng nên theo hướng dẫn của nhà sản xuất.',
    sizes: ['1 miếng', '5 miếng', '10 miếng'],
  },
  {
    name: 'Eye Repair Cream',
    detail: 'Kem dưỡng vùng da quanh mắt',
    price: '299.000đ',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80',
    tag: 'YÊU THÍCH',
    description:
      'Kem dưỡng dành cho vùng da quanh mắt. Tránh để sản phẩm tiếp xúc trực tiếp với mắt và đọc kỹ hướng dẫn.',
    sizes: ['15ml', '20ml', '30ml'],
  },
  {
    name: 'Body Lotion',
    detail: 'Sữa dưỡng thể mềm mịn',
    price: '219.000đ',
    image:
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&auto=format&fit=crop&q=80',
    tag: 'NỔI BẬT',
    description:
      'Sữa dưỡng thể dùng trong quy trình chăm sóc da cơ thể hằng ngày.',
    sizes: ['200ml', '300ml', '400ml'],
  },
];

export default function ProductDetailScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    name?: string;
    detail?: string;
    price?: string;
    image?: string;
    tag?: string;
  }>();

  const paramName = Array.isArray(params.name)
    ? params.name[0]
    : params.name;

  const product =
    defaultProducts.find((item) => item.name === paramName) ??
    defaultProducts[0];

  const name = paramName || product.name;
  const detail = params.detail || product.detail;
  const price = params.price || product.price;
  const image =
    (Array.isArray(params.image) ? params.image[0] : params.image) ||
    product.image;
  const tag =
    (Array.isArray(params.tag) ? params.tag[0] : params.tag) ||
    product.tag;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1]);
  const [favorite, setFavorite] = useState(false);

  const addToCart = () => {
    Alert.alert(
      'Đã thêm vào giỏ hàng',
      `${name}\nDung tích: ${selectedSize}\nSố lượng: ${quantity}\nGiá tham khảo: ${price}`,
      [
        { text: 'Tiếp tục mua sắm', style: 'cancel' },
        {
          text: 'Xem giỏ hàng',
          onPress: () => {
            Alert.alert(
              'Thông báo',
              'Đây là bản giao diện mẫu. Giỏ hàng cần được kết nối với kho dữ liệu dùng chung để lưu sản phẩm.',
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#49313C" />
          </Pressable>

          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>

          <Pressable
            style={styles.iconButton}
            onPress={() => setFavorite((value) => !value)}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={22}
              color={favorite ? '#C15E80' : '#49313C'}
            />
          </Pressable>
        </View>

        {/* PRODUCT IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.productImage}
            resizeMode="cover"
          />

          <View style={styles.productTag}>
            <Ionicons name="sparkles" size={12} color="#A65370" />
            <Text style={styles.productTagText}>{tag}</Text>
          </View>

          <Pressable
            style={styles.imageFavorite}
            onPress={() => setFavorite((value) => !value)}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={23}
              color={favorite ? '#C15E80' : '#795965'}
            />
          </Pressable>

          <View style={styles.imageIndicator}>
            <View style={styles.indicatorActive} />
            <View style={styles.indicatorInactive} />
            <View style={styles.indicatorInactive} />
          </View>
        </View>

        {/* PRODUCT INFORMATION */}
        <View style={styles.content}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>BEAUTYTECH COLLECTION</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#D9A24A" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.reviewText}>(Mẫu)</Text>
            </View>
          </View>

          <Text style={styles.productName}>{name}</Text>
          <Text style={styles.productSubtitle}>{detail}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price}</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>Ưu đãi</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* SIZE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dung tích / Phân loại</Text>
              <Text style={styles.selectedSizeText}>{selectedSize}</Text>
            </View>

            <View style={styles.sizeRow}>
              {product.sizes.map((size) => {
                const selected = selectedSize === size;

                return (
                  <Pressable
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.sizeButton,
                      selected && styles.sizeButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selected && styles.sizeTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* QUANTITY */}
          <View style={styles.quantitySection}>
            <View>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <Text style={styles.quantityHint}>
                Chọn số sản phẩm muốn mua
              </Text>
            </View>

            <View style={styles.quantityControl}>
              <Pressable
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                disabled={quantity <= 1}
                onPress={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                <Ionicons name="remove" size={19} color="#8D596D" />
              </Pressable>

              <Text style={styles.quantityText}>{quantity}</Text>

              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity((current) => Math.min(99, current + 1))
                }
              >
                <Ionicons name="add" size={19} color="#8D596D" />
              </Pressable>
            </View>
          </View>

          {/* BENEFITS */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#B65D7B"
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Chọn lọc kỹ</Text>
                <Text style={styles.benefitSubtitle}>
                  Thông tin sản phẩm rõ ràng
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#B65D7B"
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Chăm sóc bản thân</Text>
                <Text style={styles.benefitSubtitle}>
                  Tìm sản phẩm phù hợp với bạn
                </Text>
              </View>
            </View>
          </View>

          {/* AI RECOMMENDATION */}
          <View style={styles.aiCard}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>Chưa biết có hợp với da?</Text>
              <Text style={styles.aiDescription}>
                Khám phá tính năng AI để tìm hiểu thêm về làn da của bạn.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={19} color="#B65D7B" />
          </View>

          <Text style={styles.disclaimer}>
            * Giá, dung tích, hình ảnh và thông tin trong trang này là dữ liệu
            minh họa cho giao diện ứng dụng.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.bottomIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="storefront-outline" size={22} color="#B65D7B" />
          <Text style={styles.bottomIconText}>Cửa hàng</Text>
        </Pressable>

        <Pressable
          style={styles.addCartButton}
          onPress={addToCart}
        >
          <Ionicons name="bag-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addCartText}>Thêm vào giỏ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFAF8',
  },
  scrollContent: {
    paddingBottom: 25,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F8EDF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#49313C',
  },
  imageContainer: {
    marginHorizontal: 20,
    height: 330,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#F5E6EA',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productTag: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFFE8',
  },
  productTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#A65370',
  },
  imageFavorite: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFFE8',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#FFFFFFD9',
  },
  indicatorActive: {
    width: 18,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#B95E7D',
  },
  indicatorInactive: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#D8B7C3',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#B16D83',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#634A56',
    fontWeight: '800',
  },
  reviewText: {
    fontSize: 10,
    color: '#A18A94',
  },
  productName: {
    marginTop: 12,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '900',
    color: '#49313C',
    letterSpacing: -0.5,
  },
  productSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#A18A94',
  },
  priceContainer: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 23,
    fontWeight: '900',
    color: '#BC5E7E',
  },
  priceBadge: {
    backgroundColor: '#F8E4E9',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A65370',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E4E8',
    marginTop: 23,
  },
  section: {
    marginTop: 23,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#49313C',
  },
  description: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 21,
    color: '#856D78',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSizeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B65D7B',
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 13,
  },
  sizeButton: {
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E4E8',
  },
  sizeButtonSelected: {
    backgroundColor: '#F8E4E9',
    borderColor: '#BC6280',
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#856D78',
  },
  sizeTextSelected: {
    color: '#A65370',
  },
  quantitySection: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityHint: {
    marginTop: 5,
    fontSize: 10,
    color: '#A18A94',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 5,
    borderRadius: 13,
    backgroundColor: '#F8EDF0',
  },
  quantityButton: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityText: {
    minWidth: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
    color: '#49313C',
  },
  benefitsCard: {
    marginTop: 25,
    padding: 15,
    gap: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8EC',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8EDF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#634A56',
  },
  benefitSubtitle: {
    marginTop: 4,
    fontSize: 10,
    color: '#A18A94',
  },
  aiCard: {
    marginTop: 22,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#F5E8DF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#B66D7D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#563C43',
  },
  aiDescription: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: '#876B70',
  },
  disclaimer: {
    marginTop: 18,
    fontSize: 10,
    lineHeight: 16,
    color: '#AE9BA3',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2E6EA',
  },
  bottomIconButton: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomIconText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A65370',
  },
  addCartButton: {
    flex: 1,
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#BC6280',
    borderRadius: 15,
  },
  addCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
