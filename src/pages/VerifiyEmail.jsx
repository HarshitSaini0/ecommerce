/* eslint-disable no-undef */
import React, { useEffect } from "react";
import { AuthServices } from "../appwrite/auth";

function VerifiyEmail() {
  async function verify() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");
      const secret = urlParams.get("secret");
      await AuthServices.setVerification(userId, secret);
    } catch (error) {
      console.error("Verification Error:", error);
    }
  }
  useEffect(() => {
    verify();
  }, []);

  return <div>VerifiyEmail</div>;
}

export default VerifiyEmail;
