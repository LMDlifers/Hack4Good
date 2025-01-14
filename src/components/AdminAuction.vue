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
        <input
          type="number"
          id="reservePrice"
          v-model="product.reservePrice"
          min="0"
          required
        />
      </div>

      <div class="form-group">
        <label for="image">Upload Image</label>
        <input type="file" id="image" @change="handleImageUpload" />
      </div>

      <button type="submit" class="btn-submit">Upload Product</button>
    </form>

    <div v-if="uploadSuccess" class="success-message">
      <p>Product uploaded successfully!</p>
    </div>
  </div>
</template>

<script>
import { getDatabase, ref, push } from "firebase/database";

export default {
  name: "AdminAuction",
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
      const db = getDatabase(); // Initialize Firebase Database
      const productsRef = ref(db, "products"); // Reference the "products" path

      // Push product data to Firebase
      push(productsRef, this.product)
        .then(() => {
          this.uploadSuccess = true;
          console.log("Product uploaded successfully!");

          // Reset the form
          this.product = {
            name: "",
            creator: "",
            reservePrice: null,
            image: null,
          };
        })
        .catch((error) => {
          console.error("Error uploading product:", error);
        });
    },
  },
};
</script>

<style scoped>
.admin-upload {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

h1 {
  text-align: center;
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}

.success-message {
  margin-top: 20px;
  text-align: center;
  color: green;
  font-weight: bold;
}
</style>
