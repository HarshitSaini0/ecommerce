# E-commerce App with React and Appwrite

This repository contains a React-based e-commerce web application that uses Appwrite for its backend services (authentication, database, storage, and serverless functions). The app demonstrates how to configure and use Appwrite’s SDK to handle user accounts, data storage, file uploads, and custom backend logic.

## Setup

1. **Prerequisites:** Install Node.js (v14+) and Docker.

2. **Clone the repo:**

   ```bash
   git clone https://github.com/HarshitSaini0/ecommerce.git
   cd ecommerce
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Appwrite Backend:** You can use Appwrite Cloud or self-host Appwrite. For self-hosting, run Appwrite via Docker (Appwrite runs on any OS with Docker). For example, follow the [Appwrite installation guide](https://appwrite.io/docs/advanced/self-hosting) or run the install script:

   ```bash
   docker run -it --rm \
     --volume /var/run/docker.sock:/var/run/docker.sock \
     --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
     --entrypoint="install" \
     appwrite/appwrite:1.7.4
   ```

   Or use Docker Compose:

   ```bash
   docker-compose up -d
   ```

   This will start the Appwrite server. Ensure you map the ports (usually 80/443) as instructed. Once Appwrite is running, go to your Appwrite Console. Create a new project (e.g. "EcommerceApp") and add a Web platform with the hostname `localhost` (or your domain).

5. **Configure Appwrite in the App:** In the Appwrite Console, under **Settings** find your *Project ID* and region/endpoint URL. In the React code (typically `src/lib/appwrite.js`), initialize the Appwrite client with these values. For example:

   ```js
   import { Client, Account, Databases, Storage, Functions } from 'appwrite';

   const client = new Client()
     .setEndpoint('https://<REGION>.cloud.appwrite.io/v1') // e.g. "https://us-east-1.appwrite.io/v1"
     .setProject('<PROJECT_ID>'); // your project ID

   // Export Appwrite services for use in the app
   export const account   = new Account(client);
   export const databases = new Databases(client);
   export const storage   = new Storage(client);
   export const functions = new Functions(client);
   export { ID } from 'appwrite';
   ```

   Replace `<REGION>` and `<PROJECT_ID>` with your own values.

6. **Set Up Collections/Buckets:** In the Appwrite Console, create a Database (e.g. `ecommerceDB`) and Collections as needed (e.g. `products`, `orders`). In each collection, define attributes for your data (e.g. `name`, `price`, `description` for products). Also create a Storage bucket for file uploads (e.g. `productImages`). Configure permissions (e.g. allow `any` read on product images so they are public). See [Appwrite docs](https://appwrite.io/docs/tutorials/react/step-6) for creating a database and collections.

7. **Environment Variables (if any):** If the app uses a `.env` file (e.g. for `REACT_APP_APPWRITE_ENDPOINT`), make sure to set these. The examples above use in-code config, but you can also use environment variables to avoid hardcoding.

8. **Run the App:** Start the development server:

   ```bash
   npm run dev   # or npm start
   ```

   The app will open at `http://localhost:3000` (or another port if configured). You should now be able to sign up, log in, and see the app connect to your Appwrite backend.

## Folder Structure

```
ecommerce/
├── public/            # Static assets and index.html
├── src/               # React source code
│   ├── lib/           # Appwrite SDK configuration
│   │   └── appwrite.js  # Appwrite Client setup (endpoint, project ID)
│   ├── components/    # Reusable React components (e.g. ProductCard, Navbar)
│   ├── pages/         # Page views (e.g. HomePage, ProductPage, CartPage)
│   ├── context/       # React Context providers (e.g. AuthContext, CartContext)
│   ├── App.jsx        # Main app component (routing, layout)
│   └── index.js       # ReactDOM render and setup
├── functions/         # (Optional) Appwrite Cloud Function source code (Node.js, Python, etc.)
├── .env               # Environment variables (Appwrite endpoint, project ID, etc.)
├── package.json       # Dependencies and scripts (e.g. start, build)
└── README.md          # Documentation (you are here)
```

* **`src/lib/appwrite.js`**: Configures the Appwrite `Client` with the API endpoint and project ID, and exports service instances (`Account`, `Databases`, `Storage`, `Functions`) for use elsewhere.
* **`src/components/`**: Contains React components for the UI (product cards, forms, buttons, etc.).
* **`src/pages/`**: Contains top-level page components (like product listing, product details, shopping cart, checkout).
* **`src/context/`**: (If used) Contains context providers for global state, such as authentication or shopping cart data.
* **`functions/`**: If the app uses Appwrite Functions, put the source code here (for example, a Node.js script to process orders). These are deployed separately to Appwrite.
* **`.env`**: Stores environment variables (such as `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`) so you don’t hardcode credentials.
* **`package.json`**: Lists project dependencies (including the `appwrite` SDK) and defines scripts (`npm run dev`, `npm run build`, etc.).

## Authentication (Appwrite Auth)

Appwrite’s Authentication service handles user sign-up, login, and session management. In React, you use the `Account` service exported from `appwrite.js`.

* **Register (Sign Up):** Create a new user account with an email and password. For example:

  ```js
  // Register a new user account
  await account.create(
    ID.unique(), // unique user ID (Appwrite can also autogenerate if empty)
    email,
    password,
    name        // e.g. user’s name
  );
  // Immediately create a session (log in) after registration
  await account.createEmailPasswordSession(email, password);
  ```

  The `account.create()` call registers the user. `ID.unique()` generates a new unique ID (you can also use an empty string to let Appwrite auto-generate one). After registering, we call `createEmailPasswordSession` to log the user in.

* **Login:** Authenticate an existing user:

  ```js
  // Log in
  await account.createEmailPasswordSession(email, password);
  const user = await account.get(); // fetch authenticated user info
  ```

  This creates a new login session. You can then call `account.get()`, which returns the user’s details (ID, email, name, etc.). (This is how you verify the user is logged in.)

* **Session Management:** Appwrite’s client SDK is stateless, so your app must track the login state (e.g. in React state or context). For example, after login you might save `user` to state. To check if a user is logged in (e.g. on app load), call `account.get()`. If it succeeds, the user is logged in; otherwise it throws an error.

* **Logout:** End the current session by deleting it:

  ```js
  await account.deleteSession('current');
  ```

  This removes the user’s session token, effectively logging them out. In your UI, you should then clear any stored user info (e.g. set user state to null).

## Database (Appwrite Databases)

The app stores data (like products, orders, user info, etc.) in Appwrite Databases. Appwrite organizes data into *databases* and *collections*; each collection contains documents.

* **Setup Collections:** In the Appwrite Console, create a Database (e.g. `ecommerceDB`) and within it create Collections such as `products` or `orders`. Add attributes (fields) to each collection (e.g., `name`, `price`, `description` for products). Configure permissions on each collection (for example, allow anyone to read products but restrict order writing to the authenticated user).

* **Create (Write) Documents:** Use the Appwrite SDK to add documents to collections. For example, to add a new product:

  ```js
  const newProduct = await databases.createDocument(
    'DATABASE_ID',          // your database ID
    'PRODUCTS_COLLECTION_ID', // the products collection ID
    ID.unique(),             // unique document ID
    {                        // data payload
      name: 'Example Item',
      price: 29.99,
      description: 'A great product',
      imageUrl: 'https://...'
    }
  );
  ```

  This creates a new document in the `products` collection. The returned `newProduct` object contains the saved data including generated metadata.

* **Read (Query) Documents:** To fetch data, use `listDocuments`. For example, to get all products (optionally sorted):

  ```js
  const res = await databases.listDocuments(
    'DATABASE_ID',
    'PRODUCTS_COLLECTION_ID',
    [ Query.orderDesc('$createdAt') ] // optional query (newest first)
  );
  const products = res.documents;
  ```

  The `res.documents` array contains the product documents. You can also use other `Query` methods (filter, limit, search, etc.) as needed.

* **Update/Delete:** Similarly, use `updateDocument` to update fields of a document, and `deleteDocument` to remove one. For example:

  ```js
  await databases.updateDocument(
    'DATABASE_ID',
    'PRODUCTS_COLLECTION_ID',
    productId,
    { price: 24.99 }  // only updating the price
  );
  await databases.deleteDocument(
    'DATABASE_ID',
    'ORDERS_COLLECTION_ID',
    orderId
  );
  ```

  The API references document how to use these methods.

## Storage (Appwrite Storage)

Product images or other files are handled by Appwrite Storage. First, create a **Storage Bucket** in the console (e.g. `product-images`).

* **Upload Files:** Use `storage.createFile(bucketId, fileId, file)` to upload. In React, if you have a file input (`<input type="file" id="uploader">`), you could do:

  ```js
  const uploader = document.getElementById('uploader');
  const result = await storage.createFile(
    'BUCKET_ID',
    ID.unique(),           // unique file ID
    uploader.files[0]      // file from input
  );
  ```

  This uploads the file to Appwrite. The `result` will include file metadata and a URL.

* **Download / View Files:** To retrieve a file (for example, to display an image), use:

  ```js
  const file = await storage.getFileDownload('BUCKET_ID', 'FILE_ID');
  ```

  This fetches the file content. You can then create an object URL or blob to display or trigger a download. Alternatively, `getFileView` returns a response suitable for direct viewing (no download header). If your bucket permission is public for reading, you can also use the file’s public URL.

* **Permissions:** In the console, ensure your bucket’s read permissions allow access. For example, set “Any” read access if everyone should see product images. For user-specific files (like avatars), use user-based permissions.

## Functions (Appwrite Cloud Functions)

Appwrite Functions let you run custom backend code. For instance, you might use a function to process an order, send an email, or integrate with a payment gateway, without exposing credentials in the client.

* **Writing Functions:** In the `functions/` directory, write your code (e.g. in Node.js or Python). Each function has its own configuration (runtime, entrypoint). In Appwrite Console, create a Function and deploy your code (you can upload a zip or link a Git repository). Configure the execution environment (e.g. Node 16, Python 3.9).

* **Invoking Functions:** From React, use the `functions` service. For example:

  ```js
  const execution = await functions.createExecution(
    'FUNCTION_ID',         // ID of your deployed function
    JSON.stringify({      // (optional) request body as a string
      orderId: 'abc123'
    }),
    false                 // async=false waits for result; true runs in background
  );
  ```

  This triggers the function execution and returns an object containing the execution status and any response. If you set `async=true`, the call returns immediately and you can poll the execution status later.

* **Use Case Example:** After a user completes checkout, the app might call a function to send a confirmation email. The function code (running on Appwrite’s servers) would handle the email API call. This keeps secret keys out of the frontend.

## Deployment

* **Appwrite Backend:** For production, you can use Appwrite Cloud or continue hosting Appwrite yourself. If self-hosting, use Docker Compose in production mode. For example, after editing the `appwrite/.env` file with production hostnames, run:

  ```bash
  docker-compose up -d --remove-orphans
  ```

  The Appwrite docs provide a production setup guide. Ensure your server’s firewall allows the Appwrite ports (80/443) and that your domain is configured (set the correct hostname in Appwrite’s settings).

* **Frontend Build:** In the project root, run:

  ```bash
  npm run build
  ```

  This creates an optimized production build (usually in a `build/` or `dist/` folder). Deploy these static files to any hosting provider (e.g., a static site host or your own server). For example, you could serve them with Nginx or upload to Vercel/Netlify (just set the environment variables in their dashboard).

* **Environment Configuration:** In production, set the Appwrite endpoint and project ID in your hosting environment variables (or in a production `appwrite.js`). This ensures the frontend connects to the correct Appwrite server.

* **Functions Deployment:** Deploy any Appwrite Functions via the Console or CLI. If using the Appwrite CLI, you can define functions in `appwrite.json` and run `appwrite deploy` (see Appwrite docs). After deployment, update your frontend code with the live function IDs.

* **CORS / Domain:** In the Appwrite Console under Project Settings, add your production domain (e.g. `https://www.yourdomain.com`) to “Allowed Origins”. This permits the frontend to make API calls to Appwrite.

By following the above steps, you should be able to configure, run, and deploy the e-commerce app with Appwrite as the backend. For more details and examples, refer to the [Appwrite React quick start guide](https://appwrite.io/docs/quick-starts/react) and the official API references for Auth, Databases, Storage, and Functions.

**Citations:** The usage examples and code patterns above are based on Appwrite’s official documentation, which provide comprehensive guides on using Appwrite services in a React application.
