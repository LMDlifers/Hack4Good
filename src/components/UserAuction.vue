<template>
    <div class="container">
        <h2>Auction House</h2>
        <div class="margin-t-s">
			<input
				class="search-bar"
				v-model="searchQuery"
				placeholder="Search auctions..."
				type="text"
			/>
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
                <div v-if="getStatusText(item.time) === 'Open'" class="margin-t-s">
                    <button class="wmax" @click="openBidPopup(item)">Place Bid</button>
                </div>
                <div v-else class="margin-t-s">
                    <button class="btn-grey wmax">Auction Over</button>
                </div>
            </div>
        </section>

      <div v-if="showBidPopup" class="modal-wrapper">
  <div class="modal-backdrop" @click="closeBidPopup"></div>
  <div class="modal">
    <form class="form-page" @submit.prevent="confirmBid">
      <h2>Place Bid for {{ selectedItem.name }}</h2>
      <div>
        <p>Current Highest Bid: ${{ selectedItem.currentBid || selectedItem.reservePrice }}</p>
      </div>
      <div>
        <p>Your Points: {{ voucherPoints }}</p>
      </div>
      <div>
        <label for="bidAmount">Enter Your Bid:</label>
        <input
          type="number"
          id="bidAmount"
          v-model.number="userBid"
          :placeholder="`Enter a bid (Max: ${voucherPoints} points)`"
          :max="voucherPoints"
          :min="selectedItem.currentBid || selectedItem.reservePrice"
          required
        />
      </div>
      <div class="modal-actions space-between">
        <button type="submit">Confirm</button>
        <button type="button" class="btn-grey" @click="closeBidPopup">Cancel</button>
      </div>
    </form>
  </div>
</div>

  </div>
</template>

<script>
import { getDatabase, ref, onValue, update, off, get } from "firebase/database";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
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
      const storage = getStorage();

      // Remove any existing listeners to prevent duplicate listens
      off(auctionsRef);

      onValue(auctionsRef, async (snapshot) => {
        if (snapshot.exists()) {
          const auctions = snapshot.val();
          this.auctionItems = await Promise.all(
            Object.keys(auctions).map(async (key) => {
              const auction = { id: key, ...auctions[key] };

              // Fetch the auction image URL
              try {
                const imageRef = storageRef(storage, `auction/${key}`);
                auction.image = await getDownloadURL(imageRef);
              } catch (error) {
                console.warn(`No image found for auction ${key}:`, error);
                const defaultImageRef = storageRef(storage, `no-image.jpg`);
                const defaultImageUrl = await getDownloadURL(defaultImageRef);
                auction.image = defaultImageUrl; // Set default image URL
              }

              // Fetch highest bidder username using get()
              if (auction.currentBidder) {
                try {
                  const bidderRef = ref(db, `users/${auction.currentBidder}`);
                  const bidderSnapshot = await get(bidderRef);

                  if (bidderSnapshot.exists()) {
                    const userData = bidderSnapshot.val();
                    auction.highestBidderName = userData.username || "Anonymous";
                  } else {
                    auction.highestBidderName = "None";
                  }
                } catch (error) {
                  console.error(`Error fetching bidder data for auction ${key}:`, error);
                  auction.highestBidderName = "None";
                }
              } else {
                auction.highestBidderName = "None";
              }

              return auction;
            })
          );
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