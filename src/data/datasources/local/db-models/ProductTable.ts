import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class ProductTable extends Model {
  static table = 'products';

  @text('name') name!: string;
  @text('brand') brand!: string;
  @field('price') price!: number;
  @text('image') image!: string;
  @text('category') category!: string;
  @field('cached_at') cachedAt!: number;
}