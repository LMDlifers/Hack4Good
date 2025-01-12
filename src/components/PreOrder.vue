<template>
	<div class="container">
		<!-- Preorder Modal -->
		<div v-if="showPreorderModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closePreorderModal"></div>
			<div class="modal">
				<h2>Preorder a Product</h2>
				<form @submit.prevent="preorderProduct">
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
						<button type="submit">Preorder Product</button>
						<button type="button" class="btn-grey" @click="closePreorderModal">Cancel</button>
					</div>
				</form>
			</div>
		</div>

		<h2>List of Preorders</h2>
		<!-- Preorders Header -->
		<div class="align-items-center bg-white container-row h50 wmax margin-t-s center-vh">
			<div class="center-vh" style="width: 20%;">Preorderer</div>
			<div class="center-vh" style="width: 20%;">Product Name</div>
			<div class="center-vh" style="width: 20%;">Quantity</div>
			<div class="center-vh" style="width: 20%;">Status</div>
			<div class="center-vh" style="width: 20%;">Preorder Date</div>
		</div>

		<!-- Preorders Rows -->
		<div
			class="align-items-center bg-white h100 wmax margin-t-s"
			v-for="(preorder, index) in paginatedPreorders"
			:key="index"
		>
			<div class="center-vh" style="width: 20%;">{{ preorder.username }}</div>
			<div class="center-vh" style="width: 20%;">{{ preorder.productName }}</div>
			<div class="center-vh" style="width: 20%;">{{ preorder.quantity }}</div>
			<div class="center-vh" style="width: 20%;">{{ preorder.status }}</div>
			<div class="center-vh" style="width: 20%;">{{ new Date(preorder.timestamp).toLocaleString() }}</div>
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
			perPage: 1, // Number of items per page
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
			return this.preorders.slice(start, end);
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
				return;
			}

			const selectedProduct = this.products[this.selectedProductId];
			if (!selectedProduct) {
				alert("Invalid product selected.");
				return;
			}

			if (selectedProduct.stock < this.quantity) {
				alert("Not enough stock available.");
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
			const key = await getCurrentUser();
			this.userKey = key;

			await this.fetchProducts();
			await this.fetchUserPreorders();
		} catch (error) {
			console.error("Error during component initialization:", error);
		}
	},
};
</script>
