<template>
	<div class="form-page">
		<h2>Preorder a Product</h2>
		<form @submit.prevent="preorderProduct">
			<label for="productName">Select Product:</label>
			<select id="productName" v-model="selectedProductId" required>
				<option disabled value="">Select a product</option>
				<option v-for="(product, id) in products" :key="id" :value="id">
				{{ product.name }} (Available: {{ product.stock }})
				</option>
			</select>

			<label for="quantity">Quantity:</label>
			<input
				id="quantity"
				v-model.number="quantity"
				type="number"
				min="1"
				placeholder="Enter quantity"
				required
			/>
			<button type="submit" class="wmax">Preorder Product</button>
		</form>
	</div>
	<div class="container">
		<h2>List of Preorders</h2>
		<!-- Display list of preorders -->
		<table v-if="preorders.length > 0">
		<colgroup>
			<col style="width: 30%;" />
			<col style="width: 30%;" />
			<col style="width: 20%;" />
			<col style="width: 10%;" />
			<col style="width: 10%;" />
		</colgroup>
		<thead>
			<tr>
			<th>Preorderer</th>
			<th>Product Name</th>
			<th>Quantity</th>
			<th>Status</th>
			<th>Preorder Date</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(preorder, index) in preorders" :key="index">
			<td>{{ preorder.username }}</td>
			<td>{{ preorder.productName }}</td>
			<td>{{ preorder.quantity }}</td>
			<td>{{ preorder.status }}</td>
			<td>{{ new Date(preorder.timestamp).toLocaleString() }}</td>
			</tr>
		</tbody>
		</table>
		<p v-else>No preorders found.</p>
  </div>
</template>

<script>
	import { fetchProducts, fetchUserPreorders, preorderProduct, getCurrentUser } from "@/methods";

	export default {
		name: "PreorderProductPage",
		data() {
			return {
				selectedProductId: "",
				quantity: 1,
				preorders: [],
				products: {},
				};
			},
		methods: {
			async fetchProducts() {
				try {
					this.products = await fetchProducts();
				} catch (error) {
					alert(error.message);
				}
			},
			async fetchUserPreorders() {
				try {
					this.preorders = await fetchUserPreorders();
				} catch (error) {
					alert(error.message);
				}
			},
			async preorderProduct() {
				if (!this.userKey) {
					alert("Please log in to preorder a product.");
					return;
				}

				if (!this.selectedProductId || this.quantity < 1) {
					alert("Please select a valid product and quantity.");
					return;
				}

				const selectedProduct = this.products[this.selectedProductId];
				if (!selectedProduct) {
					alert("Invalid product selected.");
					return;
				}

				if (selectedProduct.stock >= this.quantity) {
					alert("There are enough stocks available");
					return;
				}
				try {
					const message = await preorderProduct(
						this.userKey,
						selectedProduct,
						this.selectedProductId,
						this.quantity
					);
					alert(message);
					this.selectedProductId = "";
					this.quantity = 1;
					this.fetchUserPreorders();
				} catch (error) {
					alert(error.message);
				}
			},
		},
		async mounted() {
			try {
				const key = await getCurrentUser();
				console.log("Current user key:", key);
				this.userKey = key;

				await this.fetchProducts();
				await this.fetchUserPreorders();

				console.log("Preorders:", this.preorders); // Debugging: Ensure preorders are fetched correctly
			} catch (error) {
				console.error("Error during component initialization:", error);
			}
		}
	};
</script>
