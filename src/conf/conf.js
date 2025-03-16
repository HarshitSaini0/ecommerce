const conf = {
    projectId : import.meta.env.VITE_APPWRITE_PROJECT_ID,
    endpoint : import.meta.env.VITE_APPWRITE_ENDPOINT,
    databaseId : import.meta.env.VITE_DATABASE_ID,
   
    cartCollectionId : import.meta.env.VITE_COLLECTION_CARTS_ID,
    productsCollectionId : import.meta.env.VITE_COLLECTION_PRODUCTS_ID,
    ordersCollectionId : import.meta.env.VITE_COLLECTION_ORDERS_ID,

}

export default conf;