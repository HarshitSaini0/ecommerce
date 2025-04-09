/* eslint-disable no-undef */
import { Account, Client, Databases, ID, Query } from "appwrite";
import conf from "../conf/conf.js";

class ProductServices {
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

  async getAllProducts() {
    try {
      const result = await this.databases.listDocuments(
        conf.databaseId, // databaseId
        conf.productsCollectionId, // collectionId
        [] // queries (optional)
      );

      return result.documents;
    } catch (error) {
      console.error("Get all products failed:", error);
      throw error;
    }
  }

  async  getProductsPrice(products) {
    try {
       const productsPrice = products.map(async (product) => {
        const result = await this.databases.getDocument(
          conf.databaseId, // databaseId
          conf.productsCollectionId, // collectionId
          product, // documentId
          [Query.select(['price'])] // filters (optional)
        );
        if (!result.price) {
          return null;
        }
        console.log(result);
        
        return result.price;
      });
     
      
      return productsPrice;
      } catch (error) {
        console.error("Get products price failed:", error);
        throw error;
      }
  }

  async getProduct(productId) {
    try {
      const result = await this.databases.getDocument(
        conf.databaseId, // databaseId
        conf.productsCollectionId, // collectionId
        productId, // documentId
        [] // filters (optional)
      );
      return result;
    } catch (error) {
      console.error("Get product failed:", error);
      throw error;
    }
  }
}
const productServices = new ProductServices();
export default productServices;
export { ProductServices };
