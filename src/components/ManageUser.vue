<template>
	<div v-if="Object.keys(users).length > 0" class="container">
		<div class="space-between">
			<h2>Users</h2>
			<button class="margin-l-s" @click="openAddUserModal">Add New User</button>
		</div>
		<div class="margin-t-s">
			<input
				class="search-bar"
				v-model="searchQuery"
				placeholder="Search products by name..."
				type="text"
			/>
		</div>
		<div>
			<!-- Table Header -->
			<div class="header margin-t-s">
				<div style="width: 20%;">Username</div>
				<div style="width: 20%;">Email</div>
				<div style="width: 20%;">Phone Number</div>
				<div style="width: 10%;">Role</div>
				<div style="width: 30%;">Actions</div>
			</div>

			<!-- User Rows -->
			<div
				class="header content" style="min-height: 75px; height: auto;"
				v-for="(user, id) in paginatedUsers"
				:key="id"
			>
				<div style="width: 20%;">{{ user.username }}</div>
				<div style="width: 20%;">{{ user.email }}</div>
				<div style="width: 20%;">{{ user.phoneNumber }}</div>
				<div style="width: 10%;">{{ user.role }} </div>
				<div style="width: 30%;" class="action-buttons">
					<button
						class="btn-red"
						v-if="!user.suspended"
						@click="openSuspendModal(user.id, user, false)"
					>
						Suspend
					</button>
					<button
						class="btn-green"
						v-if="user.suspended"
						@click="openSuspendModal(user.id, user, true)"
					>
						Unsuspend
					</button>
					<button class="btn-grey" @click="openResetPasswordModal(user.email)">Reset Password</button>

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
	<p v-else>No users found.</p>


		<!-- Add User Modal -->
	<div v-if="showAddUserModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeAddUserModal"></div>
		<div class="modal">
			<form class="form-page" @submit.prevent="handleAddUser">
				<h2>Add New User</h2>
				<div>
					<label for="username">Username:</label>
					<input v-model="newUser.username" type="text" id="username" required />
				</div>
				<div>
					<label for="email">Email:</label>
					<input v-model="newUser.email" type="email" id="email" required />
				</div>
				<div>
					<label for="phoneNumber">Phone Number:</label>
					<input v-model="newUser.phoneNumber" type="text" id="phoneNumber" required />
				</div>
				<div>
					<label for="role">Role:</label>
					<select v-model="newUser.role" id="role" required>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>

				<div class="modal-actions space-between">
					<button type="submit">Create User</button>
					<button type="button" class="btn-grey" @click="closeAddUserModal">Cancel</button>
				</div>
			</form>
		</div>
	</div>

		<!-- Suspend/Unsuspend Confirmation Modal -->
	<div v-if="showSuspendModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeSuspendModal"></div>
		<div class="modal padding-20">
			<h2>{{ suspendUser.suspended ? "Unsuspend User" : "Suspend User" }}</h2>
			<p>
				Are you sure you want to
				{{ suspendUser.suspended ? "unsuspend" : "suspend" }} {{ suspendUser.username }}?
			</p>
			<div class="modal-actions space-between">
				<button
					:class="suspendUser.suspended ? 'btn-green' : 'btn-red'"
					@click="confirmSuspendUser"
				>
					{{ suspendUser.suspended ? "Unsuspend" : "Suspend" }}
				</button>
				<button class="btn-grey" @click="closeSuspendModal">Cancel</button>
			</div>
		</div>
	</div>
	<!-- Reset Password Confirmation Modal -->
	<div v-if="showResetPasswordModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeResetPasswordModal"></div>
		<div class="modal padding-20">
			<h2>Reset Password</h2>
			<p>
				Are you sure you want to reset the password for <strong>{{ resetUserEmail }}</strong>?
			</p>
			<div class="modal-actions space-between">
			<button class="btn-green" @click="confirmResetPassword">Confirm</button>
			<button class="btn-grey" @click="closeResetPasswordModal">Cancel</button>
		</div>
	</div>
</div>

</template>

<script>
import { fetchUsers, addUser, suspendUser } from "@/methods";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default {
	name: "ManageUsersPage",
	data() {
		return {
			users: {}, // Object to store users
			newUser: {
			username: "",
			email: "",
			phoneNumber: "",
			role: "user", // Default role is 'user'
			},
			showAddUserModal: false, // Controls visibility of the Add User modal
			showSuspendModal: false, // Controls visibility of the suspend confirmation modal
			suspendUser: null, // User to be suspended/unsuspended
			suspendUserId: null, // ID of the user to be suspended/unsuspended
			showResetPasswordModal: false, // Controls visibility of the reset password confirmation modal
			resetUserEmail: "", // Email of the user to reset password for
			searchQuery: "", // Search query for filtering users
			currentPage: 1, // Current page for pagination
			itemsPerPage: 10, // Items per page
		};
	},

	computed: {
		filteredUsers() {
			const query = this.searchQuery.toLowerCase();
			return Object.entries(this.users)
				.map(([key, value]) => ({ id: key, ...value }))
				.filter(
					(user) =>
						user.username.toLowerCase().includes(query) ||
						user.email.toLowerCase().includes(query) ||
						user.phoneNumber.includes(query)
				);
		},
		paginatedUsers() {
			const start = (this.currentPage - 1) * this.itemsPerPage;
			const end = this.currentPage * this.itemsPerPage;
			return this.filteredUsers.slice(start, end);
		},
		totalPages() {
			return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
		},
	},
	methods: {
		async resetPassword(email) {
			const auth = getAuth();
			try {
			await sendPasswordResetEmail(auth, email);
			alert(`Password reset email sent to ${email}.`);
			} catch (error) {
			console.error("Error sending password reset email:", error);
			alert("Failed to send password reset email. Please try again.");
			}
		},
		openResetPasswordModal(email) {
			this.resetUserEmail = email;
			this.showResetPasswordModal = true;
		},
		closeResetPasswordModal() {
			this.resetUserEmail = "";
			this.showResetPasswordModal = false;
		},
		async confirmResetPassword() {
			try {
			await this.resetPassword(this.resetUserEmail);
			this.closeResetPasswordModal(); // Close the modal after reset
			} catch (error) {
			console.error("Error resetting password:", error);
			alert("An error occurred while resetting the password. Please try again.");
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
		async loadUsers() {
			try {
				this.users = await fetchUsers();
			} catch (error) {
				alert(error.message);
			}
		},
		openAddUserModal() {
			this.showAddUserModal = true;
		},
		closeAddUserModal() {
			this.showAddUserModal = false;
			this.resetNewUserForm();
		},
		resetNewUserForm() {
			this.newUser = {
				username: "",
				email: "",
				phoneNumber: "",
				role: "user", // Reset form
			};
		},
		async handleAddUser() {
			try {
				await addUser(this.newUser);
				this.resetNewUserForm();
				this.closeAddUserModal();
				await this.loadUsers(); // Refresh the user list
			} catch (error) {
				alert(error.message);
			}
		},
		openSuspendModal(userId, user, isUnsuspend) {
			this.suspendUserId = userId;
			this.suspendUser = { ...user, suspended: isUnsuspend }; // Pass user and current state
			this.showSuspendModal = true;
		},
		closeSuspendModal() {
			this.showSuspendModal = false;
			this.suspendUser = null;
			this.suspendUserId = null;
		},
		async confirmSuspendUser() {
			try {
				await suspendUser(this.suspendUserId, this.suspendUser.suspended);
				this.closeSuspendModal();
				await this.loadUsers(); // Refresh the user list
			} catch (error) {
				alert(error.message);
			}
		},
	},
	async mounted() {
		await this.loadUsers(); // Load users on mount
	},
};
</script>
