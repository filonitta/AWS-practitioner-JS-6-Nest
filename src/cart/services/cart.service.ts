import { Inject, Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Client } from 'pg';
import { Cart } from '../models';

@Injectable()
export class CartService {
  constructor(@Inject('DATABASE_CONNECTION') private client: Client) {}

  async findByUserId(userId: string): Promise<Cart> {
    const queryResult = await this.client.query(
      'SELECT * FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)',
      [userId],
    );

    return queryResult.rows[0]; // Assuming each user could only have one cart
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = v4();
    await this.client.query(
      `INSERT INTO carts (id, user_id, items) VALUES ($1, $2, ARRAY[]::uuid[]);`,
      [id, userId],
    );
    return this.findByUserId(userId);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (!cart) {
      return await this.createByUserId(userId);
    }

    return cart;
  }

  async updateByUserId(
    userId: string,
    cartItem: { product_id: string; count: number },
  ): Promise<Cart> {
    await this.client.query('BEGIN');

    const res = await this.client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId],
    );

    if (res.rows.length > 0) {
      const cartId = res.rows[0].id;

      const { product_id, count } = cartItem;

      await this.client.query(
        'UPDATE cart_items SET product_id = $1, count = $2 WHERE cart_id = $3',
        [product_id, count, cartId],
      );

      // Commit transaction
      await this.client.query('COMMIT');
    } else {
      await this.client.query('ROLLBACK');
      throw new Error('Invalid user_id');
    }

    return this.findByUserId(userId);
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.client.query('DELETE FROM carts WHERE user_id = $1', [userId]);
  }
}
