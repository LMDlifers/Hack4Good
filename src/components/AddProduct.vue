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
		<button type="submit" class="wmax">Add Product</button>
		</form>
	</div>

	<div class="container">
		<h2>Available Products</h2>
		<div class="search-container">
		<input
			class="search-bar"
			v-model="searchQuery"
			placeholder="Search products by name..."
			type="text"
		/>
		</div>
		<table v-if="filteredProducts.length > 0">
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
			<tr v-for="(product, id) in filteredProducts" :key="id">
			<td>{{ product.name }}</td>
			<td>{{ product.pointsRequired }}</td>
			<td>{{ product.stock }}</td>
			<td>{{ product.hidden ? "Yes" : "No" }}</td>
			<td>
				<button @click="increaseStock(product.id, product.stock)" style="margin-right: 5px;">
				Increase Stock
				</button>
				<button @click="openEditModal(product.id, product)">Edit</button>
			</td>
			</tr>
		</tbody>
		</table>
		<p v-else>No products match your search.</p>
	</div>

	<!-- Edit Modal -->
	<div v-if="showEditModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeEditModal"></div> <!-- Backdrop -->
		<div class="modal">
		<h2>Edit Product</h2>
		<form @submit.prevent="editProduct">
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
			<div>
			<label for="editHidden">Hidden:</label>
			<input
				id="editHidden"
				type="checkbox"
				v-model="editHidden"
			/>
			<span>{{ editHidden ? "Hidden" : "Visible" }}</span>
			</div>
			<button type="submit">Save Changes</button>
			<button type="button" class="btn-grey" @click="closeEditModal">Cancel</button>
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
		showEditModal: false, // Controls the visibility of the edit modal
		editProductId: null, // Stores the ID of the product being edited
		editProductName: "", // Stores the new product name
		editPointsRequired: null, // Stores the new points required
		editHidden: false, // New property for hidden status
    };
  },
  computed: {
    filteredProducts() {
      const query = this.searchQuery.toLowerCase();
      const transformedProducts = Object.entries(this.products).map(([key, value]) => ({
        id: key, // Include the key as `id`
        ...value, // Spread the rest of the product's properties
      }));
      return transformedProducts.filter(
        (product) => product.name && product.name.toLowerCase().includes(query)
      );
    },
  },
  methods: {
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

		// Log the product addition in the audit table
		const auth = getAuth();
		const currentUser = auth.currentUser;
		if (currentUser) {
		await logAuditEntry({
			type: "inventory",
			user: currentUser.uid, // Log the current user's UID
			details: `Added a new product: ${newProduct.name} (Points: ${newProduct.pointsRequired}, Stock: ${newProduct.stock})`,
		});
		}

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
        const message = await updateProductStock(productId, stock + incrementAmount);
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
