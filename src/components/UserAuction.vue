<template>
  <div class="user-auction-house">
    <header class="header">
      <nav class="top-nav"></nav>
    </header>

    <main>
      <div class="main-header">
        <h1 class="title">Auction House</h1>
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
            <p v-if="!item.image">No Image Available</p>
            <img v-else :src="item.image" alt="Auction Item" />
          </div>

          <div class="auction-info">
            <h3>{{ item.name || "Unknown" }}</h3>
            <p>Created by {{ item.creator || "Unknown" }}</p>
            <div class="auction-details">
              <p>Starting price: ${{ item.reservePrice || "--" }}</p>
              <p>Highest bid: ${{ item.currentBid || item.reservePrice }}</p>
              <p>Highest bidder: {{ item.highestBidderName || "None" }}</p>
              <p>Date/Time: {{ item.time || "Not Set" }}</p>
              <p :class="getStatusClass(item.time)">
                Status: {{ getStatusText(item.time) }}
              </p>
            </div>
          </div>

          <div class="bid-section" v-if="getStatusText(item.time) === 'Open'">
            <button @click="openBidPopup(item)">Place Bid</button>
          </div>
        </div>
      </section>

      <div v-if="showBidPopup" class="popup-overlay">
        <div class="popup">
          <h3>Place Bid for {{ selectedItem.name }}</h3>
          <p>Current Highest Bid: ${{ selectedItem.currentBid || selectedItem.reservePrice }}</p>
          <p>Your Points: {{ voucherPoints }}</p>
          <input
            type="number"
            v-model.number="userBid"
            :placeholder="`Enter a bid (Max: ${voucherPoints} points)`"
            :max="voucherPoints"
            :min="selectedItem.currentBid || selectedItem.reservePrice"
          />
          <div class="popup-actions">
            <button @click="confirmBid">Confirm</button>
            <button @click="closeBidPopup">Cancel</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getDatabase, ref, onValue, update } from "firebase/database";
import { fetchUserData } from "@/script";
import { getAuth } from "firebase/auth";

export default {
  name: "UserAuction",
  data() {
    return {
      auctionItems: [],
      searchQuery: "",
      voucherPoints: 0,
      userBid: 0,
      showBidPopup: false,
      selectedItem: null,
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
    async loadAuctions() {
      const db = getDatabase();
      const auctionsRef = ref(db, "auctions");

      onValue(auctionsRef, async (snapshot) => {
        if (snapshot.exists()) {
          const auctions = snapshot.val();
          this.auctionItems = Object.keys(auctions).map((key) => ({
            id: key,
            ...auctions[key],
          }));

          // Fetch highest bidder usernames dynamically
          for (const item of this.auctionItems) {
            if (item.currentBidder) {
              const bidderRef = ref(db, `users/${item.currentBidder}`);
              onValue(
                bidderRef,
                (snapshot) => {
                  if (snapshot.exists()) {
                    const userData = snapshot.val();
                    item.highestBidderName = userData.username || "Anonymous";
                  } else {
                    item.highestBidderName = "None";
                  }
                },
                { onlyOnce: true }
              );
            } else {
              item.highestBidderName = "None";
            }
          }
        } else {
          this.auctionItems = [];
        }
      });
    },
    openBidPopup(item) {
      this.selectedItem = item;
      this.userBid = 0;
      this.showBidPopup = true;
    },
    closeBidPopup() {
      this.showBidPopup = false;
      this.selectedItem = null;
    },
    async confirmBid() {
      try {
        const item = this.selectedItem;

        if (!item) {
          alert("Auction not found.");
          return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          alert("You must be logged in to place a bid.");
          return;
        }

        if (item.currentBidder === currentUser.uid) {
          alert("You are already the highest bidder. You cannot bid again.");
          return;
        }

        const currentBid = item.currentBid || item.reservePrice;
        if (this.userBid <= currentBid) {
          alert("Your bid must be higher than the current bid.");
          return;
        }

        if (this.userBid > this.voucherPoints) {
          alert("You don't have enough points to place this bid.");
          return;
        }

        const db = getDatabase();
        const auctionRef = ref(db, `auctions/${item.id}`);

        const updates = {
          currentBid: this.userBid,
          currentBidder: currentUser.uid,
          highestBidderName: currentUser.displayName || "Anonymous",
        };

        if (item.currentBidder) {
          const previousBidderRef = ref(db, `users/${item.currentBidder}`);
          onValue(
            previousBidderRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const previousBidderData = snapshot.val();
                const updatedPoints = previousBidderData.voucherPoints + item.currentBid;
                update(previousBidderRef, { voucherPoints: updatedPoints });
              }
            },
            { onlyOnce: true }
          );
        }

        const currentUserRef = ref(db, `users/${currentUser.uid}`);
        onValue(
          currentUserRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const currentUserData = snapshot.val();
              const newPoints = currentUserData.voucherPoints - this.userBid;

              if (newPoints < 0) {
                alert("You don't have enough points.");
                return;
              }

              update(currentUserRef, { voucherPoints: newPoints });

              update(auctionRef, updates)
                .then(() => {
                  alert("Bid placed successfully!");
                  this.closeBidPopup();
                  this.loadAuctions();
                })
                .catch((error) => {
                  console.error("Error updating auction data:", error);
                  alert("Failed to update auction. Please try again later.");
                });
            }
          },
          { onlyOnce: true }
        );
      } catch (error) {
        console.error("Error placing bid:", error);
        alert("Failed to place bid. Please try again later.");
      }
    },
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
  async mounted() {
    await this.loadAuctions();
    const userData = await fetchUserData();
    if (userData) {
      this.voucherPoints = userData.voucherPoints;
    }
  },
};
</script>

<style scoped>
.user-auction-house {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.search-wrapper {
  margin-top: 10px;
  width: 100%;
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

.bid-section {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.popup-overlay {
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

.popup {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.popup-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

button {
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>
