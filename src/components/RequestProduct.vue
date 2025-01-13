<template>
	<div class="container">
		<div class="space-between">
			<h2>Requested Products</h2>
			<button class="margin-l-s" @click="openRequestProductModal">Request New Product</button>
		</div>
	</div>
	<div v-if="paginatedRequests.length > 0" class="container">
		<div class="margin-t-s">
			<input
				class="search-bar"
				v-model="searchQuery"
				placeholder="Search requests by product name..."
				type="text"
			/>
		</div>
		<div>
			<!-- Table Header -->
			<div class="header margin-t-s">
				<div style="width: 20%;">Product Name</div>
				<div style="width: 20%;">Quantity</div>
				<div style="width: 20%;">Reason</div>
				<div style="width: 20%;">Status</div>
				<div style="width: 20%;">Timestamp</div>
			</div>

			<!-- Request Rows -->
			<div
				class="header content" style="min-height: 75px; height: auto;"
				v-for="(request, id) in paginatedRequests"
				:key="id"
			>
				<div style="width: 20%;">{{ request.productName }}</div>
				<div style="width: 20%;">{{ request.quantity }}</div>
				<div style="width: 20%;">{{ request.reason }}</div>
				<div style="width: 20%;">
					<span class="status" :class="getStatusClass(request.status)">
						{{ request.status }}
					</span>
				</div>
				<div style="width: 20%;">{{ formatTimestamp(request.timestamp) }}</div>
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
	<div class="container" v-else>
		<p>No product requests found.</p>
	</div>

	<!-- Request Product Modal -->
	<div v-if="showRequestModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeRequestModal"></div>
		<div class="modal">
			<form class="form-page" @submit.prevent="submitRequest">
				<h2>Request Product</h2>
				<div>
					<label for="productName">Product Name:</label>
					<input v-model="newRequest.productName" type="text" id="productName" required />
				</div>
				<div>
					<label for="quantity">Quantity:</label>
					<input v-model.number="newRequest.quantity" type="number" id="quantity" min="1" required />
				</div>
				<div>
					<label for="reason">Reason:</label>
					<textarea
						id="reason"
						v-model="newRequest.reason"
						placeholder="Provide a reason for this request"
						rows="3"
						required
					></textarea>
				</div>

				<div class="modal-actions space-between">
					<button type="submit">Submit Request</button>
					<button type="button" class="btn-grey" @click="closeRequestModal">Cancel</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
import { fetchRequests, submitProductRequest } from "@/methods";
import { getAuth } from "firebase/auth";

export default {
	name: "RequestProductPage",
	data() {
		return {
			requests: [], // Holds request data
			searchQuery: "",
			currentPage: 1,
			itemsPerPage: 5,
			showRequestModal: false,
			newRequest: {
				productName: "",
				quantity: 1,
				reason: "", // Add a field for the reason
				requestorId: "", // This will be populated during submission
				timestamp: null, // Timestamp for the request
			},
		};
	},
	computed: {
		filteredRequests() {
			if (!this.searchQuery) return this.requests;
			return this.requests.filter((request) =>
				request.productName.toLowerCase().includes(this.searchQuery.toLowerCase())
			);
		},
		totalPages() {
			return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
		},
		paginatedRequests() {
			const start = (this.currentPage - 1) * this.itemsPerPage;
			return this.filteredRequests.slice(start, start + this.itemsPerPage);
		},
	},
	methods: {
		async fetchRequests() {
			try {
				const requests = await fetchRequests();
				// Sort by timestamp, latest first
				this.requests = requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
			} catch (error) {
				alert("Error fetching requests: " + error.message);
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
		openRequestProductModal() {
			this.showRequestModal = true;
		},
		closeRequestModal() {
			this.showRequestModal = false;
			this.resetNewRequestForm();
		},
		resetNewRequestForm() {
			this.newRequest = { productName: "", quantity: 1, reason: "", timestamp: null };
		},
		async submitRequest() {
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) {
				alert("You need to be logged in to submit a request.");
				return;
			}

			this.newRequest.requestorId = user.uid; // Add the requestorId
			this.newRequest.timestamp = Date.now(); // Add the current timestamp

			try {
				await submitProductRequest(this.newRequest);
				alert("Request submitted successfully.");
				this.closeRequestModal();
				this.fetchRequests(); // Refresh requests list
			} catch (error) {
				alert("Error submitting request: " + error.message);
			}
		},
		getStatusClass(status) {
			if (status === "Approved") return "delivered";
			if (status === "Rejected") return "rejected";
			return "pending";
		},
		formatTimestamp(timestamp) {
			if (!timestamp) return "Unknown";
			return new Date(timestamp).toLocaleString();
		},
	},
	async mounted() {
		await this.fetchRequests();
	},
};
</script>
