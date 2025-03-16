/* eslint-disable no-undef */
import { Account, Client, Databases, ID } from "appwrite";
import conf from "../conf/conf.js";

class CardServices {
  client;
  account;
  databases;
  constructor() {
    this.client = new Client();
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.client
      .setEndpoint(conf.endpoint) // Your Appwrite Endpoint
      .setProject(conf.projectId); // Your project ID
  }

    async addProductToCart(userId, productId) {
        try {
        const result = await this.databases.createDocument(
            conf.databaseId, // databaseId
            conf.cartCollectionId, // collectionId
            {
            userId,
            productId,
            quantity: 1,
            }
        );
        return result;
        } catch (error) {
        console.error("Add product to cart failed:", error);
        throw error;
        }
    }
}
