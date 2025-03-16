/* eslint-disable no-unused-vars */
 
import { Account, Client, ID } from "appwrite";
import conf from "../conf/conf.js";


class AuthServices {
  

  client;
  account;

  constructor() {
    this.client = new Client();
    console.log(conf);
    
    this.client
      .setEndpoint(conf.endpoint) // Your Appwrite Endpoint
      .setProject(conf.projectId); // Your project ID
    this.account = new Account(this.client);

    
  }

  async signup({ email, password, name }) {
    try {
      return await this.account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      // const exitedUser = await this.account.get();
      // if(exitedUser) 
        // await this.logout();
      const session = await this.account.createEmailPasswordSession(
        email,
        password
      );
      console.log("Login successful:", session);
      return session;
      
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async verify() {
    try {
      const res=  await this.account.createVerification('http://localhost:5173/verify');
        console.log("Verification successful:", res);
    } catch (error) {
      console.error("Verification failed:", error);
      throw error;
    }
  }
  async setVerification(userId, secret) {
    try {
        return await this.account.updateVerification(userId, secret);
    }
    catch (error) {
        console.error("Verification failed:", error);
        throw error;
    }
    }

  async logout() {
    try {
      return await this.account.deleteSessions();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.error("Get user failed:", error);
      throw error;
    }
  }

}

const authServices = new AuthServices();
export default authServices;
export { AuthServices };
