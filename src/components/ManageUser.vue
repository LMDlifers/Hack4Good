<template>
	<div class="form-page box-shadow">
		<h2>Create Users</h2>
		<!-- Form for Adding a New User -->
		<form class="add-user-form" @submit.prevent="handleAddUser">
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
			<button type="submit" class="wmax">Create User</button>
		</form>
	</div>
	<div class="container">
		<h2>Users</h2>
		<table v-if="Object.keys(users).length > 0">
			<thead>
				<tr>
					<th>Username</th>
					<th>Email</th>
					<th>Phone Number</th>
					<th>Role</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(user, id) in users" :key="id">
					<td>{{ user.username }}</td>
					<td>{{ user.email }}</td>
					<td>{{ user.phoneNumber }}</td>
					<td>{{ user.role }}</td>
					<td>
						<button v-if=!user.suspended @click="handleSuspendUser(id, user.suspended)">Suspend</button>
						<button v-if=user.suspended @click="handleSuspendUser(id, user.suspended)">Unsuspend</button>
					</td>
				</tr>
			</tbody>
		</table>
		<p v-else>No users found.</p>
	</div>
</template>

<script>
import { fetchUsers, addUser, suspendUser } from "@/methods";

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
		};
	},
	methods: {
		async loadUsers() {
			try {
				this.users = await fetchUsers();
			} catch (error) {
				alert(error.message);
			}
		},
		async handleAddUser() {
			try {
				await addUser(this.newUser);
				this.newUser = {
					username: "",
					email: "",
					phoneNumber: "",
					role: "user", // Reset form
				};
				await this.loadUsers(); // Refresh the user list
			} catch (error) {
				alert(error.message);
			}
		},
		async handleSuspendUser(userId, suspended) {
			try {
				await suspendUser(userId, suspended);
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
