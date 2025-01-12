<template>
	<div class="container">
		<h2>Transaction History</h2>
		<div v-if="sortedTransactions.length > 0">
			<!-- Header -->
			<div class="align-items-center bg-white container-row h50 wmax center-vh margin-t-s">
				<div class="center-vh" style="width: 25%;">Product Name</div>
				<div class="center-vh" style="width: 25%;">Quantity</div>
				<div class="center-vh" style="width: 25%;">Total Points</div>
				<div class="center-vh" style="width: 25%;">Timestamp</div>
			</div>
			
			<!-- Transactions -->
			<div 
				class="align-items-center bg-white container-row h100 wmax center-vh margin-t-s"
				v-for="transaction in paginatedTransactions"
				:key="transaction.id"
			>
				<div class="center-vh" style="width: 25%;">{{ transaction.productName }}</div>
				<div class="center-vh" style="width: 25%;">{{ transaction.quantity }}</div>
				<div class="center-vh" style="width: 25%;">{{ transaction.totalPoints }}</div>
				<div class="center-vh" style="width: 25%;">{{ formatTimestamp(transaction.timestamp) }}</div>
			</div>

			<!-- Pagination -->
			<div class="pagination margin-t-s">
				<button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
				<span>Page {{ currentPage }} of {{ totalPages }}</span>
				<button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
			</div>
		</div>
		<p v-else>No transactions available.</p>
	</div>
</template>
<script>
import { fetchTransactions, formatTimestamp } from "@/methods";

export default {
  name: "TransactionHistory",
  data() {
    return {
      transactions: [], // Stores fetched transactions
      currentPage: 1, // Current page for pagination
      itemsPerPage: 10, // Number of items per page
    };
  },
  computed: {
    // Sort transactions by timestamp (latest first) without modifying the original array
    sortedTransactions() {
      return [...this.transactions].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    },
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = this.currentPage * this.itemsPerPage;
      return this.sortedTransactions.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.sortedTransactions.length / this.itemsPerPage);
    },
  },
  methods: {
    async loadTransactions() {
      try {
        this.transactions = await fetchTransactions();
      } catch (error) {
        alert(error.message);
      }
    },
    formatTimestamp, // Reuse the formatTimestamp method from methods.js
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  async mounted() {
    await this.loadTransactions();
  },
};
</script>
