import { database } from './database';
import { ProductTable } from './db-models/ProductTable';
import { Product } from '../../../domain/entities/Product';

export class ProductLocalRepository {
  async getAll(): Promise<Product[]> {
    const products = await database.get<ProductTable>('products').query().fetch();

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image,
      category: p.category,
    }));
  }

  async saveProducts(products: Product[]): Promise<void> {
    await database.write(async () => {
      const old = await database.get<ProductTable>('products').query().fetch();
      for (const p of old) {
        await p.destroyPermanently();
      }

      for (const product of products) {
        await database.get<ProductTable>('products').create((p) => {
          p.name = product.name;
          p.brand = product.brand;
          p.price = product.price;
          p.image = product.image;
          p.category = product.category;
          p.cachedAt = Date.now();
        });
      }
    });
  }
}