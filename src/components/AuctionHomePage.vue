<template>
  <div class="auction-house">
    <!-- Navigation Bar -->
    <header class="header">
      <nav class="top-nav"></nav>
    </header>

    <!-- Main Content -->
    <main>
      <div class="main-header">
        <h1 class="title">
          Auction House (Admin)
          <button @click="manageAuction">Add Auction Item</button>
        </h1>
        <div class="search-wrapper">
          <input
            type="text"
            class="search-bar-main"
            placeholder="Search auctions..."
            v-model="searchQuery"
            @input="onSearch"
          />
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="isModalVisible" class="modal-overlay">
        <div class="modal">
          <h2>Add Auction Item</h2>
          <form @submit.prevent="submitAuction">
            <label for="name">Product Name:</label>
            <input
              type="text"
              id="name"
              v-model="newAuction.name"
              required
            />

            <label for="time">Auction Time/Date:</label>
            <input
              type="datetime-local"
              id="time"
              v-model="newAuction.time"
              required
            />

            <label for="reservePrice">Reserve Price:</label>
            <input
              type="number"
              id="reservePrice"
              v-model="newAuction.reservePrice"
              required
              min="0"
            />

            <label for="photo">Product Photo:</label>
            <input
              type="file"
              id="photo"
              @change="handleFileChange"
            />

            <button type="submit">Submit</button>
            <button type="button" @click="closeModal">Cancel</button>
          </form>
        </div>
      </div>

      <!-- Auction List Section -->
      <section class="auction-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="auction-card"
        >
          <div class="auction-image">
            <p v-if="!item.image">No Image Available</p>
            <img v-else :src="item.image" alt="Auction Item" />
          </div>

          <div class="auction-info">
            <h3>{{ item.name || "Unknown" }}</h3>
            <p>Created by {{ item.creator }}</p>
            <div class="auction-details">
              <p>Reserve price: {{ item.reservePrice || "--" }}</p>
              <p>Highest bid: {{ item.highestBid || "--" }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
  
<script>
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";

export default {
  name: "AuctionHomePage",
  data() {
    return {
      searchQuery: "",
      auctionItems: [], // Initialize as an empty array
      isModalVisible: false, // Controls modal visibility
      newAuction: {
        name: "",
        time: "",
        reservePrice: "", // Add reservePrice to the auction object
        photo: null,
      },
    };
  },
  computed: {
    filteredItems() {
      return this.auctionItems.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  created() {
    const db = getDatabase();
    const productsRef = ref(db, "products");

    // Listen for changes in the "products" reference
    onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const products = snapshot.val();
        this.auctionItems = Object.keys(products).map((key) => ({
          id: key,
          ...products[key],
        }));
      } else {
        console.log("No products available.");
        this.auctionItems = [];
      }
    });
  },
  methods: {
    onSearch() {
      console.log("Search query:", this.searchQuery);
    },

    // Show the modal when the "Add Auction Item" button is clicked
    manageAuction() {
      this.isModalVisible = true;
    },

    // Close the modal
    closeModal() {
      this.isModalVisible = false;
      this.newAuction = {
        name: "",
        time: "",
        reservePrice: "", // Reset reserve price
        photo: null,
      };
    },

    // Handle file input change for product photo
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newAuction.photo = file;
      }
    },

    // Submit the new auction item to Firebase
    async submitAuction() {
      if (this.newAuction.name && this.newAuction.time && this.newAuction.reservePrice && this.newAuction.photo) {
        // Get a reference to Firebase Storage for photo upload
        const storage = getStorage();
        const fileRef = storageRef(storage, `auction_images/${this.newAuction.photo.name}`);
        
        try {
          // Upload the photo to Firebase Storage
          await uploadBytes(fileRef, this.newAuction.photo);
          const photoURL = await fileRef.getDownloadURL();

          // Save the auction data to Firebase Realtime Database
          const db = getDatabase();
          const newAuctionRef = push(ref(db, "products"));
          await set(newAuctionRef, {
            name: this.newAuction.name,
            time: this.newAuction.time,
            reservePrice: this.newAuction.reservePrice, // Store the reserve price
            image: photoURL, // Store the image URL in the database
          });

          // Close the modal after successful submission
          this.closeModal();
        } catch (error) {
          console.error("Error uploading photo or saving auction:", error);
        }
      } else {
        console.log("Please fill out all fields.");
      }
    },
  },
};
</script>


  
<style scoped>
/* General Styles */
.auction-house {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Main Header Styling */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.search-wrapper {
  width: 40%;
}

.search-bar-main {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 16px;
  outline: none;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.search-bar-main:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.search-bar-main::placeholder {
  color: #999;
  font-style: italic;
}

/* Auction List Section */
.auction-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.auction-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 300px;
}

.auction-image {
  height: 150px;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  overflow: hidden;
  border-radius: 8px;
}

.auction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-info {
  text-align: left;
  flex: 1;
}

.auction-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.auction-details {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
}

.modal h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

label {
  display: block;
  margin: 10px 0 5px;
  text-align: left;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 15px;
  margin-top: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
}

button:hover {
  background-color: #0056b3;
}

button[type="button"] {
  background-color: #f44336;
}

button[type="button"]:hover {
  background-color: #d32f2f;
}
</style>