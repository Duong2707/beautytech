import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import api from '../datasources/remote/api';

export class ProductRepositoryImpl implements IProductRepository {
  async getAll(): Promise<Product[]> {
    try {
      const response = await api.get('/api/products');
      return (response.data.data || []) as Product[];
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data.data as Product;
    } catch {
      return null;
    }
  }

  async search(keyword: string): Promise<Product[]> {
    try {
      const response = await api.get(`/api/products/search?q=${keyword}`);
      return (response.data.data || []) as Product[];
    } catch {
      return [];
    }
  }
}