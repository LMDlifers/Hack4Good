<template>
     <div class="container">
		<h2>Voucher Task Management</h2>
	</div>
	<div v-if="paginatedVoucherTasks.length > 0" class="container scrollable-div">
		<div>
			<div class="header margin-t-s">
				<div style="width: 15%;">User</div>
				<div style="width: 30%;">Description</div>
                <div style="width: 10%;">Points</div>
				<div style="width: 15%;">Status</div>
				<div style="width: 15%;">Submission Date</div>
				<div style="width: 15%;">Action</div>
			</div>
			<div
				class="header content" style="min-height: 75px; height: auto;"
				v-for="(task, index) in paginatedVoucherTasks"
				:key="index"
			>
				<div style="width: 15%;">{{ task.username }}</div>
				<div style="width: 30%;"><h4>{{ task.title }}</h4>{{ task.description }}</div>
                <div style="width: 10%;">{{ task.points }}</div>
				<div style="width: 15%;">
					<span v-if="task.status === 'Approved'" class="status delivered">
						{{ task.status }}
					</span>
					<span v-else-if="task.status === 'Rejected'" class="status rejected">
						{{ task.status }}
					</span>
					<span v-else class="status pending">
						{{ task.status }}
					</span>
				</div>
				<div style="width: 15%;">{{ new Date(task.timestamp).toLocaleString() }}</div>
				<div style="width: 15%;">
					<div v-if="task.status === 'Pending'" class="action-buttons">
						<button class="btn-red" @click="openConfirmModal(task, 'reject')">Reject</button>
						<button class="btn-green" @click="openConfirmModal(task, 'approve')">Approve</button>
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
					<strong>{{ confirmAction }}</strong> the voucher task
					<strong>{{ selectedTask?.title }}</strong> by
					<strong>{{ selectedTask?.username }}</strong>?
				</p>
				<div class="modal-actions space-between">
					<button class="btn-grey" @click="closeConfirmModal">Cancel</button>
					<button class="btn-green" @click="confirmActionHandler">Confirm</button>
				</div>
			</div>
		</div>
	</div>
    <div v-else class="container margin-t-s">
		<p>No voucher tasks found.</p>
	</div>
</template>

<script>
import { fetchVoucherTasks, updateVoucherTaskStatus, logAuditEntry, getCurrentUserData, recordTransaction, updateUserPoints } from "@/methods";
import { getAuth } from "firebase/auth";

export default {
	name: "AdminVoucherTaskPage",
	data() {
		return {
			voucherTasks: [], // List of all voucher tasks
			currentPage: 1, // Current page for pagination
			perPage: 10, // Number of items per page
			showConfirmModal: false, // Controls visibility of the confirmation modal
			confirmAction: "", // Action to confirm (Approve, Reject)
			selectedTask: null, // Task being acted upon
		};
	},
	computed: {
		totalPages() {
			return Math.ceil(this.voucherTasks.length / this.perPage);
		},
		paginatedVoucherTasks() {
			const start = (this.currentPage - 1) * this.perPage;
			const end = this.currentPage * this.perPage;
			return this.sortedVoucherTasks.slice(start, end);
		},
		// Sort voucher tasks by timestamp in descending order
		sortedVoucherTasks() {
			return [...this.voucherTasks].sort(
				(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
			);
		},
	},
	methods: {
		async fetchVoucherTasks() {
			try {
				// Fetch all voucher tasks
				this.voucherTasks = await fetchVoucherTasks();
			} catch (error) {
				alert("Error fetching voucher tasks: " + error.message);
			}
		},
		openConfirmModal(task, action) {
			this.selectedTask = task;
			this.confirmAction = action;
			this.showConfirmModal = true;
		},
		closeConfirmModal() {
			this.selectedTask = null;
			this.confirmAction = "";
			this.showConfirmModal = false;
		},
		async confirmActionHandler() {
            try {
                const status = this.confirmAction === "approve" ? "Approved" : "Rejected";

                const auth = getAuth();
                const currentUser = auth.currentUser;
                const user = await getCurrentUserData();
                if (currentUser) {
                    // Log the action to the audit log
                    await logAuditEntry({
                        type: "Voucher Task",
                        user: currentUser.uid,
                        details: `${user.username} ${status.toLowerCase()} the voucher task "${this.selectedTask.description}" submitted by ${this.selectedTask.username}.`,
                        timestamp: Date.now(),
                    });

                    // If approved, update user points and record in transaction history
                    if (status === "Approved") {
                        await updateUserPoints(this.selectedTask.requestorId, this.selectedTask.points);
                        await recordTransaction(this.selectedTask.requestorId, this.selectedTask);
                    }
                }

                // Update the voucher task status
                await this.updateStatus(this.selectedTask, status);
                this.closeConfirmModal();
            } catch (error) {
                alert("Error performing action: " + error.message);
            }
        },

		async updateStatus(task, status) {
			try {
				task.status = status;
				await updateVoucherTaskStatus(task.id, status);
				alert(`Voucher task for "${task.title}" has been ${status.toLowerCase()}.`);
				this.fetchVoucherTasks(); // Refresh the list of tasks
			} catch (error) {
				alert("Error updating task status: " + error.message);
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
	},
	async mounted() {
		await this.fetchVoucherTasks();
	},
};
</script>
