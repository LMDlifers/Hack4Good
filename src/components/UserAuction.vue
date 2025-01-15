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
                      <p>Starting points: <strong>{{ item.reservePrice || "--" }} points</strong></p>
                      <p>Highest bid: <strong>{{ item.currentBid || item.reservePrice }} points</strong></p>
                      <p>Highest bidder: <strong>{{ item.highestBidderName || "None" }}</strong> </p>
                      <p>Date/Time: <strong>{{ item.time || "Not Set" }}</strong> </p>
                      <p>Status: <strong :class="getStatusClass(item.time)"> {{ getStatusText(item.time) }} </strong></p>
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
        <p>Current Highest Bid: {{ selectedItem.currentBid || selectedItem.reservePrice }} points</p>
      </div>
      <div>
        <p>Your Points: {{ voucherPoints }} points</p>
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
        <button type="button" class="btn-grey" @click="closeBidPopup">Cancel</button>
        <button type="submit">Confirm</button>
      </div>
    </form>
  </div>
</div>

  </div>
</template>

<script>
import { getDatabase, ref, onValue, update, off, get, push, set} from "firebase/database";
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
    const currentUserRef = ref(db, `users/${currentUser.uid}`);
    const transactionsRef = ref(db, `users/${currentUser.uid}/transactions`);

    const updates = {
      currentBid: this.userBid,
      currentBidder: currentUser.uid,
      highestBidderName: currentUser.displayName || "Anonymous",
    };

    // Refund points to the previous highest bidder
    if (item.currentBidder) {
      const previousBidderRef = ref(db, `users/${item.currentBidder}`);
      const previousTransactionsRef = ref(db, `users/${item.currentBidder}/transactions`);
      onValue(
        previousBidderRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const previousBidderData = snapshot.val();
            const updatedPoints = previousBidderData.voucherPoints + item.currentBid;

            // Update points for the previous bidder
            await update(previousBidderRef, { voucherPoints: updatedPoints });

            // Add transaction for refunded points
            const newRefundTransactionRef = push(previousTransactionsRef);
            await set(newRefundTransactionRef, {
              type: "Auction Refund",
              productId: item.id,
              details: `Refunded ${item.currentBid} points for being outbid on "${item.name}".`,
              quantity: "-",
              totalPoints: -item.currentBid,
              timestamp: Date.now(),
            });
          }
        },
        { onlyOnce: true }
      );
    }

    // Deduct points from the current user and update the auction
    onValue(
      currentUserRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const currentUserData = snapshot.val();
          const newPoints = currentUserData.voucherPoints - this.userBid;

          if (newPoints < 0) {
            alert("You don't have enough points.");
            return;
          }

          await update(currentUserRef, { voucherPoints: newPoints });

          // Record the transaction for placing the bid
          const newBidTransactionRef = push(transactionsRef);
          await set(newBidTransactionRef, {
            type: "Auction Bid",
            productId: item.id,
            details: "Bidded for '" + item.name + "'",
            quantity: "-",
            totalPoints: -this.userBid,
            timestamp: Date.now(),
          });

          await update(auctionRef, updates);

          alert("Bid placed successfully!");
          this.closeBidPopup();
          this.loadAuctions();
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