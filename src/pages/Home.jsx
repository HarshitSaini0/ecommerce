import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import productsServices from '../appwrite/product.js';

function Home() {
  const [products, setProducts] = useState();
  const [oneProduct, setOneProduct] = useState();
  const userData = useSelector((state) => state.auth.userData);
  useEffect(() => {
    productsServices.getAllProducts().then((response) => {
      setProducts(response);
      // console.log(response[0].images[0]);
      // console.log(products);
      
    });
  }, []);
  useEffect(() => {
    productsServices.getProduct("67d1aa0b000ebf8cd3b1").then((response) => {
      setOneProduct(response);
    }
    , []);

  }
  , [products]);
  useEffect(() => {
    console.log(products); // ✅ Logs updated products when state changes
  }, [products]); 
  
  return (
    <>
    <div>Home</div>
    { userData ? <span>{userData.email}</span> : <span>Not logged in</span> }
  {/* {products && <img src={products[0].images[0]} alt="" />} */}

  {/* {products && products.map((product) => (
    <div key={product.id}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <img src={product.images[0]} alt="" />
    </div>
  ))} */}


  {oneProduct && (
    <div key={oneProduct.id}>
      <h2>{oneProduct.name}</h2>
      <p>{oneProduct.description}</p>
      <img src={oneProduct.images[0]} alt="" />
    </div>
  )}
    </>
  )
}

export default Home