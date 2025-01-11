<template>
    <div class="form-page box-shadow">
        <h2>Create Users</h2>
        <!-- Form for Adding a New User -->
        <form class="add-user-form" @submit.prevent="addUser">
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
        <button type="submit" class="w100">Create User</button>
        </form>
    </div>
    <div class="container">
      <h2>Users</h2>
      <table v-if="users && Object.keys(users).length > 0">
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
              <button @click="deleteUser(id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No users found.</p>
    </div>
    
    
</template>
<script>
import { getDatabase, ref, get, push, remove } from "firebase/database";

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
    async fetchUsers() {
      const db = getDatabase();
      const usersRef = ref(db, "users");

      try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          this.users = snapshot.val();
        } else {
          console.log("No users found.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async addUser() {
      const db = getDatabase();
      const usersRef = ref(db, "users");

      try {
        // Push the new user to Firebase
        await push(usersRef, this.newUser);

        // Clear the form after success
        this.newUser = {
          username: "",
          email: "",
          phoneNumber: "",
          role: "user",
        };

        // Refresh the user list
        this.fetchUsers();

        alert("User added successfully!");
      } catch (error) {
        console.error("Error adding user:", error);
        alert("An error occurred while adding the user.");
      }
    },
    async deleteUser(id) {
      const db = getDatabase();
      const userRef = ref(db, `users/${id}`);

      try {
        // Remove the user from Firebase
        await remove(userRef);

        // Refresh the user list
        this.fetchUsers();

        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("An error occurred while deleting the user.");
      }
    },
  },
  mounted() {
    this.fetchUsers(); // Fetch the users when the component is mounted
  },
};
</script>