<template>
	<div class="container">
		<h2>Preorder Management</h2>
	</div>
	<div v-if="paginatedPreorders.length > 0" class="container scrollable-div">
		<div>
			<div class="header margin-t-s">
				<div style="width: 16.66%;">User</div>
				<div style="width: 16.66%;">Product</div>
				<div style="width: 16.66%;">Quantity</div>
				<div style="width: 16.66%;">Status</div>
				<div style="width: 16.66%;">PreOrder Date</div>
				<div style="width: 16.66%;">Action</div>
			</div>
			<div
				class="header content"
				v-for="(preorder, index) in paginatedPreorders"
				:key="index"
			>
				<div style="width: 16.66%;">{{ preorder.username }}</div>
				<div style="width: 16.66%;">
					<p>{{ preorder.productName }}</p>
					<img
					v-if="preorder.imageUrl"
					:src="preorder.imageUrl"
					alt="Product Image"
					class="product-image-s"
					/>
					<p v-else>No Image</p>
				</div>
				<div style="width: 16.66%;">{{ preorder.quantity }}</div>
				<div style="width: 16.66%;">
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
				<div style="width: 16.66%;">{{ new Date(preorder.timestamp).toLocaleString() }}</div>
				<div style="width: 16.66%;">
					<div v-if="preorder.status === 'Pending'" class="action-buttons">
						<button class="btn-green" @click="openConfirmModal(preorder, 'approve')">Approve</button>
						<button class="btn-red" @click="openConfirmModal(preorder, 'reject')">Reject</button>
					</div>
					<div v-else-if="preorder.status === 'Approved'">
						<button @click="openConfirmModal(preorder, 'Fulfill')">Fulfill</button>
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

		<!-- Confirmation Modal -->
		<div v-if="showConfirmModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeConfirmModal"></div>
			<div class="modal padding-20">
				<h2>Confirm Action</h2>
				<p>
					Are you sure you want to
					<strong>{{ confirmAction }}</strong> the preorder for
					<strong>{{ selectedPreorder?.productName }}</strong> by
					<strong>{{ selectedPreorder?.username }}</strong>?
				</p>
				<div class="modal-actions space-between">
					<button class="btn-grey" @click="closeConfirmModal">Cancel</button>
					<button class="btn-green" @click="confirmActionHandler">Confirm</button>
				</div>
			</div>
		</div>
	</div>
	<div v-else class="container margin-t-s">
		<p>No preorders found.</p>
	</div>
</template>

<script>
import { fetchPreorders, updatePreorderStatus, deductProductStock } from "@/methods";
import { getDatabase, ref, get, set, push } from "firebase/database";

export default {
	name: "AdminPreorderPage",
	data() {
		return {
			preorders: [], // List of all preorders
			currentPage: 1, // Current page for pagination
			perPage: 10, // Number of items per page
			showConfirmModal: false, // Controls visibility of the confirmation modal
			confirmAction: "", // Action to confirm (Approve, Reject, Fulfill)
			selectedPreorder: null, // Preorder being acted upon
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
				this.preorders = await fetchPreorders();
			} catch (error) {
				alert("Error fetching preorders: " + error.message);
			}
		},
		openConfirmModal(preorder, action) {
			this.selectedPreorder = preorder;
			this.confirmAction = action;
			this.showConfirmModal = true;
		},
		closeConfirmModal() {
			this.selectedPreorder = null;
			this.confirmAction = "";
			this.showConfirmModal = false;
		},
		async confirmActionHandler() {
			try {
				if (this.confirmAction === "Fulfill") {
					await this.fulfillPreorder(this.selectedPreorder);
				} else {
					if (this.confirmAction === "approve") {
						this.confirmAction = "Approved";
					} else {
						this.confirmAction = "Rejected";
					}
					await this.updateStatus(this.selectedPreorder, this.confirmAction);
				}
				this.closeConfirmModal();
			} catch (error) {
				alert("Error performing action: " + error.message);
			}
		},
		async updateStatus(preorder, status) {
			try {
				preorder.status = status;

				// Update preorder status in the database
				await updatePreorderStatus(preorder, preorder.status);

				// If the status is "Rejected", refund the points
				if (status === "Rejected") {
					const userId = preorder.preordererId;
					const pointsToRefund = preorder.pointsRequired * preorder.quantity;

					// Fetch user data
					const userRef = ref(getDatabase(), `users/${userId}`);
					const userSnapshot = await get(userRef);

					if (userSnapshot.exists()) {
						const userData = userSnapshot.val();
						const updatedPoints = (userData.voucherPoints || 0) + pointsToRefund;

						// Update user points
						await set(userRef, {
							...userData,
							voucherPoints: updatedPoints,
						});

						// Add a transaction record
						const transactionsRef = ref(getDatabase(), `users/${userId}/transactions`);
						const newTransactionRef = push(transactionsRef);

						await set(newTransactionRef, {
							productId: preorder.productId,
							details: "Preorder for '" + preorder.productName + "' has been rejected",
							quantity: preorder.quantity,
							totalPoints: pointsToRefund, // Positive value for a refund
							type: "Preorder Refund",
							timestamp: new Date().toISOString(),
						});
						// alert(`Points refunded: ${pointsToRefund} to user ${preorder.username}`);
					}
				}
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
				await updatePreorderStatus(preorder, preorder.status);

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
