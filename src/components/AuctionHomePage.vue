<template>
	<div class="container">
		<div class="space-between">
			<h2>Auction House (Admin)</h2>
			<button @click="manageAuction">Add Auction Item</button>
		</div>
		<div class="margin-t-s">
			<input
				class="search-bar"
				v-model="searchQuery"
				placeholder="Search auctions..."
				type="text"
			/>
		</div>
		<!-- Modal Form -->
		<div v-if="isModalVisible" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeModal"></div>
			<div class="modal">
				<form @submit.prevent="submitAuction" class="form-page">
					<h2>{{ editing ? "Edit Auction Item" : "Add Auction Item" }}</h2>
					<!-- Product Name -->
					<label for="name">Product Name:</label>
					<input
						type="text"
						id="name"
						v-model="newAuction.name"
						required
					/>

					<!-- Auction Time/Date -->
					<label for="time">Auction Time/Date:</label>
					<input
						type="datetime-local"
						id="time"
						v-model="newAuction.time"
						required
					/>

					<!-- Reserve Price -->
					<label for="reservePrice">Reserve Price:</label>
					<input
						type="number"
						id="reservePrice"
						v-model="newAuction.reservePrice"
						required
						min="0"
					/>

					<!-- Product Photo -->
					<label for="photo">Product Photo:</label>
					<input
						type="file"
						id="photo"
						@change="handleFileChange"
					/>

					<!-- Actions -->
					<div class="modal-actions space-between">
						<button class="btn-grey" type="button" @click="closeModal">Cancel</button>
						<button class="btn-green" type="submit">Submit</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Success Modal -->
		<div v-if="showSuccessModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeSuccessModal"></div>
			<div class="modal padding-20 center-vh flex-col">
				<h2>Success</h2>
				<p>{{ successMessage }}</p>
				<button class="btn-grey" @click="closeSuccessModal">OK</button>
			</div>
		</div>

		<!-- Error Modal -->
		<div v-if="showErrorModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeErrorModal"></div>
			<div class="modal padding-20 center-vh flex-col">
				<h2>Error</h2>
				<p>{{ errorMessage }}</p>
				<button class="btn-grey" @click="closeErrorModal">OK</button>
			</div>
		</div>

		<!-- Confirm Delete Modal -->
		<div v-if="showConfirmDeleteModal" class="modal-wrapper">
			<div class="modal-backdrop" @click="closeConfirmDeleteModal"></div>
			<div class="modal padding-20">
				<h2>Confirm Deletion</h2>
				<p>Are you sure you want to delete the auction item <strong>{{ itemToDelete?.name }}</strong>?</p>
				<div class="space-between">
					<button class="btn-grey" @click="closeConfirmDeleteModal">Cancel</button>
					<button class="btn-red" @click="confirmDelete">Delete</button>
				</div>
			</div>
		</div>


		<!-- Auction List Section -->
		<section class="auction-list">
		<div
			v-for="item in filteredItems"
			:key="item.id"
			class="auction-card"
		>
			<div class="auction-image">
			<p v-if="!item.image">No Image Available</p>
			<img v-else :src="item.image" alt="Auction Item" />
			</div>

			<div class="auction-info">
				<h3>{{ item.name || "Unknown" }}</h3>
				<p>Created by {{ item.creator || "Unknown" }}</p>
				<div class="auction-details">
					<p>Starting points: <strong>{{ item.reservePrice || "--" }} points</strong></p>
					<p>Highest bid: <strong>{{ item.currentBid || item.reservePrice }} points</strong></p>
					<p>Highest bidder: <strong>{{ item.highestBidderName || "None" }}</strong> </p>
					<p>Closing Time: <strong>{{ new Date(item.time).toLocaleString() || "Not Set" }}</strong> </p>
					<p>Status: <strong :class="getStatusClass(item.time)"> {{ getStatusText(item.time) }} </strong></p>
				</div>
			</div>
			<div class="space-between margin-t-s">
				<button class="btn-grey" style="width: 40%" @click="editAuction(item)">Edit</button>
				<button class="btn-red" style="width: 40%" @click="promptDeleteAuction(item.id)">Delete</button>
			</div>
			</div>
		</section>
	</div>
</template>

<script>
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
name: "AuctionHomePage",
	data() {
		return {
			searchQuery: "",
			auctionItems: [],
			isModalVisible: false,
			isSubmitting: false,
			editing: false,
			editingId: null,
			showSuccessModal: false,
			showErrorModal: false,
			showConfirmDeleteModal: false, // Confirmation delete modal visibility
			successMessage: "",
			errorMessage: "",
			newAuction: {
				name: "",
				time: "",
				reservePrice: "",
				highestBid: 0,
			},
			itemToDelete: null, // Holds the auction item to delete
		};
	},
	computed: {
		filteredItems() {
		return this.auctionItems.filter((item) =>
			item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
		);
		},
	},
	created() {
		const db = getDatabase();
		const storage = getStorage();
		const auctionsRef = ref(db, "auctions"); // New auctions table path

		onValue(auctionsRef, async (snapshot) => {
			if (snapshot.exists()) {
			const auctions = snapshot.val();
			this.auctionItems = await Promise.all(
				Object.keys(auctions).map(async (key) => {
				const auction = { id: key, ...auctions[key] };

				// Fetch the image URL or fallback to no-image.jpg
				try {
					const imageRef = storageRef(storage, `auction/${key}`);
					auction.image = await getDownloadURL(imageRef);
				} catch (error) {
					console.warn(`No image found for auction ID ${key}, using default image.`, error);
					try {
					const defaultImageRef = storageRef(storage, `no-image.jpg`);
					auction.image = await getDownloadURL(defaultImageRef); // Fallback to default image
					} catch (fallbackError) {
					console.error("Error fetching default no-image.jpg:", fallbackError);
					auction.image = null; // If default image is also unavailable
					}
				}

				return auction;
				})
			);
			} else {
			console.log("No auction items available.");
			this.auctionItems = [];
			}
		});
	},

	methods: {
		showSuccess(message) {
			this.successMessage = message;
			this.showSuccessModal = true;
		},
		showError(message) {
			this.errorMessage = message;
			this.showErrorModal = true;
		},
		closeSuccessModal() {
			this.showSuccessModal = false;
		},
		closeErrorModal() {
			this.showErrorModal = false;
		},
		closeConfirmDeleteModal() {
			this.showConfirmDeleteModal = false;
			this.itemToDelete = null;
		},
		handleFileChange(event) {
			this.auctionImageFile = event.target.files[0]; // Store the selected file
			console.log("Selected file:", this.auctionImageFile);
		},
		async uploadImageToFirebase(auctionId) {
			if (!this.auctionImageFile) return null; // Return if no file is selected

			try {
				const storage = getStorage(); // Initialize Firebase Storage
				const imageRef = storageRef(storage, `auction/${auctionId}`); // Create a reference in the /auction directory
				await uploadBytes(imageRef, this.auctionImageFile); // Upload the image
				const downloadUrl = await getDownloadURL(imageRef); // Get the image's download URL
				return downloadUrl; // Return the URL
			} catch (error) {
				console.error("Error uploading image:", error);
				alert("Failed to upload image. Please try again.");
				return null; // Return null if upload fails
			}
		},

		// Show the modal when the "Add Auction Item" button is clicked
		manageAuction() {
			this.isModalVisible = true;
		},

		// Close the modal
		closeModal() {
			this.isModalVisible = false;
			this.editing = false;
			this.editingId = null;
			this.newAuction = {
				name: "",
				time: "",
				reservePrice: "",
				highestBid: 0,
			};
		},


		// Submit the new or updated auction item to Firebase
		async submitAuction() {
			if (this.isSubmitting) return;

			if (this.newAuction.name && this.newAuction.time && this.newAuction.reservePrice) {
				this.isSubmitting = true;
				try {
					const db = getDatabase();
					if (this.editing) {
						const auctionRef = ref(db, `auctions/${this.editingId}`);
						const imageUrl = await this.uploadImageToFirebase(this.editingId);
						await set(auctionRef, {
							...this.newAuction,
							imageUrl: imageUrl || this.newAuction.imageUrl,
							creator: "Admin",
						});
						this.showSuccess("Auction updated successfully!");
					} else {
						const newAuctionRef = push(ref(db, "auctions"));
						const auctionId = newAuctionRef.key;
						const imageUrl = await this.uploadImageToFirebase(auctionId);
						await set(newAuctionRef, {
							...this.newAuction,
							imageUrl: imageUrl || null,
							creator: "Admin",
						});
						this.showSuccess("Auction item added successfully!");
					}
					this.closeModal();
				} catch (error) {
					this.showError("An error occurred while submitting the auction. Please try again.");
				} finally {
					this.isSubmitting = false;
				}
			} else {
				this.showError("Please fill out all fields.");
			}
		},

		// Edit an auction
		editAuction(item) {
			this.newAuction = { ...item };
			this.editing = true;
			this.editingId = item.id;
			this.isModalVisible = true;
		},


		// Delete an auction
		async deleteAuction(auctionId) {
			const db = getDatabase();
			try {
				await remove(ref(db, `auctions/${auctionId}`));
				this.showSuccess("Auction item deleted successfully!");
			} catch (error) {
				this.showError("An error occurred while deleting the auction. Please try again.");
			}
		},
		promptDeleteAuction(item) {
			this.itemToDelete = item;
			this.showConfirmDeleteModal = true;
		},
		confirmDelete() {
			if (this.itemToDelete) {
				this.deleteAuction(this.itemToDelete.id);
				this.closeConfirmDeleteModal();
			}
		},

		// Determine auction status based on time
		getStatusText(auctionTime) {
			if (!auctionTime) return "Not Set";

			const now = new Date();
			const auctionDate = new Date(auctionTime);
			return auctionDate > now ? "Open" : "Closed";
		},

		getStatusClass(auctionTime) {
			if (!auctionTime) return "status-unknown";

			const now = new Date();
			const auctionDate = new Date(auctionTime);
			return auctionDate > now ? "status-open" : "status-closed";
		},
	},
};
</script>
