<template>
	<div class="container">
		<div class="space-between">
			<h2>Available Products</h2>
			<button @click="openAddProductModal">Add New Product</button>
		</div>
		<!-- Search Input -->
		<div class=" margin-t-s">
			<input
				class="search-bar"
				v-model="searchQuery"
				placeholder="Search products by name..."
				type="text"
			/>
		</div>
	</div>
	
	<div v-if="filteredProducts.length > 0" class="container">
		
		<div>
			<div class="header margin-t-s">
				<div style="width:16.67%">Name</div>
				<div style="width:16.67%">Points Required</div>
				<div style="width:16.67%">Stock</div>
				<div style="width:16.67%">Hidden</div>
				<div style="width:33.33%">Action</div>
			</div>
			<div class="header content"  v-for="(product, id) in paginatedProducts" :key="id">
				
				<div style="width:16.67%">{{ product.name }}</div>
				<div style="width:16.67%">{{ product.pointsRequired }}</div>
				<div style="width:16.67%">{{ product.stock }}</div>
				<div style="width:16.67%">{{ product.hidden ? "Yes" : "No" }}</div>
				<div style="width:33.33%; display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">
					<button class="btn-green" @click="increaseStock(product.id, product.stock)">
						Increase Stock
					</button>
					<button class="btn-grey" @click="openEditModal(product.id, product)">Edit</button>
				</div>
				
			</div>
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
	<div v-else class="container">
		<p>No products match your search.</p>
	</div>
	

	<!-- Add Product Modal -->
	<div v-if="showAddProductModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeAddProductModal"></div>
		<div class="modal">
			<form @submit.prevent="addProduct" class="form-page">
				<h2>Add New Product</h2>
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
				<div class="space-between">
					<button type="submit">Add Product</button>
					<button type="button" class="btn-grey" @click="closeAddProductModal">Cancel</button>
				</div>
			</form>
		</div>
	</div>
	<!-- Edit Product Modal -->
	<div v-if="showEditModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeEditModal"></div>
		<div class="modal">
			<form @submit.prevent="editProduct" class="form-page">
				<h2>Edit Product</h2>
				<div>
					<label for="editProductName">Product Name:</label>
					<input
						id="editProductName"
						v-model="editProductName"
						type="text"
						placeholder="Enter new product name"
						required
					/>
				</div>
				<div>
					<label for="editPointsRequired">Points Required:</label>
					<input
						id="editPointsRequired"
						v-model.number="editPointsRequired"
						type="number"
						placeholder="Enter new points required"
						min="1"
						required
					/>
				</div>
				<div class="checkbox-container">
					<label for="editHidden">Hidden:</label>
					<input
						id="editHidden"
						type="checkbox"
						v-model="editHidden"
					/>
					<span>{{ editHidden ? "Hidden" : "Visible" }}</span>
				</div>
				<div class="space-between">
					<button type="submit">Save Changes</button>
					<button type="button" class="btn-grey" @click="closeEditModal">Cancel</button>
				</div>
			</form>
		</div>
	</div>

</template>


  
<script>
import {
  addProductToDatabase,
  fetchProducts,
  toggleProductVisibility,
  updateProductStock,
  checkIfAdmin,
  logAuditEntry, // Import the audit logging method
  updateProductDetails
} from "@/methods";
import { getAuth } from "firebase/auth";

export default {
  name: "AddProductPage",
  data() {
	return {
		productName: "",
		pointsRequired: null,
		stock: null,
		isAdmin: false,
		products: {},
		searchQuery: "",
		showEditModal: false,
		editProductId: null,
		editProductName: "",
		editPointsRequired: null,
		editHidden: false,
		showAddProductModal: false,
		currentPage: 1, // Current page for pagination
		itemsPerPage: 10, // Number of items per page
	};
	},

	computed: {
	filteredProducts() {
		const query = this.searchQuery.trim().toLowerCase(); // Trim spaces and convert to lowercase
		const transformedProducts = Object.entries(this.products).map(([key, value]) => ({
			id: key,
			...value,
		}));
		return transformedProducts.filter(
			(product) => product.name && product.name.toLowerCase().includes(query)
		);
	},
	paginatedProducts() {
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = this.currentPage * this.itemsPerPage;
		return this.filteredProducts.slice(start, end);
	},
	totalPages() {
		return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
	},
},


  methods: {
		changePage(page) {
			if (page > 0 && page <= this.totalPages) {
			this.currentPage = page;
			}
		},
		openAddProductModal() {
			this.showAddProductModal = true;
		},
		closeAddProductModal() {
			this.showAddProductModal = false;
			this.resetAddProductForm();
		},
		resetAddProductForm() {
			this.productName = "";
			this.pointsRequired = null;
			this.stock = null;
		},
		async addProduct() {
			if (!this.isAdmin) {
				alert("You do not have permission to add products.");
				return;
			}

			const existingProduct = Object.values(this.products).find(
				(product) => product.name.toLowerCase() === this.productName.toLowerCase()
			);
			if (existingProduct) {
				alert("A product with this name already exists.");
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

				const auth = getAuth();
				const currentUser = auth.currentUser;
				if (currentUser) {
					await logAuditEntry({
						type: "inventory",
						user: currentUser.uid,
						details: `Added a new product: ${newProduct.name} (Points: ${newProduct.pointsRequired}, Stock: ${newProduct.stock})`,
					});
				}

				this.closeAddProductModal();
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
	async openEditModal(productId, product) {
      this.editProductId = productId;
      this.editProductName = product.name;
      this.editPointsRequired = product.pointsRequired;
      this.editHidden = product.hidden; // Load current hidden status
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editProductId = null;
      this.editProductName = "";
      this.editPointsRequired = null;
      this.editHidden = false;
    },
    async editProduct() {
      try {
        const updatedProduct = {
          name: this.editProductName,
          pointsRequired: this.editPointsRequired,
          hidden: this.editHidden, // Include updated hidden status
        };

        await updateProductDetails(this.editProductId, updatedProduct);

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          await logAuditEntry({
            type: "inventory",
            user: currentUser.uid,
            details: `Edited product: ${this.editProductName} (Points: ${this.editPointsRequired}, Hidden: ${this.editHidden ? "Yes" : "No"})`,
          });
        }

        alert("Product updated successfully!");
        this.closeEditModal();
        this.fetchProducts();
      } catch (error) {
        alert(error.message);
      }
    },
	async toggleVisibility(productId, product) {
      try {
        const message = await toggleProductVisibility(productId, product.hidden);
        alert(message);

		alert(productId);
		// Log the stock increase in the audit table
        const auth = getAuth();
        const currentUser = auth.currentUser;

		if (currentUser) {
			await logAuditEntry({
				type: "inventory",
				user: currentUser.uid, // Log the current user's UID
				details: `${product.hidden ? "Unhid" : "Hid"} this product: ${this.products[productId].name}`,
			});
		}


        this.fetchProducts(); // Refresh product list
      } catch (error) {
        alert(error.message);
      }
    },
    async increaseStock(productId, stock) {
      const incrementAmount = parseInt(prompt("Enter the amount to increase the stock by:"), 10);

      if (isNaN(incrementAmount) || incrementAmount <= 0) {
        alert("Please enter a valid positive number.");
        return;
      }

      try {
        // Update the product stock
        const message = await updateProductStock(productId, stock, incrementAmount);
        alert(message);

        // Log the stock increase in the audit table
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          await logAuditEntry({
            type: "inventory",
            user: currentUser.uid, // Log the current user's email
            details: `Increased stock for product ${this.products[productId].name} by ${incrementAmount}`,
          });
        }

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
