<template>
	<div class="container scrollable-div">
		<h2>Shopping Cart</h2>
		<div v-if="cartItems.length > 0">
			<div class="header">
				<div class="" style="width: 10%">
					<input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
				</div>
				<div class="left" style="width: 40%">Product</div>
				<div style="width: 15%">Points Required</div>
				<div style="width: 20%">Quantity</div>
				<div style="width: 15%">Total Points</div>
			</div>
			<div class="header content" v-for="item in cartItems" :key="item.id">
				<div style="width: 10%"><input type="checkbox" :value="item.id" v-model="selectedItems" /></div>
				<div class="left" style="width: 40%;">
					<div>{{ item.name }}</div>
					<img
						v-if="item.imageUrl"
						:src="item.imageUrl"
						alt="Product Image"
						class="product-image-s"
					/>
					<p v-else>No Image</p>
				</div>
				<div style="width: 15%;">{{ item.pointsRequired }}</div>
				<div style="width: 20%;">
					<button class="btn-grey btn-round" @click="decreaseQuantity(item)">-</button>
					{{ item.quantity }}
					<button class="btn-grey btn-round" @click="increaseQuantity(item)">+</button>
				</div>
				<div style="width: 15%">{{ item.quantity * item.pointsRequired }}</div>
			</div>
			<div class="checkout-container">
				<div>Total Points for Selected Items: {{ totalPoints }}</div>
				<button @click="handleCheckoutClick">Checkout</button>
			</div>
		</div>
		<p v-else class="margin-t-s">Your cart is empty.</p>

		<!-- Checkout Confirmation Modal -->
		<div v-if="showCheckoutModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeCheckoutModal"></div>
			<div class="modal padding-20">
				<h2>Confirm Checkout</h2>
				<p>Are you sure you want to proceed with the checkout for the selected items?</p>
				<p>Current Balance: {{ userData.voucherPoints }}</p>
				<p>Total Points for Selected Items: {{ totalPoints }}</p>
				<p>After Checkout Balance: {{ userData.voucherPoints - totalPoints }}</p>
				<div class="space-between">
					<button class="btn-grey" @click="closeCheckoutModal">Cancel</button>
					<button @click="confirmCheckout">Confirm</button>
				</div>
			</div>
		</div>

		<!-- Insufficient Stock Modal -->
		<div v-if="showInsufficientStockModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeInsufficientStockModal"></div>
			<div class="modal padding-20 center-vh flex-col">
				<h2>Insufficient Stock</h2>
				<p>The following items have insufficient stock:</p>
				<ul>
					<li v-for="item in insufficientStockItems" :key="item.id">
						{{ item.name }} (Available: {{ item.stock }}, Required: {{ item.quantity }})
					</li>
				</ul>
				<button class="btn-grey" @click="closeInsufficientStockModal">OK</button>
			</div>
		</div>

		<!-- No Items Selected Modal -->
		<div v-if="showNoItemsSelectedModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeNoItemsSelectedModal"></div>
			<div class="modal padding-20 center-vh flex-col">
				<p>You have not selected any items for checkout.</p>
				<button class="btn-grey" @click="closeNoItemsSelectedModal">OK</button>
			</div>
		</div>

		<!-- Confirm Remove Modal -->
		<div v-if="showRemoveModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeRemoveModal"></div>
			<div class="modal padding-20">
				<p>Do you want to remove {{ productToRemove?.name }} from the cart?</p>
				<div class="space-between">
					<button @click="confirmRemoveProduct">Yes</button>
					<button class="btn-grey" @click="closeRemoveModal">No</button>
				</div>
			</div>
		</div>

		<!-- Checkout Successful Modal -->
		<div v-if="showCheckoutSuccessModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeCheckoutSuccessModal"></div>
			<div class="modal padding-20 center-vh flex-col">
				<h2>Checkout Successful</h2>
				<p>Your selected items have been successfully checked out.</p>
				<button class="btn-grey" @click="closeCheckoutSuccessModal">OK</button>
			</div>
		</div>
	</div>
</template>

<script>
import {
	fetchCartData,
	updateCartItemQuantity,
	removeCartItem,
	processCheckout,
} from "@/methods";
import { auth } from "@/firebase";

export default {
	name: "CartPage",
	data() {
		return {
			cartItems: [],
			userData: {},
			showCheckoutModal: false, // Controls checkout confirmation modal visibility
			showInsufficientStockModal: false, // Controls insufficient stock modal visibility
			showNoItemsSelectedModal: false, // Controls "No Items Selected" modal visibility
			showRemoveModal: false, // Controls "Remove Product" modal visibility
			showCheckoutSuccessModal: false, // Controls "Checkout Successful" modal visibility
			productToRemove: null, // Stores the product to remove
			selectedItems: [], // Holds the IDs of selected items
			insufficientStockItems: [], // Holds the items with insufficient stock
		};
	},
	computed: {
		totalPoints() {
			return this.selectedItems.reduce((total, itemId) => {
				const item = this.cartItems.find((cartItem) => cartItem.id === itemId);
				return total + (item ? item.quantity * item.pointsRequired : 0);
			}, 0);
		},
		allSelected() {
			return this.selectedItems.length === this.cartItems.length;
		},
	},
	methods: {
		async fetchCart() {
			const { cartItems, userData } = await fetchCartData();
			this.cartItems = cartItems;
			this.userData = userData;
		},
		async increaseQuantity(item) {
			if (item.quantity < item.stock) {
				await updateCartItemQuantity(auth.currentUser.uid, item.id, item.quantity + 1);
				item.quantity++;
			} else {
				alert(`No more stock available for ${item.name}.`);
			}
		},
		async decreaseQuantity(item) {
			const userId = auth.currentUser.uid;
			if (item.quantity > 1) {
				await updateCartItemQuantity(userId, item.id, item.quantity - 1);
				item.quantity--;
			} else {
				// Prompt to remove product
				this.productToRemove = item;
				this.showRemoveModal = true;
			}
		},
		async confirmRemoveProduct() {
			const userId = auth.currentUser.uid;
			if (this.productToRemove) {
				await removeCartItem(userId, this.productToRemove.id);
				this.cartItems = this.cartItems.filter(
					(cartItem) => cartItem.id !== this.productToRemove.id
				);
				this.selectedItems = this.selectedItems.filter(
					(id) => id !== this.productToRemove.id
				);
				this.productToRemove = null;
			}
			this.closeRemoveModal();
		},
		closeRemoveModal() {
			this.showRemoveModal = false;
			this.productToRemove = null;
		},
		toggleSelectAll() {
			if (this.allSelected) {
				this.selectedItems = [];
			} else {
				this.selectedItems = this.cartItems.map((item) => item.id);
			}
		},
		handleCheckoutClick() {
			if (this.selectedItems.length === 0) {
				this.showNoItemsSelectedModal = true;
			} else {
				this.showCheckoutModal = true;
			}
		},
		closeCheckoutModal() {
			this.showCheckoutModal = false;
		},
		closeNoItemsSelectedModal() {
			this.showNoItemsSelectedModal = false;
		},
		closeInsufficientStockModal() {
			this.showInsufficientStockModal = false;
			this.closeCheckoutModal(); // Close confirm checkout modal if open
		},
		closeCheckoutSuccessModal() {
			this.showCheckoutSuccessModal = false;
		},
		async confirmCheckout() {
			try {
				// Filter items selected for checkout
				const itemsToCheckout = this.cartItems.filter((item) =>
					this.selectedItems.includes(item.id)
				);

				// Collect items with insufficient stock
				this.insufficientStockItems = itemsToCheckout.filter(
					(item) => item.quantity > item.stock
				);

				// If there are any items with insufficient stock, show the modal
				if (this.insufficientStockItems.length > 0) {
					this.showInsufficientStockModal = true;
					return; // Prevent checkout
				}

				// Proceed with checkout if all items have enough stock
				await processCheckout(
					auth.currentUser.uid,
					itemsToCheckout,
					this.totalPoints,
					this.userData.voucherPoints
				);

				// Remove checked-out items from the cart
				this.cartItems = this.cartItems.filter(
					(item) => !this.selectedItems.includes(item.id)
				);
				this.selectedItems = [];
				this.showCheckoutSuccessModal = true; // Show checkout success modal
				this.closeCheckoutModal();
			} catch (error) {
				alert(error.message);
			}
		},
	},
	async mounted() {
		await this.fetchCart();
	},
};
</script>
