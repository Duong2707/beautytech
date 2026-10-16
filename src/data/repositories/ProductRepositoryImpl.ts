import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import api from '../datasources/remote/api';
import { ProductLocalRepository } from '../datasources/local/ProductLocalRepository';

const localRepo = new ProductLocalRepository();

export class ProductRepositoryImpl implements IProductRepository {
  async getAll(): Promise<Product[]> {
    try {
      const response = await api.get('/api/products');
      const products = (response.data.data || []) as Product[];

      // Lưu vào local DB để dùng offline sau này
      if (products.length > 0) {
        await localRepo.saveProducts(products);
      }

      return products;
    } catch (error) {
      // Mất mạng → đọc từ local DB
      console.log('API failed, loading from local DB');
      return localRepo.getAll();
    }
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data.data as Product;
    } catch {
      // Mất mạng → tìm trong local DB
      const local = await localRepo.getAll();
      return local.find((p) => p.id === id) || null;
    }
  }

  async search(keyword: string): Promise<Product[]> {
    try {
      const response = await api.get(`/api/products/search?q=${keyword}`);
      return (response.data.data || []) as Product[];
    } catch {
      // Mất mạng → tìm trong local DB
      const local = await localRepo.getAll();
      return local.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
  }
}