import { useState, useEffect } from 'react';
import { Product } from '../../domain/entities/Product';
import { ProductRepositoryImpl } from '../../data/repositories/ProductRepositoryImpl';

const productRepo = new ProductRepositoryImpl();

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productRepo.getAll();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refresh: fetchProducts };
}