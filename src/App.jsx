import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import authServices from "./appwrite/auth"
import { useDispatch } from "react-redux"
import { login as loginAction } from "./store/authSlice"




function App() {

  
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await authServices.getCurrentUser();
        if (userData) {
          dispatch(loginAction({ userData }));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } 
    }
    fetchData();
  }, [dispatch]);

  return (
    <>
      <header>header</header>
      <Outlet></Outlet>
      <footer>footer</footer>
    </>
  )
}

export default App
