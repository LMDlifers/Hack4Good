<template>
	<div class="container">
		<h2>Transaction History</h2>
		<div v-if="sortedTransactions.length > 0">
			<!-- Header -->
			<div class="header margin-top-s">
        <div style="width: 20%;">Type</div>
				<div style="width: 20%;">Details</div>
				<div style="width: 20%;">Quantity</div>
				<div style="width: 20%;">Total Points</div>
				<div style="width: 20%;">Timestamp</div>
			</div>
			
			<!-- Transactions -->
			<div 
				class="header content" style="min-height: 75px; height: auto;"
				v-for="transaction in paginatedTransactions"
				:key="transaction.id"
			>
                <div style="width: 20%;">{{ transaction.type }}</div>
                <div style="width: 20%;">{{ transaction.details }}</div>
                <div style="width: 20%;">{{ transaction.quantity }}</div>
                <div style="width: 20%;">{{ transaction.totalPoints }}</div>
                <div style="width: 20%;">{{ formatTimestamp(transaction.timestamp) }}</div>
			</div>

			<!-- Pagination -->
            <div class="pagination" v-if="totalPages > 1">
                <button 
                v-if="currentPage > 1" 
                @click="changePage(currentPage - 1)"
                >
                Previous
                </button>
                <span v-else style="visibility: hidden;">Previous</span>
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <button 
                v-if="currentPage < totalPages" 
                @click="changePage(currentPage + 1)"
                >
                Next
                </button>
                <span v-else style="visibility: hidden;">Next</span>
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
