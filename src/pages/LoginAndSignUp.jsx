/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { useForm } from "react-hook-form";
import authServices from "../appwrite/auth";
import {login as loginAction, logout as logoutAction} from "../store/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


function LoginAndSignUp() {
  const navigate = useNavigate();

  // Separate useForm instances for signup and login
  const dispatch = useDispatch();
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: errorsSignup },
  } = useForm();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm();
  const onVerify = async () => {
    try {
      await authServices.verify();
    }
    catch (error) {
      console.error("Login Error:", error);
    }
}

  // Signup function
  const onSignup = async (data) => {
    try {
      console.log("Signup Data:", data);
      await authServices.signup(data);
    } catch (error) {
      console.error("Signup Error:", error);
    }
  };

  // Login function
  const onLogin = async (data) => {
    try {
      const session = await authServices.login(data);
      if (session) {
        const userData = await authServices.getCurrentUser();
        if (userData) {
          dispatch(loginAction({ userData }));
          setTimeout(() => navigate("/home"), 2000);
        }
      }

      
      
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const onLogout = async () => {
    try {
      await authServices.logout().then(() => {
        dispatch(logoutAction())
        navigate('/home')
        })
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }


  return (
    <div>
      <h1>Login and Sign Up</h1>

      {/* Signup Form */}
      <form onSubmit={handleSubmitSignup(onSignup)}>
        <input
          {...registerSignup("name", { required: "name is required" })}
          placeholder="Name"
        />
        {errorsSignup.name && <p>{errorsSignup.name.message}</p>}

        <input
          {...registerSignup("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/, message: "Invalid email format" },
          })}
          placeholder="Email"
        />
        {errorsSignup.email && <p>{errorsSignup.email.message}</p>}

        <input
          type="password"
          {...registerSignup("password", { required: "Password is required" })}
          placeholder="Password"
        />
        {errorsSignup.password && <p>{errorsSignup.password.message}</p>}

        <input type="submit" value="Signup" />
      </form>

      {/* Login Form */}
      <form onSubmit={handleSubmitLogin(onLogin)}>
        <input
          {...registerLogin("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/, message: "Invalid email format" },
          })}
          placeholder="Email"
        />
        {errorsLogin.email && <p>{errorsLogin.email.message}</p>}

        <input
          type="password"
          {...registerLogin("password", { required: "Password is required" })}
          placeholder="Password"
        />
        {errorsLogin.password && <p>{errorsLogin.password.message}</p>}

        <input type="submit" value="Login" />
      </form>
     <button onClick={onVerify}>button</button>
     <button onClick={onLogout} >logout</button>
    </div>
  );
}


export default LoginAndSignUp;
