<template>
    <div>
      <h2>Welcome, {{ user.name }}</h2>
      <p>Voucher Balance: {{ user.vouchers }}</p>
      <ul>
        <li v-for="transaction in transactions" :key="transaction.id">
          {{ transaction.date }}: {{ transaction.details }}
        </li>
      </ul>
      <button @click="requestItem">Request Item</button>
    </div>
  </template>
  
  <script>
  export default {
      name: "UserDashboard",
      data() {
        return {
          user: { name: "John Doe", vouchers: 100 },
          transactions: [
            { id: 1, date: "2025-01-01", details: "Purchased bread" },
          ],
        };
      },
      methods: {
        requestItem() {
          console.log("Item requested");
        },
      },
    };

  </script>
  