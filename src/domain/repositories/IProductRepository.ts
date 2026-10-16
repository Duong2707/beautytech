import { Product } from '../entities/Product';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  search(keyword: string): Promise<Product[]>;
}