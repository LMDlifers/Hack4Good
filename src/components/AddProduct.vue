<template>
		<div class="form-page box-shadow">
			<h2>Add New Product</h2>
			<form @submit.prevent="addProduct">
				<div>
					<label for="productName">Product Name:</label>
					<input
						id="productName"
						v-model="productName"
						type="text"
						placeholder="Enter product name"
						required
					/>
				</div>
				<div>
						<label for="pointsRequired">Points Required:</label>
						<input
								id="pointsRequired"
								v-model.number="pointsRequired"
								type="number"
								placeholder="Enter points required"
								min="1"
								required
						/>
				</div>
				<div>
						<label for="stock">Stock:</label>
						<input
								id="stock"
								v-model.number="stock"
								type="number"
								placeholder="Enter stock quantity"
								min="0"
								required
						/>
				</div>
				<button type="submit" class="w100">Add Product</button>
			</form>
		</div>
		<div class="container">
				<h2>Available Products</h2>
						<table v-if="Object.keys(products).length > 0">
						<thead>
								<tr>
								<th>Name</th>
								<th>Points Required</th>
								<th>Stock</th>
								<th>Hidden</th>
								<th>Actions</th>
								</tr>
						</thead>
						<tbody>
								<tr v-for="(product, id) in products" :key="id">
								<td>{{ product.name }}</td>
								<td>{{ product.pointsRequired }}</td>
								<td>{{ product.stock }}</td>
								<td>{{ product.hidden ? "Yes" : "No" }}</td>
								<td>
										<button @click="toggleVisibility(id, product)">
										{{ product.hidden ? "Unhide" : "Hide" }}
										</button>
								</td>
								</tr>
						</tbody>
						</table>
						<p v-else>No products available.</p>
		</div>
	</template>
	
<script>
import { addProductToDatabase, fetchProducts, toggleProductVisibility, checkIfAdmin } from "@/methods";

export default {
	name: "AddProductPage",
	data() {
		return {
			productName: "",
			pointsRequired: null,
			stock: null,
			isAdmin: false,
			products: {},
		};
	},
	methods: {
		async addProduct() {
			if (!this.isAdmin) {
				alert("You do not have permission to add products.");
				return;
			}

			const newProduct = {
				name: this.productName,
				pointsRequired: this.pointsRequired,
				stock: this.stock,
				hidden: false,
			};

			try {
				const message = await addProductToDatabase(newProduct);
				alert(message);
				this.productName = "";
				this.pointsRequired = null;
				this.stock = null;
				this.fetchProducts(); // Refresh product list
			} catch (error) {
				alert(error.message);
			}
		},
		async fetchProducts() {
			try {
				this.products = await fetchProducts();
			} catch (error) {
				alert(error.message);
			}
		},
		async toggleVisibility(productId, product) {
			try {
				const message = await toggleProductVisibility(productId, product.hidden);
				alert(message);
				this.fetchProducts(); // Refresh product list
			} catch (error) {
				alert(error.message);
			}
		},
	},
	async mounted() {
		try {
			this.isAdmin = await checkIfAdmin();
			if (!this.isAdmin) {
				alert("You are not authorized to view this page.");
				this.$router.push("/"); // Redirect to home if not admin
			}
			await this.fetchProducts(); // Fetch products on mount
		} catch (error) {
			alert(error.message);
			this.$router.push("/login"); // Redirect to login if error occurs
		}
	},
};
</script>