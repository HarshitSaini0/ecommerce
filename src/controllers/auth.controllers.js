/* eslint-disable no-unused-vars */
 
import { Account, Client, ID } from "appwrite";
import conf from "../conf/conf";


class AuthServices {
 

  client;
  account;

  constructor() {
    this.client = new Client();
    this.account = new Account(this.client);

    this.client
      .setEndpoint(conf.endpoint) // Your Appwrite Endpoint
      .setProject(conf.project_id); // Your project ID
  }

  async register({ email, password, name }) {
    try {
      return await this.account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
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

  async loginViaMail({email}){
    try {
      const sessionToken  = await this.account.createEmailToken(
        ID.unique(),
        email
      );
      const userId = sessionToken.userId;
     const secret_otp =  prompt("Email OTP here : ");
     const session = await this.account.createSession(
      userId,
      secret_otp
  );
      console.log("Login successful:", session);
    }
    catch (error) {
      console.error("Login failed:", error);
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
