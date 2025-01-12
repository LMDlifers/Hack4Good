<template>
	<div class="container bg-lightgrey">
		<h2>Shopping Cart</h2>
		<div v-if="cartItems.length > 0">
			<div class="align-items-center bg-white container-row h100 w1200 margin-t-s center-vh">
				<div class="center-vh w100">
					<input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
				</div>
				<div class="w500 margin-l-s center-v">Product</div>
				<div class="center-vh w200">Points Required</div>
				<div class="center-vh w200">Quantity</div>
				<div class="center-vh w200">Total Points</div>
			</div>
			<div class="align-items-center bg-white h150 w1200 margin-t-s" v-for="item in cartItems" :key="item.id">
				<div class="center-vh w100"><input type="checkbox" :value="item.id" v-model="selectedItems"/></div>
				<div class="w500 margin-l-s">{{ item.name }}</div>
				<div class="center-vh w200">{{ item.pointsRequired }}</div>
				<div class="center-vh w200">
					<button class="btn-grey btn-round" @click="decreaseQuantity(item)">-</button>
						{{ item.quantity }}
					<button class="btn-grey btn-round" @click="increaseQuantity(item)">+</button>
				</div>
				<div class="center-vh w200">{{ item.quantity * item.pointsRequired }}</div>
			</div>
			<div class="checkout-container h100 w1200 bg-white margin-t-s padding-20">
				<p>Total Points for Selected Items: {{ totalPoints }}</p>
				<button @click="handleCheckoutClick">Checkout</button>
			</div>
		</div>
		<p v-else>Your cart is empty.</p>
		

		<!-- Checkout Confirmation Modal -->
		<div v-if="showCheckoutModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeCheckoutModal"></div>
			<div class="modal">
				<h2>Confirm Checkout</h2>
				<p>Are you sure you want to proceed with the checkout for the selected items?</p>
				<p>Total Points: {{ totalPoints }}</p>
				<button class="whalf" @click="confirmCheckout">Confirm</button>
				<button class="whalf btn-grey" @click="closeCheckoutModal">Cancel</button>
			</div>
		</div>

		<!-- No Items Selected Modal -->
		<div v-if="showNoItemsSelectedModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeNoItemsSelectedModal"></div>
			<div class="modal">
				<p>You have not selected any items for checkout</p>
				<button class="btn-grey wmax" @click="closeNoItemsSelectedModal">OK</button>
			</div>
		</div>

		<!-- Confirm Remove Modal -->
		<div v-if="showRemoveModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeRemoveModal"></div>
			<div class="modal">
				<p>Do you want to remove {{ productToRemove?.name }} from the cart?</p>
				<button class="whalf" @click="confirmRemoveProduct">Yes</button>
				<button class="whalf btn-grey" @click="closeRemoveModal">No</button>
			</div>
		</div>
	</div>
</template>

<script>
import { fetchCartData, updateCartItemQuantity, removeCartItem, processCheckout } from "@/methods";
import { auth } from "@/firebase";

export default {
	name: "CartPage",
	data() {
		return {
			cartItems: [],
			userData: {},
			showCheckoutModal: false, // Controls checkout confirmation modal visibility
			showNoItemsSelectedModal: false, // Controls "No Items Selected" modal visibility
			showRemoveModal: false, // Controls "Remove Product" modal visibility
			productToRemove: null, // Stores the product to remove
			selectedItems: [], // Holds the IDs of selected items
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
				this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== this.productToRemove.id);
				this.selectedItems = this.selectedItems.filter((id) => id !== this.productToRemove.id);
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
				this.showNoItemsSelectedModal = true; // Show the "No Items Selected" modal
			} else {
				this.showCheckoutModal = true; // Show the checkout confirmation modal
			}
		},
		closeCheckoutModal() {
			this.showCheckoutModal = false;
		},
		closeNoItemsSelectedModal() {
			this.showNoItemsSelectedModal = false;
		},
		async confirmCheckout() {
			try {
				const itemsToCheckout = this.cartItems.filter((item) =>
					this.selectedItems.includes(item.id)
				);
				await processCheckout(auth.currentUser.uid, itemsToCheckout, this.totalPoints, this.userData.voucherPoints);
				this.cartItems = this.cartItems.filter((item) => !this.selectedItems.includes(item.id));
				this.selectedItems = [];
				alert("Checkout successful!");
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
