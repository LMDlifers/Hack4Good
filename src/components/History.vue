<template>
    <div class="transaction-history-page">
      <h2>Transaction History</h2>
      <table v-if="transactions.length">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Total Points</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.productName }}</td>
            <td>{{ transaction.quantity }}</td>
            <td>{{ transaction.totalPoints }}</td>
            <td>{{ formatTimestamp(transaction.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>No transactions available.</p>
    </div>
  </template>
  
  <script>
  import { getDatabase, ref, get } from "firebase/database";
  import { getAuth } from "firebase/auth";
  
  export default {
    name: "TransactionHistory",
    data() {
      return {
        transactions: [], // Stores fetched transactions
      };
    },
    methods: {
      async fetchTransactions() {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (!user) {
          alert("Please log in to view your transaction history.");
          return;
        }
  
        const db = getDatabase();
        const transactionsRef = ref(db, `users/${user.uid}/transactions`);
  
        try {
          const snapshot = await get(transactionsRef);
          if (snapshot.exists()) {
            // Convert transactions from Firebase into an array
            this.transactions = Object.entries(snapshot.val()).map(([key, value]) => ({
              id: key,
              ...value,
            }));
          } else {
            console.log("No transactions found.");
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
          alert("Error fetching transactions. Please try again later.");
        }
      },
      formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
      },
    },
    async mounted() {
      await this.fetchTransactions();
    },
  };
  </script>
  