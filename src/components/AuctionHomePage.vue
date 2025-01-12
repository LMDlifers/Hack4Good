<template>
    <div class="auction-house">
      <!-- Navigation Bar -->
      <header class="header">
        <nav class="top-nav"></nav>
      </header>
  
      <!-- Main Content -->
      <main>
        <div class="main-header">
          <h1 class="title">Auction House (Admin)</h1>
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
  
        <section class="auction-list">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="auction-card"
          >
            <div class="auction-image">
              <p v-if="item.imageError">Error loading content</p>
              <img v-else :src="item.image" alt="Auction Item" />
            </div>
  
            <div class="auction-info">
              <h3>{{ item.name || "unknown" }}</h3>
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
  export default {
    name: "AuctionHomePage",
    data() {
      return {
        searchQuery: "", // Holds the search query
        auctionItems: [
          {
            id: 1,
            name: "Test",
            creator: "0x13026c...C39E5",
            imageError: true,
            reservePrice: null,
            highestBid: null,
          },
          {
            id: 2,
            name: "Februarius",
            creator: "0xBaC1Cd...2ad745",
            imageError: true,
            reservePrice: null,
            highestBid: null,
          },
          {
            id: 3,
            name: "Medhansh",
            creator: "0xB6e397...D26bfc",
            imageError: false,
            image: "path/to/image.jpg",
            reservePrice: null,
            highestBid: null,
          },
          {
            id: 4,
            name: "Cricket Ball",
            creator: "0xB6e397...D26bfc",
            imageError: false,
            image: "path/to/image2.jpg",
            reservePrice: null,
            highestBid: null,
          },
        ],
      };
    },
    computed: {
      filteredItems() {
        return this.auctionItems.filter((item) =>
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
    },
    methods: {
      onSearch() {
        console.log("Search query:", this.searchQuery);
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
  justify-content: space-between; /* Align search bar and title horizontally */
  align-items: center; /* Align items vertically */
  margin-bottom: 20px;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.search-wrapper {
  width: 40%; /* Adjust width as needed */
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Responsive grid layout */
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
  </style>
  