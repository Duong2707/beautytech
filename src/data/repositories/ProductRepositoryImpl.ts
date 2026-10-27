import { Platform } from 'react-native';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import api from '../datasources/remote/api';

export class ProductRepositoryImpl implements IProductRepository {
  async getAll(): Promise<Product[]> {
    try {
      const response = await api.get('/api/products');
      const products = (response.data.data || []).map((p: any) => ({
        ...p,
        id: p._id 
      })) as Product[];

      if (Platform.OS !== 'web' && products.length > 0) {
        const { ProductLocalRepository } = require('../datasources/local/ProductLocalRepository');
        const localRepo = new ProductLocalRepository();
        await localRepo.saveProducts(products);
      }
      return products;
    } catch (error) {
      console.log('API failed, loading from local DB');
      if (Platform.OS === 'web') return []; 
      const { ProductLocalRepository } = require('../datasources/local/ProductLocalRepository');
      const localRepo = new ProductLocalRepository();
      return localRepo.getAll();
    }
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const response = await api.get(`/api/products/${id}`);
      return { ...response.data.data, id: response.data.data._id } as Product;
    } catch {
      if (Platform.OS === 'web') return null;
      const { ProductLocalRepository } = require('../datasources/local/ProductLocalRepository');
      const localRepo = new ProductLocalRepository();
      // ĐÃ SỬA: Thêm kiểu Product[]
      const local: Product[] = await localRepo.getAll();
      return local.find((p) => p.id === id) || null;
    }
  }

  async search(keyword: string): Promise<Product[]> {
    try {
      const response = await api.get(`/api/products/search?q=${keyword}`);
      return (response.data.data || []).map((p: any) => ({
        ...p,
        id: p._id
      })) as Product[];
    } catch {
      if (Platform.OS === 'web') return [];
      const { ProductLocalRepository } = require('../datasources/local/ProductLocalRepository');
      const localRepo = new ProductLocalRepository();
      // ĐÃ SỬA: Thêm kiểu Product[]
      const local: Product[] = await localRepo.getAll();
      return local.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
  }
}