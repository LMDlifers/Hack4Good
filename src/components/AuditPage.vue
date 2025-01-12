<template>
    <div class="audit-page container">
      <h2>Audit Logs</h2>
      <table v-if="paginatedAudits.length > 0">
        <thead>
          <tr>
            <th>Type</th>
            <th>User</th>
            <th>Details</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(audit, index) in paginatedAudits" :key="index">
            <td>{{ audit.type }}</td>
            <td>{{ audit.user }}</td>
            <td>{{ audit.details }}</td>
            <td>{{ new Date(audit.timestamp).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>No audit logs available.</p>
  
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          Next
        </button>
      </div>
    </div>
  </template>
  <script>
import { fetchAuditLogs } from "@/methods";

export default {
  name: "AuditPage",
  data() {
    return {
      audits: [], // Store all audit logs
      currentPage: 1, // Current page for pagination
      perPage: 10, // Number of logs per page
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.audits.length / this.perPage);
    },
    paginatedAudits() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = this.currentPage * this.perPage;
      return this.audits.slice(start, end);
    },
  },
  methods: {
    async fetchAudits() {
      try {
        this.audits = await fetchAuditLogs();
      } catch (error) {
        alert("Error fetching audit logs: " + error.message);
      }
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  async mounted() {
    await this.fetchAudits();
  },
};
</script>
