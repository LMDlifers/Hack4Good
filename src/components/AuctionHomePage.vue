<template>
  <div class="container">
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
<div v-if="isModalVisible" class="modal-wrapper">
  <div class="modal-backdrop" @click="closeModal"></div>
  <div class="modal padding-20">
    <h2>Add Auction Item</h2>
    <form @submit.prevent="submitAuction">
      <!-- Product Name -->
      <label for="name">Product Name:</label>
      <input
        type="text"
        id="name"
        v-model="newAuction.name"
        required
      />

      <!-- Auction Time/Date -->
      <label for="time">Auction Time/Date:</label>
      <input
        type="datetime-local"
        id="time"
        v-model="newAuction.time"
        required
      />

      <!-- Reserve Price -->
      <label for="reservePrice">Reserve Price:</label>
      <input
        type="number"
        id="reservePrice"
        v-model="newAuction.reservePrice"
        required
        min="0"
      />

      <!-- Product Photo -->
      <label for="photo">Product Photo:</label>
      <input
        type="file"
        id="photo"
        @change="handleFileChange"
      />

      <!-- Actions -->
      <div class="modal-actions space-between">
        <button class="btn-green" type="submit">Submit</button>
        <button class="btn-grey" type="button" @click="closeModal">Cancel</button>
      </div>
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
            <p>Created by {{ item.creator || "Unknown" }}</p>
            <div class="auction-details">
              <p>Reserve price: ${{ item.reservePrice || "--" }}</p>
              <p>Highest bid: ${{ item.highestBid || "0" }}</p>
              <p>Date/Time: {{ item.time || "Not Set" }}</p>
              <p :class="getStatusClass(item.time)">
                Status: {{ getStatusText(item.time) }}
              </p>
            </div>
          </div>
          <div class="auction-actions">
            <button @click="editAuction(item)">Edit</button>
            <button class="btn-red" @click="deleteAuction(item.id)">Delete</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";

export default {
  name: "AuctionHomePage",
  data() {
    return {
      searchQuery: "",
      auctionItems: [], // Initialize as an empty array
      isModalVisible: false, // Controls modal visibility
      isSubmitting: false, // Prevent duplicate submissions
      editing: false, // Track if we are editing an auction
      editingId: null, // Store the ID of the auction being edited
      newAuction: {
        name: "",
        time: "",
        reservePrice: "", // Add reservePrice to the auction object
        highestBid: 0, // Default highestBid to 0
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
    const auctionsRef = ref(db, "auctions"); // New auctions table path

    onValue(auctionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const auctions = snapshot.val();
        this.auctionItems = Object.keys(auctions).map((key) => ({
          id: key,
          ...auctions[key],
        }));
      } else {
        console.log("No auction items available.");
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
      this.editing = false; // Reset editing mode
      this.editingId = null; // Clear the editing ID
      this.newAuction = {
        name: "",
        time: "",
        reservePrice: "",
        highestBid: 0,
      };
    },

    // Submit the new or updated auction item to Firebase
    async submitAuction() {
      if (this.isSubmitting) {
        return; // Prevent duplicate submissions
      }

      console.log("Submitting auction item:", this.newAuction);

      if (
        this.newAuction.name &&
        this.newAuction.time &&
        this.newAuction.reservePrice
      ) {
        this.isSubmitting = true;

        try {
          const db = getDatabase();

          if (this.editing) {
            // Update existing auction
            console.log("Updating auction:", this.editingId);
            const auctionRef = ref(db, `auctions/${this.editingId}`);
            await set(auctionRef, {
              name: this.newAuction.name,
              time: this.newAuction.time,
              reservePrice: this.newAuction.reservePrice,
              highestBid: this.newAuction.highestBid, // Include highestBid
              creator: "Admin", // Replace with current user if applicable
            });
            alert("Auction updated successfully!");
          } else {
            // Add new auction
            console.log("Adding new auction...");
            const newAuctionRef = push(ref(db, "auctions"));
            await set(newAuctionRef, {
              name: this.newAuction.name,
              time: this.newAuction.time,
              reservePrice: this.newAuction.reservePrice,
              highestBid: this.newAuction.highestBid, // Include highestBid
              creator: "Admin", // Replace with current user if applicable
            });
            alert("Auction item added successfully!");
          }

          this.closeModal();
        } catch (error) {
          console.error("Error during submission:", error);
          alert("An error occurred while submitting the auction. Please try again.");
        } finally {
          this.isSubmitting = false;
        }
      } else {
        console.log("Form validation failed:", this.newAuction);
        alert("Please fill out all fields.");
      }
    },

    // Edit an auction
    editAuction(item) {
      console.log("Editing auction:", item);
      this.newAuction = { ...item }; // Populate the form with auction details
      this.editing = true;
      this.editingId = item.id; // Store the ID of the auction being edited
      this.isModalVisible = true; // Open the modal
    },

    // Delete an auction
    async deleteAuction(auctionId) {
      const db = getDatabase();
      try {
        console.log("Deleting auction with ID:", auctionId);
        await remove(ref(db, `auctions/${auctionId}`));
        alert("Auction item deleted successfully!");
      } catch (error) {
        console.error("Error deleting auction:", error);
        alert("An error occurred while deleting the auction. Please try again.");
      }
    },

    // Determine auction status based on time
    getStatusText(auctionTime) {
      if (!auctionTime) return "Not Set";

      const now = new Date();
      const auctionDate = new Date(auctionTime);
      return auctionDate > now ? "Open" : "Closed";
    },

    getStatusClass(auctionTime) {
      if (!auctionTime) return "status-unknown";

      const now = new Date();
      const auctionDate = new Date(auctionTime);
      return auctionDate > now ? "status-open" : "status-closed";
    },
  },
};
</script>

<style scoped>
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

.btn-add-auction {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-add-auction:hover {
  background-color: #0056b3;
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

/* Status Styling */
.status-open {
  color: green;
  font-weight: bold;
}

.status-closed {
  color: red;
  font-weight: bold;
}

.status-unknown {
  color: gray;
  font-style: italic;
}

.auction-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.auction-actions button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.auction-actions button:hover {
  background-color: #0056b3;
}

.auction-actions button:last-child {
  background-color: #f44336;
}

.auction-actions button:last-child:hover {
  background-color: #d32f2f;
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
