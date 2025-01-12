<template>
    <div class="admin-upload">
      <h1>Admin Panel: Upload Product</h1>
  
      <form @submit.prevent="submitProduct">
        <div class="form-group">
          <label for="name">Product Name</label>
          <input type="text" id="name" v-model="product.name" required />
        </div>
  
        <div class="form-group">
          <label for="creator">Creator</label>
          <input type="text" id="creator" v-model="product.creator" required />
        </div>
  
        <div class="form-group">
          <label for="reservePrice">Reserve Price</label>
          <input type="number" id="reservePrice" v-model="product.reservePrice" min="0" required />
        </div>
  
        <div class="form-group">
          <label for="image">Upload Image</label>
          <input type="file" id="image" @change="handleImageUpload" />
        </div>
  
        <button type="submit">Upload Product</button>
      </form>
  
      <div v-if="uploadSuccess" class="success-message">
        <p>Product uploaded successfully!</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AdminAction",
    data() {
      return {
        product: {
          name: "",
          creator: "",
          reservePrice: null,
          image: null,
        },
        uploadSuccess: false,
      };
    },
    methods: {
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.product.image = e.target.result; // Save the image data as base64
          };
          reader.readAsDataURL(file);
        }
      },
      submitProduct() {
        // Simulate product submission
        console.log("Product submitted:", this.product);
  
        // You can replace this with an actual API call to save the product
        // Example: axios.post('/api/products', this.product)
  
        // Reset form after submission
        this.uploadSuccess = true;
        this.product = {
          name: "",
          creator: "",
          reservePrice: null,
          image: null,
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .admin-upload {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .success-message {
    margin-top: 20px;
    text-align: center;
    color: green;
  }
  </style>
  