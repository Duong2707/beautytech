import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class SkinProfileTable extends Model {
  static table = 'skin_profiles';

  @text('condition') condition!: string;
  @field('confidence') confidence!: number;
  @text('probabilities') probabilities!: string;
  @field('created_at') createdAt!: number;
}