import { Account, Client, Databases, ID, Query } from "appwrite";
import conf from "../conf/conf.js";
import productsServices from "./product.js";

class CartService {  // Changed class name to singular
  client = new Client()
    .setEndpoint(conf.endpoint)
    .setProject(conf.projectId);
    
  databases = new Databases(this.client);
  account = new Account(this.client);

  async createCart(userId) {
    try {
      const cart = await this.databases.createDocument(
        conf.databaseId,
        conf.cartCollectionId,
        ID.unique(),
        {
          userId,
          productsId: [],
          productQuantity: [],
          totalAmount: 0,
        }
      );
      return cart;
    } catch (error) {
      console.error("Create cart failed:", error);
      throw error;
    }
  }

  async getCart(userId) {
    try {
      const response = await this.databases.listDocuments(
        conf.databaseId,
        conf.cartCollectionId,
        [Query.equal("userId", userId)]
      );
      if(response.documents.length === 0) {
        const cart = await this.createCart(userId);
        return cart;
      }
      
      return response.documents[0] || null;
    } catch (error) {
      console.error("Get cart failed:", error);
      throw error;
    }
  }

  async updateCart(userId, { productIds = [], quantities = [] }) {
    try {
      // Validate input
      if (productIds.length !== quantities.length) {
        throw new Error("Arrays must match in length");
      }

      // Calculate total
      const prices = await Promise.all(
        productIds.map(id => 
          productsServices.getProduct(id).then(p => p.price)
        )
      );
      const total = prices.reduce(
        (sum, price, i) => sum + (price * quantities[i]),
        0
      );

      // Check for existing cart
      const existing = await this.getCart(userId);

      if (existing) {
        return await this.databases.updateDocument(
          conf.databaseId,
          conf.cartCollectionId,
          existing.$id,
          {
            userId,
            productsId: productIds,
            productQuantity: quantities,
            totalAmount: total,
          }
        );
      } else {
        return await this.databases.createDocument(
          conf.databaseId,
          conf.cartCollectionId,
          ID.unique(),
          {
            userId,
            productsId: productIds,
            productQuantity: quantities,
            totalAmount: total,
          }
        );
      }
    } catch (error) {
      console.error("Cart update failed:", error);
      throw error;
    }
  }

  async deleteCart(cartId) {
    try {
      return await this.databases.deleteDocument(
        conf.databaseId,
        conf.cartCollectionId,
        cartId
      );
      } catch (error) {
      console.error("Delete cart failed:", error);
      throw error;
      }
}}

const cartService = new CartService();  // Singular instance name
export default cartService;