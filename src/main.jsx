/* eslint-disable no-unused-vars */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
// import ThemeProvider from "./components/Container/ThemeProvider.jsx";
import Home from "./pages/Home.jsx";
import loginAndSignUp from "./pages/loginAndSignUp.jsx";
import LoginAndSignUp from "./pages/loginAndSignUp.jsx";
import VerifiyEmail from "./pages/VerifiyEmail.jsx";
import Cart from "./pages/Cart.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";


const router = createBrowserRouter([
  
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/home",
            element: <Home />,
        },
        {
          path: "/login",
          element: <LoginAndSignUp/>

        },
        {
          path:'/cart',
          element: <Cart/>,
        },
        {
          path: '/products',
          element:<ProductsPage/>,
          },
       
    ],
  },
  {
    path: "/verify",
    element: <VerifiyEmail/>

  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      {/* <ThemeProvider> */}

      <RouterProvider router={router} />
      {/* </ThemeProvider> */}
    </Provider>
  </StrictMode>
);
