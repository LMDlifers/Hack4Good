<template>
    <div v-if="preorders.length > 0" class="container">
      <h2>Preorder Management</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Preorder Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(preorder, index) in paginatedPreorders" :key="index">
            <td>{{ preorder.username }}</td>
            <td>{{ preorder.productName }}</td>
            <td>{{ preorder.quantity }}</td>
            <td>
              <select
                v-model="preorder.status"
                @change="updateStatus(preorder)"
                :disabled="preorder.status === 'Delivered'"
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option disabled>Delivered</option>
              </select>
            </td>
            <td>{{ new Date(preorder.timestamp).toLocaleString() }}</td>
            <td>
              <button
                v-if="preorder.status === 'Approved'"
                @click="fulfillPreorder(preorder)"
              >
                Fulfill
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Pagination -->
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
        </button>
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
      return this.preorders.slice(start, end);
    },
  },
  methods: {
    async fetchPreorders() {
      try {
        this.preorders = await fetchAllPreorders();
      } catch (error) {
        alert("Error fetching preorders: " + error.message);
      }
    },
    async updateStatus(preorder) {
      try {
        await updatePreorderStatus(preorder.id, preorder.status);
        alert(`Status updated to "${preorder.status}" for ${preorder.productName}`);
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
