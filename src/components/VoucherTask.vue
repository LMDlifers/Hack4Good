<template>
	<div class="container">
		<div class="space-between">
			<h2>Voucher Tasks</h2>
			<button class="margin-l-s" @click="openVoucherTaskModal">Submit New Task</button>
		</div>
        <div class="margin-t-s">
			<input
				class="search-bar"
				v-model="searchQuery"
				placeholder="Search tasks by title..."
				type="text"
			/>
		</div>
	</div>
	<div v-if="paginatedTasks.length > 0" class="container scrollable-div">
		
		<div>
			<!-- Table Header -->
			<div class="header margin-t-s">
				<div style="width: 20%;">Task Title</div>
				<div style="width: 20%;">Points</div>
				<div style="width: 20%;">Description</div>
				<div style="width: 20%;">Status</div>
				<div style="width: 20%;">Timestamp</div>
			</div>

			<!-- Task Rows -->
			<div
				class="header content"
				style="min-height: 75px; height: auto;"
				v-for="(task, id) in paginatedTasks"
				:key="id"
			>
				<div style="width: 20%;">{{ task.title }}</div>
				<div style="width: 20%;">{{ task.points }}</div>
				<div style="width: 20%;">{{ task.description }}</div>
				<div style="width: 20%;">
					<span class="status" :class="getStatusClass(task.status)">
						{{ task.status }}
					</span>
				</div>
				<div style="width: 20%;">{{ formatTimestamp(task.timestamp) }}</div>
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
	<div class="container margin-t-s" v-else>
		<p>No voucher tasks found.</p>
	</div>

	<!-- Submit Voucher Task Modal -->
	<div v-if="showTaskModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeVoucherTaskModal"></div>
		<div class="modal">
			<form class="form-page" @submit.prevent="submitTask">
				<h2>Submit Voucher Task</h2>
				<div>
					<label for="title">Task Title:</label>
					<input v-model="newTask.title" type="text" id="title" required />
				</div>
				<div>
					<label for="description">Description:</label>
					<textarea
						id="description"
						v-model="newTask.description"
						placeholder="Provide details of the task"
						rows="3"
						required
					></textarea>
				</div>
				<div>
					<label for="points">Points:</label>
					<input v-model.number="newTask.points" type="number" id="points" min="1" required />
				</div>

				<div class="modal-actions space-between">
					<button type="submit">Submit Task</button>
					<button type="button" class="btn-grey" @click="closeVoucherTaskModal">Cancel</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
import { fetchUserVoucherTasks , submitVoucherTask } from "@/methods";
import { getAuth } from "firebase/auth";

export default {
	name: "VoucherTaskPage",
	data() {
		return {
			tasks: [], // Holds voucher task data
			searchQuery: "",
			currentPage: 1,
			itemsPerPage: 5,
			showTaskModal: false,
			newTask: {
				title: "",
				description: "",
				points: 1,
				requestorId: "", // This will be populated during submission
				timestamp: null, // Timestamp for the request
                status: "",
			},
		};
	},
	computed: {
		filteredTasks() {
			if (!this.searchQuery) return this.tasks;
			return this.tasks.filter((task) =>
				task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
			);
		},
		totalPages() {
			return Math.ceil(this.filteredTasks.length / this.itemsPerPage);
		},
		paginatedTasks() {
			const start = (this.currentPage - 1) * this.itemsPerPage;
			return this.filteredTasks.slice(start, start + this.itemsPerPage);
		},
	},
	methods: {
		async fetchTasks() {
			try {
				const tasks = await fetchUserVoucherTasks();
				// Sort by timestamp, latest first
				this.tasks = tasks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
			} catch (error) {
				alert("Error fetching tasks: " + error.message);
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
		openVoucherTaskModal() {
			this.showTaskModal = true;
		},
		closeVoucherTaskModal() {
			this.showTaskModal = false;
			this.resetNewTaskForm();
		},
		resetNewTaskForm() {
			this.newTask = { title: "", description: "", points: 1, timestamp: null };
		},
		async submitTask() {
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) {
				alert("You need to be logged in to submit a voucher task.");
				return;
			}

			this.newTask.requestorId = user.uid; // Add the requestorId
			this.newTask.timestamp = Date.now(); // Add the current timestamp
            this.newTask.status = "Pending";
			try {
				await submitVoucherTask(this.newTask);
				alert("Voucher task submitted successfully.");
				this.closeVoucherTaskModal();
				this.fetchTasks(); // Refresh tasks list
			} catch (error) {
				alert("Error submitting voucher task: " + error.message);
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
		await this.fetchTasks();
	},
};
</script>
