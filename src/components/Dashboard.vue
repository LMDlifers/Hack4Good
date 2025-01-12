<template>
	<div class="container">
		<div class="home-container">
			<h3>Welcome, {{ userData.username }}! You have {{ userData.voucherPoints }} points</h3>
			<div class="tabs">
				<router-link to="/preorder">View Pre Orders</router-link>
				<router-link to="/history">View Transaction History</router-link>
			</div>
		</div>
		<input class="search-bar" v-model="searchQuery" placeholder="Search for products..." />
		<div class="products-container">
			<div class="product bg-white" v-for="product in filteredProducts" :key="product.id">
				<h3>{{ product.name }}</h3>
				<div class="product-details">
					<div>
						<p>Points Required: {{ product.pointsRequired }}</p>
						<p>Stock: {{ product.stock }}</p>
					</div>
					<button v-if="product.stock !== 0" @click="handleAddToCart(product)">Add to Cart</button>
					<button v-else @click="preorderProduct(product)">Pre-order</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { fetchProducts, addToCart, getCurrentUser, getCurrentUserData } from "@/methods";

export default {
	name: "UserDashboard",
	data() {
		return {
			userData: {},
			userKey: null,
			products: {},
			searchQuery: "",
		};
	},
	computed: {
		filteredProducts() {
			const query = this.searchQuery.toLowerCase();

			// Transform `this.products` to include keys as part of each product object
			const transformedProducts = Object.entries(this.products).map(([key, value]) => ({
				id: key, // Include the key as `id`
				...value, // Spread the rest of the product's properties
			}));

			// Apply filtering logic
			return transformedProducts
				.filter((product) => product && !product.hidden) // Exclude hidden products
				.filter((product) => product.name.toLowerCase().includes(query));
		},
	},
	methods: {
		// async handleRedeemProduct(product) {
		// 	try {
		// 		const message = await redeemProduct(product.id, product, this.userKey, this.userData);
		// 		alert(message);
		// 		this.loadProducts();
		// 	} catch (error) {
		// 		alert(error.message);
		// 	}
		// },
		async preorderProduct(product) {
			try {
				// Redirect to the Pre-order page with the selected product details
				this.$router.push({
				name: "PreOrder",
				query: {
					id: product.id,
					name: product.name,
					pointsRequired: product.pointsRequired,
					stock: product.stock,
				},
				});
			} catch (error) {
				console.error("Error during pre-order navigation:", error);
				alert(error.message);
			}
			},

		async handleAddToCart(product) {
			try {
				const message = await addToCart(product.id, product, this.userKey);
				alert(message);
			} catch (error) {
				alert(error.message);
			}
		},
		async loadProducts() {
			try {
				this.products = await fetchProducts();
			} catch (error) {
				alert(error.message);
			}
		},
		async loadUserData() {
			try {
				const userKey = await getCurrentUser();
				const userData = await getCurrentUserData();
				this.userKey = userKey;
				this.userData = userData;
			} catch (error) {
				alert(error.message);
			}
		},
	},
	async mounted() {
		await this.loadUserData();
		await this.loadProducts();
	},
};
</script>
