<template>
	<div class="container">
		<h2>Admin Panel</h2>
		<p>Nothing here</p>
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
	