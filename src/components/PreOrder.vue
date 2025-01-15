<template>
	<div class="container">
		<!-- Preorder Button -->
		<div class="space-between">
			<h2>List of Preorders</h2>
			<!-- <button class="btn-primary" @click="openPreorderModal">Add Preorder</button> -->
		</div>
	</div>
	<div v-if="paginatedPreorders.length > 0" class="container scrollable-div">
		<!-- Preorders Header -->
		<div class="header margin-t-s">
			<div style="width: 25%;">Product Name</div>
			<div style="width: 25%;">Quantity</div>
			<div style="width: 25%;">Status</div>
			<div style="width: 25%;">Preorder Date</div>
		</div>

		<!-- Preorders Rows -->
		<div
			class="header content margin-t-s"
			v-for="(preorder, index) in paginatedPreorders"
			:key="index"
		>	
			<div style="width: 25%;">
				<p>{{ preorder.productName }}</p>
				<img
				v-if="preorder.imageUrl"
				:src="preorder.imageUrl"
				alt="Product Image"
				class="product-image-s"
				/>
				<p v-else>No Image</p>
			</div>
			<div style="width: 25%;">{{ preorder.quantity }}</div>
			<div style="width: 25%;">
					<span v-if="preorder.status === 'Delivered' || preorder.status === 'Approved'" class="status delivered">
						{{ preorder.status }}
					</span>
					<span v-else-if="preorder.status === 'Rejected'" class="status rejected">
						{{ preorder.status }}
					</span>
					<span v-else class="status pending">
						{{ preorder.status }}
					</span>
				</div>
			<div style="width: 25%;">{{ new Date(preorder.timestamp).toLocaleString() }}</div>
		</div>

		<!-- Pagination -->
		<div class="pagination" v-if="totalPages > 1">
			<button 
				v-if="currentPage > 1" 
				@click="changePage(currentPage - 1)"
			>
				Previous
			</button>
			<span v-else style="visibility: hidden;">Previous</span>
			<span>Page {{ currentPage }} of {{ totalPages }}</span>
			<button 
				v-if="currentPage < totalPages" 
				@click="changePage(currentPage + 1)"
			>
				Next
			</button>
			<span v-else style="visibility: hidden;">Next</span>
		</div>
	</div>
	<div v-else class="container margin-t-s">
		<p>No pre-orders found.</p>
	</div>
	<!-- Preorder Modal -->
	<div v-if="showPreorderModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closePreorderModal"></div>
			<div class="modal">
				<form @submit.prevent="preorderProduct" class="form-page">
					<h2>Preorder a Product</h2>
					<div>
						<label for="productName">Select Product:</label>
						<select id="productName" v-model="selectedProductId" required>
							<option disabled value="">Select a product</option>
							<option v-for="(product, id) in products" :key="id" :value="id">
								{{ product.name }} (Available: {{ product.stock }})
							</option>
						</select>
					</div>
					<div>
						<label for="quantity">Quantity:</label>
						<input
							id="quantity"
							v-model.number="quantity"
							type="number"
							min="1"
							placeholder="Enter quantity"
							required
						/>
					</div>
					<div class="space-between">
						<button type="button" class="btn-grey" @click="closePreorderModal">Cancel</button>
						<button type="submit">Preorder</button>
					</div>
				</form>
			</div>
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
			currentPage: 1, // Current page for pagination
			perPage: 10, // Number of items per page
			showPreorderModal: false, // Controls visibility of the modal
		};
	},
	computed: {
		totalPages() {
			return Math.ceil(this.preorders.length / this.perPage);
		},
		paginatedPreorders() {
			const start = (this.currentPage - 1) * this.perPage;
			const end = this.currentPage * this.perPage;
			return this.sortedPreorders.slice(start, end);
		},
		// Sort preorders by timestamp in descending order
		sortedPreorders() {
			return [...this.preorders].sort(
				(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
			);
		},
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
		openPreorderModal() {
			this.showPreorderModal = true;
		},
		closePreorderModal() {
			this.showPreorderModal = false;
		},
		async preorderProduct() {
			if (!this.userKey) {
				alert("Please log in to preorder a product.");
				return;
			}

			if (!this.selectedProductId || this.quantity < 1) {
				alert("Please select a valid product and quantity.");
				alert(this.selectedProductId);
				return;
			}

			const selectedProduct = this.products[this.selectedProductId];
			if (!selectedProduct) {
				alert("Invalid product selected.");
				return;
			}

			if (selectedProduct.stock >= this.quantity) {
				alert("There are enough stocks available, please purchase it normally.");
				return;
			}
			alert('t');
			try {
				const message = await preorderProduct(
					this.userKey,
					selectedProduct,
					selectedProduct.id,
					this.quantity
				);
				alert(message);
				this.selectedProductId = "";
				this.quantity = 1;
				this.closePreorderModal();
				this.fetchUserPreorders();
			} catch (error) {
				alert(error.message);
			}
		},
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
				this.currentPage = page;
			}
		},
	},
	async mounted() {
		try {
			const userKey = await getCurrentUser();
			this.userKey = userKey;

			await this.fetchProducts();
			await this.fetchUserPreorders();
		} catch (error) {
			console.error("Error during component initialization:", error);
			alert("Failed to initialize the component.");
		}
	}

};
</script>