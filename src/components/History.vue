<template>
	<div class="container">
		<h2>Transaction History</h2>
		<table v-if="transactions.length">
			<thead>
				<tr>
					<th>Product Name</th>
					<th>Quantity</th>
					<th>Total Points</th>
					<th>Timestamp</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="transaction in transactions" :key="transaction.id">
					<td>{{ transaction.productName }}</td>
					<td>{{ transaction.quantity }}</td>
					<td>{{ transaction.totalPoints }}</td>
					<td>{{ formatTimestamp(transaction.timestamp) }}</td>
				</tr>
			</tbody>
		</table>
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
		};
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
	},
	async mounted() {
		await this.loadTransactions();
	},
};
</script>
