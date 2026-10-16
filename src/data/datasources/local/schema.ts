import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'image', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'cached_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'skin_profiles',
      columns: [
        { name: 'condition', type: 'string' },
        { name: 'confidence', type: 'number' },
        { name: 'probabilities', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});