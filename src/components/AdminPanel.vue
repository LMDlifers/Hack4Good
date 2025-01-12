<template>
	<div>
		<h2>Admin Panel</h2>
		<button @click="manageUsers">Manage Users</button>
		<button @click="approveRequests">Approve Requests</button>
		<button @click="manageAuction">Manage Auction</button>
	</div>
</template>
	
<script>
	export default {
		name: "AdminPanel",
		methods: {
			manageUsers() {
				console.log("Managing users...");
			},
			approveRequests() {
				console.log("Approving requests...");
			},
			manageAuction() {
				this.$router.push('/AdminAuction');
			}
		},
	};
</script>
	