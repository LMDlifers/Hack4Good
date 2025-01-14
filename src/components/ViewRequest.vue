<template>
    <div class="container">
		<h2>Request Management</h2>
	</div>
	<div v-if="paginatedRequests.length > 0" class="container scrollable-div">
		<div>
			<div class="header margin-t-s">
				<div style="width: 16.66%;">Requested By</div>
				<div style="width: 16.66%;">Product Name</div>
				<div style="width: 16.66%;">Quantity</div>
				<div style="width: 16.66%;">Reason</div>
				<div style="width: 16.66%;">Timestamp</div>
				<div style="width: 16.66%;">Status</div>
				<div style="width: 16.66%;">Action</div>
			</div>
			<div
				class="header content" style="min-height: 75px; height: auto;"
				v-for="(request, index) in paginatedRequests"
				:key="index"
			>
				<div style="width: 16.66%;">{{ request.username }}</div>
				<div style="width: 16.66%;">{{ request.productName }}</div>
				<div style="width: 16.66%;">{{ request.quantity }}</div>
				<div style="width: 16.66%;">{{ request.reason }}</div>
				<div style="width: 16.66%;">{{ new Date(request.timestamp).toLocaleString() }}</div>
				<div style="width: 16.66%;">
					<span v-if="request.status === 'Approved'" class="status delivered">
						{{ request.status }}
					</span>
					<span v-else-if="request.status === 'Rejected'" class="status rejected">
						{{ request.status }}
					</span>
					<span v-else class="status pending">{{ request.status }}</span>
				</div>
				<div style="width: 16.66%;">
					<div v-if="request.status === 'Pending'" class="action-buttons">
						<button class="btn-green" @click="updateStatus(request, 'Approved')">Approve</button>
						<button class="btn-red" @click="updateStatus(request, 'Rejected')">Reject</button>
					</div>
					<div v-else>
						<span>No Actions</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Pagination -->
		<div class="pagination" v-if="totalPages > 1">
			<button v-if="currentPage > 1" @click="changePage(currentPage - 1)">
				Previous
			</button>
			<span v-else style="visibility: hidden;">Previous</span>
			<span>Page {{ currentPage }} of {{ totalPages }}</span>
			<button v-if="currentPage < totalPages" @click="changePage(currentPage + 1)">
				Next
			</button>
			<span v-else style="visibility: hidden;">Next</span>
		</div>
	</div>
	<div v-else class="container margin-top-s">
		<p>No requests found.</p>
	</div>
</template>

<script>
import { fetchRequests, updateRequestStatus, logAuditEntry, getCurrentUserData } from "@/methods";
import { getAuth } from "firebase/auth";

export default {
	name: "AdminRequestPage",
	data() {
		return {
			requests: [], // Holds all requests with usernames and timestamps
			currentPage: 1, // Current page for pagination
			perPage: 10, // Number of requests per page
		};
	},
	computed: {
		totalPages() {
			return Math.ceil(this.requests.length / this.perPage);
		},
		paginatedRequests() {
			const start = (this.currentPage - 1) * this.perPage;
			const end = this.currentPage * this.perPage;
			return this.requests.slice(start, end);
		},
	},
	methods: {
		async fetchRequests() {
			try {
				const requests = await fetchRequests(); // Fetch all requests with usernames and timestamps
				// Sort requests by timestamp in descending order
				this.requests = requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
			} catch (error) {
				alert("Error fetching requests: " + error.message);
			}
		},
		async updateStatus(request, status) {
			try {
				await updateRequestStatus(request.id, status);
				alert(`Request for ${request.productName} has been ${status.toLowerCase()}.`);

                const auth = getAuth();
				const currentUser = auth.currentUser;
                const user = await getCurrentUserData();
				if (currentUser) {
					await logAuditEntry({
						type: "request",
						user: currentUser.uid,
                        details: `${user.username} has ${status.toLowerCase()} request for ${request.productName}`
					});
				}

				await this.fetchRequests(); // Refresh request list
			} catch (error) {
				alert("Error updating status: " + error.message);
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
		getStatusClass(status) {
			if (status === "Approved") return "approved";
			if (status === "Rejected") return "rejected";
			return "pending";
		},
	},
	async mounted() {
		await this.fetchRequests(); // Fetch requests on component mount
	},
};
</script>

