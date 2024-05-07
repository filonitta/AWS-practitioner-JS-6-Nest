import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Client } from 'pg';
import { Cart } from '../models';

@Injectable()
export class CartService {
  private client: Client;

  constructor() {
    this.client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    this.client.connect();
  }

  async findByUserId(userId: string): Promise<Cart> {
    const queryResult = await this.client.query(
      'SELECT * FROM carts WHERE user_id = $1',
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

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    await this.client.query('UPDATE carts SET items = $1 WHERE user_id = $2', [
      items,
      userId,
    ]);

    return this.findByUserId(userId);
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.client.query('DELETE FROM carts WHERE user_id = $1', [userId]);
  }
}
