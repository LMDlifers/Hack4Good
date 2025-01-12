<template>
	<div v-if="preorders.length > 0" class="container">
		<h2>Preorder Management</h2>
		<div>
			<div class="align-items-center bg-white container-row h50 wmax margin-t-s center-vh">
				<div class="center-vh" style="width: 16.66%;">User</div>
				<div class="center-vh" style="width: 16.66%;">Product</div>
				<div class="center-vh" style="width: 16.66%;">Quantity</div>
				<div class="center-vh" style="width: 16.66%;">Status</div>
				<div class="center-vh" style="width: 16.66%;">PreOrder Date</div>
				<div class="center-vh" style="width: 16.66%;">Action</div>
			</div>
			<div
				class="align-items-center bg-white h100 wmax margin-t-s"
				v-for="(preorder, index) in paginatedPreorders"
				:key="index"
			>
				<div class="center-vh" style="width: 16.66%;">{{ preorder.username }}</div>
				<div class="center-vh" style="width: 16.66%;">{{ preorder.productName }}</div>
				<div class="center-vh" style="width: 16.66%;">{{ preorder.quantity }}</div>
				<div class="center-vh" style="width: 16.66%;">
					<span v-if="preorder.status === 'Delivered' || preorder.status === 'Approved'" class="status delivered">
						{{ preorder.status }}
					</span>
					<span v-else-if="preorder.status === 'Rejected'" class="status rejected">
						{{ preorder.status }}
					</span>
					<span v-else class="status pending">
						{{ preorder.status }}
					</span>
				</div>
				<div class="center-vh" style="width: 16.66%;">{{ new Date(preorder.timestamp).toLocaleString() }}</div>
				<div class="center-vh" style="width: 16.66%;">
					<div v-if="preorder.status === 'Pending'">
						<button class="btn-green" @click="updateStatus(preorder, 'Approved')">Approve</button>
						<button class="margin-l-s btn-red" @click="updateStatus(preorder, 'Rejected')">Reject</button>
					</div>
					<div v-else-if="preorder.status === 'Approved'">
						<button @click="fulfillPreorder(preorder)">Fulfill</button>
					</div>
				</div>
</div>

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
	<p v-else>No preorders found.</p>
</template>
<script>
import {
	fetchAllPreorders,
	updatePreorderStatus,
	deductProductStock,
} from "@/methods";

export default {
	name: "AdminPreorderPage",
	data() {
		return {
			preorders: [], // List of all preorders
			currentPage: 1, // Current page for pagination
			perPage: 10, // Number of items per page
		};
	},
	computed: {
		totalPages() {
			return Math.ceil(this.preorders.length / this.perPage);
		},
		paginatedPreorders() {
			const start = (this.currentPage - 1) * this.perPage;
			const end = this.currentPage * this.perPage;
			return this.sortedPreorders.slice(start, end);
		},
		// Sort preorders by timestamp in descending order
		sortedPreorders() {
			return [...this.preorders].sort(
				(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
			);
		},
	},
	methods: {
		async fetchPreorders() {
			try {
				// Fetch all preorders
				this.preorders = await fetchAllPreorders();
			} catch (error) {
				alert("Error fetching preorders: " + error.message);
			}
		},
		async updateStatus(preorder, status) {
			try {
				preorder.status = status;
				await updatePreorderStatus(preorder.id, preorder.status);
				alert(`Status updated to "${status}" for ${preorder.productName}`);
				this.fetchPreorders(); // Refresh the list of preorders
			} catch (error) {
				alert("Error updating status: " + error.message);
			}
		},
		async fulfillPreorder(preorder) {
			if (preorder.status !== "Approved") {
				alert("Preorder must be approved before fulfilling.");
				return;
			}

			try {
				// Deduct stock for the product
				await deductProductStock(preorder.productId, preorder.quantity);

				// Update status to "Delivered"
				preorder.status = "Delivered";
				await updatePreorderStatus(preorder.id, preorder.status);

				alert(
					`Preorder for ${preorder.productName} has been fulfilled and marked as Delivered.`
				);

				this.fetchPreorders(); // Refresh the list of preorders
			} catch (error) {
				alert("Error fulfilling preorder: " + error.message);
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
	},
	async mounted() {
		await this.fetchPreorders();
	},
};
</script>
