<template>
    <div>
      <h2>Admin Panel</h2>
      <button @click="manageUsers">Manage Users</button>
      <button @click="approveRequests">Approve Requests</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      manageUsers() {
        console.log("Managing users...");
      },
      approveRequests() {
        console.log("Approving requests...");
      },
    },
  };
  </script>
  