<template>
    <div class="auction-house">
      <header class="header">
        <nav>
          <ul class="nav-list">
            <li><a href="#">Auctions</a></li>
            <li><a href="#">List</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </nav>
      </header>
  
      <main>
        <h1>Create Auction House ☀ ☽</h1>
  
        <section class="auction-list">
          <div v-for="item in auctionItems" :key="item.id" class="auction-card">
            <div class="auction-image">
              <p v-if="item.imageError">Error loading content</p>
              <img v-else :src="item.image" alt="Auction Item" />
            </div>
  
            <div class="auction-info">
              <h3>{{ item.name || 'unknown' }}</h3>
              <p>Created by {{ item.creator }}</p>
              <div class="auction-details">
                <p>Reserve price: {{ item.reservePrice || '--' }}</p>
                <p>Highest bid: {{ item.highestBid || '--' }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: "AuctionList",
    data() {
      return {
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
  };
  </script>
  
  <style scoped>
  .auction-house {
    font-family: Arial, sans-serif;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #ccc;
  }
  
  .nav-list {
    list-style: none;
    display: flex;
    gap: 15px;
    padding: 0;
  }
  
  .nav-list li {
    display: inline;
  }
  
  .nav-list a {
    text-decoration: none;
    color: black;
  }
  
  main {
    text-align: center;
  }
  
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
  }
  
  .auction-image {
    height: 150px;
    background-color: #f4f4f4;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    overflow: hidden;
  }
  
  .auction-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .auction-info {
    text-align: left;
  }
  
  .auction-info h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .auction-details {
    margin-top: 10px;
    font-size: 14px;
    color: #555;
  }
  </style>
  