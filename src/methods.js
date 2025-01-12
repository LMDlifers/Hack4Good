// methods.js
import { getDatabase, ref, get, push, update, remove} from "firebase/database";
import { signInWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { auth } from "@/firebase";

export async function loginUser(email, password, context, router) {
	const auth = getAuth();
	try {
		// Step 1: Authenticate the user
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		console.log("Login successful!", user);

		// Step 2: Fetch user data from Firebase Realtime Database
		const db = getDatabase();
		const userRef = ref(db, `users/${user.uid}`);
		const snapshot = await get(userRef);

		if (snapshot.exists()) {
		const userData = snapshot.val();
		console.log("Fetched user data:", userData);

		// Step 3: Check if the user is suspended
		if (userData.suspended) {
			console.error("User account is suspended:", userData);

			// Log out the suspended user immediately
			await signOut(auth);

			// Reset session state
			context.isLoggedIn = false;
			context.role = "";

			throw new Error("Your account has been suspended. Please contact support.");
		}

		// Step 4: Update session state with user role
		context.isLoggedIn = true;
		context.role = userData.role;

		// Step 5: Redirect based on role
		if (userData.role === "admin") {
			router.push({ name: "AdminPanel" }); // Redirect to admin panel
		} else if (userData.role === "user") {
			router.push({ name: "Dashboard" }); // Redirect to user dashboard
		} else {
			console.error("Unknown user role:", userData.role);
			throw new Error("Invalid role. Please contact support.");
		}
		} else {
		console.error("User data not found in the database.");
		throw new Error("User data not found. Please contact support.");
		}
	} catch (error) {
		console.error("Error during login:", error);

		// Reset session state on error
		context.isLoggedIn = false;
		context.role = "";

		throw new Error(error.message); // Re-throw error for UI handling
	}
}
export async function getCurrentUser() {
	const auth = getAuth();
	const user = auth.currentUser;
	if (!user) {
		console.error("No user is logged in.");
		return null;
	}
	return user.uid;
}

export async function getCurrentUserData() {
	const userKey = await getCurrentUser();
	const db = getDatabase();
	const userRef = ref(db, `users/${userKey}`);
  
	try {
		const snapshot = await get(userRef);
		if (snapshot.exists()) {
			return snapshot.val();
		} else {
			throw new Error("No data available for the user.");
		}
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw new Error("An error occurred while fetching user data.");
	}
}

// Function to log out the user
export async function logout(router, context) {
	const auth = getAuth();
	try {
		await signOut(auth);
		console.log("User logged out.");
		context.isLoggedIn = false;
		context.role = ""; // Reset role
		router.push({ name: "Login" }); // Redirect to login page
	} catch (error) {
		console.error("Error logging out:", error);
		throw error;
	}
}

// Function to fetch the user's role from Firebase
export async function fetchUserRole(uid, context) {
	const db = getDatabase();
	const userRef = ref(db, `users/${uid}`);

	try {
		const snapshot = await get(userRef);

		if (snapshot.exists()) {
		const userData = snapshot.val();
		console.log("Fetched user data:", userData);

		// Check if the user is suspended
		if (userData.suspended) {
			if (!context.suspensionChecked) { // Check if suspension handling is already done
			console.error("User account is suspended:", userData);
			context.suspensionChecked = true; // Set the flag to prevent duplicate alerts

			const auth = getAuth();
			await signOut(auth); // Log the user out

			context.isLoggedIn = false;
			context.role = ""; // Reset the session role
			throw new Error("Your account has been suspended. Please contact support.");
			}
		} else {
			context.suspensionChecked = false; // Reset flag if the user is not suspended
			context.role = userData.role; // Set the role in the Vue instance
		}
		} else {
		console.error("No data found for this user.");
		context.role = ""; // Reset the role
		}
	} catch (error) {
		console.error("Error fetching user role:", error);
		context.isLoggedIn = false;
		context.role = ""; // Ensure session role is reset on error
		throw error;
	}
}
  

export async function fetchUsers() {
	const db = getDatabase();
	const usersRef = ref(db, "users");
  
	try {
		const snapshot = await get(usersRef);
		if (snapshot.exists()) {
			return snapshot.val(); // Return users as an object
		} else {
			console.log("No users found.");
		return {};
		}
	} catch (error) {
		console.error("Error fetching users:", error);
		throw new Error("Error fetching users. Please try again.");
	}
}

export async function addUser(newUser) {
	const db = getDatabase();
	const usersRef = ref(db, "users");
  
	try {
		await push(usersRef, newUser);
		console.log("User added successfully!");
	} catch (error) {
		console.error("Error adding user:", error);
		throw new Error("Error adding user.");
	}
}
  
  // Delete a user by ID
export async function deleteUser(userId) {
	const db = getDatabase();
	const userRef = ref(db, `users/${userId}`);
  
	try {
		await remove(userRef);
		console.log("User deleted successfully!");
	} catch (error) {
		console.error("Error deleting user:", error);
		throw new Error("Error deleting user.");
	}
}

export async function fetchProducts() {
	const db = getDatabase();
	const productsRef = ref(db, "products");

	try {
		const snapshot = await get(productsRef);
		if (snapshot.exists()) {
			return snapshot.val(); // Return the products
		} else {
			console.log("No products found.");
			return {};
		}
	} catch (error) {
		console.error("Error fetching products:", error);
		throw new Error("There was an error fetching the products. Please try again.");
	}
}

export async function fetchPreorders() {
	const db = getDatabase();
	const preordersRef = ref(db, "preorders");

	try {
		const snapshot = await get(preordersRef);
		if (snapshot.exists()) {
			const preorders = Object.entries(snapshot.val()).map(([key, preorder]) => ({
				id: key,
				...preorder,
			}));

			// Fetch usernames for each preorder
			const usersRef = ref(db, "users");
			const usersSnapshot = await get(usersRef);
			const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

			// Map preordererId to username
			return preorders.map((preorder) => ({
				...preorder,
				username: users[preorder.preordererId]?.username || "Unknown User",
			}));
		} else {
			return []; // No preorders found
		}
	} catch (error) {
		console.error("Error fetching preorders:", error);
		throw new Error("There was an error fetching the preorders. Please try again.");
	}
}

export async function fetchUserPreorders() {
	const key = await getCurrentUser();
	try {
		// Fetch all preorders
		const allPreorders = await fetchPreorders();
		// Filter preorders by userId
		const userPreorders = allPreorders.filter(
		(preorder) => preorder.preordererId === key
		);

		return userPreorders; // Return only preorders for this user
	} catch (error) {
		console.error("Error fetching user preorders:", error);
		throw new Error("There was an error fetching the user's preorders. Please try again.");
	}
}

export async function preorderProduct(userKey, selectedProduct, selectedProductId, quantity) {
	const db = getDatabase();
	const preordersRef = ref(db, "preorders");

	if (!userKey) {
		throw new Error("No user is logged in.");
	}

	const preorder = {
		preordererId: userKey,
		productName: selectedProduct.name,
		productId: selectedProductId,
		quantity: quantity,
		status: "Pending",
		timestamp: new Date().toISOString(),
	};
	try {
		await push(preordersRef, preorder);
		return `Preorder for "${selectedProduct.name}" has been submitted.`;
	} catch (error) {
		console.error("Error submitting preorder:", error);
		throw new Error("There was an error submitting your preorder. Please try again.");
	}
}


export async function addProductToDatabase(product) {
	const db = getDatabase();
	const productsRef = ref(db, "products");
  
	try {
		await push(productsRef, product);
		return `Product "${product.name}" has been added successfully.`;
	} catch (error) {
		console.error("Error adding product:", error);
		throw new Error("An error occurred while adding the product. Please try again.");
	}
}
  
  // Toggle product visibility
export async function toggleProductVisibility(productId, hidden) {
	const db = getDatabase();
	const productRef = ref(db, `products/${productId}`);
  
	try {
		await update(productRef, { hidden: !hidden });
		return `Product visibility updated.`;
	} catch (error) {
		console.error("Error updating product visibility:", error);
		throw new Error("An error occurred while updating product visibility. Please try again.");
	}
}
  
export async function suspendUser(userId, suspended) {
	const db = getDatabase();
	const productRef = ref(db, `users/${userId}`);
  
	try {
		await update(productRef, { suspended: !suspended });
		if (suspended) {
			return `User has been unsuspended.`;
		}
		return `User has been suspended.`;
	} catch (error) {
		console.error("Error suspending user", error);
		throw new Error("An error occurred while suspending user. Please try again.");
	}
}
  

  
// Check if the current user is an admin
export async function checkIfAdmin() {
	const userKey = await getCurrentUser();
  
	if (!userKey) {
		throw new Error("You are not logged in.");
	}
  
	const db = getDatabase();
	const userRef = ref(db, `users/${userKey}`);
  
	try {
		const snapshot = await get(userRef);
		if (snapshot.exists()) {
			const userData = snapshot.val();
			return userData.role === "admin"; // Return true if the user is an admin
		} else {
			throw new Error("User data not found.");
		}
	} catch (error) {
		console.error("Error verifying admin:", error);
		throw new Error("An error occurred while verifying admin status. Please try again.");
	}
}

  export async function redeemProduct(productKey, product, userKey, userData) {
	const db = getDatabase();
  
	// Check if the user has enough points
	if (userData.voucherPoints < product.pointsRequired) {
		throw new Error("You do not have enough points to redeem this product.");
	}
  
	// Check if the product is in stock
	if (product.stock <= 0) {
		throw new Error("This product is out of stock.");
	}
  
	// Deduct points and reduce stock
	userData.voucherPoints -= product.pointsRequired;
	product.stock -= 1;
  
	// Prepare updates for Firebase
	const updates = {
		[`/users/${userKey}/voucherPoints`]: userData.voucherPoints,
		[`/products/${productKey}/stock`]: product.stock,
	};
  
	try {
		// Update user points and product stock
		await update(ref(db), updates);
	
		// Add transaction history
		const transactionRef = ref(db, `users/${userKey}/transactions`);
		await push(transactionRef, {
			type: "Purchased " + product.name,
			points: -product.pointsRequired,
			timestamp: new Date().toISOString(),
		});
  
		return `Successfully redeemed ${product.name}!`;
	} catch (error) {
		console.error("Error redeeming product:", error);
		throw new Error("An error occurred while processing your request.");
	}
}
  
  // Add a product to the cart
export async function addToCart(productId, product, userKey) {
	const db = getDatabase();
	const cartRef = ref(db, `users/${userKey}/cart/${productId}`);
  
	try {
		// Fetch existing cart item
		const snapshot = await get(cartRef);
		if (snapshot.exists()) {
			const currentCartItem = snapshot.val();
  
			// Check if stock is sufficient
			if (currentCartItem.quantity < product.stock) {
				const updatedQuantity = currentCartItem.quantity + 1;
				await update(cartRef, { quantity: updatedQuantity });
				return `Added another ${product.name} to your cart.`;
			} else {
				throw new Error(`No more stock available for ${product.name}.`);
			}
		} else {
			// Add new item to the cart
			await update(cartRef, { quantity: 1 });
			return `${product.name} has been added to your cart.`;
		}
	} catch (error) {
		console.error("Error adding product to cart:", error);
		throw new Error("An error occurred while adding the product to your cart.");
	}
}
  
export async function fetchTransactions() {
	const userKey = await getCurrentUser();
	if (!userKey) {
		throw new Error("User is not logged in.");
	}
  
	const db = getDatabase();
	const transactionsRef = ref(db, `users/${userKey}/transactions`);
  
	try {
		const snapshot = await get(transactionsRef);
		if (snapshot.exists()) {
			// Convert transactions from Firebase into an array
			return Object.entries(snapshot.val()).map(([key, value]) => ({
				id: key,
				...value,
			}));
		} else {
			console.log("No transactions found.");
			return [];
		}	
	} catch (error) {
		console.error("Error fetching transactions:", error);
		throw new Error("Error fetching transactions. Please try again later.");
	}
}
  
// Format timestamp into a human-readable format
export function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	return date.toLocaleString();
}

export async function fetchCartData() {
	const user = auth.currentUser;
	if (!user) {
		console.error("No user is logged in.");
		return { cartItems: [], userData: {} };
	}
	const db = getDatabase();
	const cartRef = ref(db, `users/${user.uid}/cart`);
	const productsRef = ref(db, "products");
	const userRef = ref(db, `users/${user.uid}`);
  
	try {
		const [cartSnapshot, productsSnapshot, userSnapshot] = await Promise.all([
			get(cartRef),
			get(productsRef),
			get(userRef),
		]);
  
		const cartItems = cartSnapshot.exists() && productsSnapshot.exists()
			? Object.entries(cartSnapshot.val()).map(([productId, cartData]) => ({
				id: productId,
				...productsSnapshot.val()[productId],
				quantity: cartData.quantity,
			}))
			: [];
  
		const userData = userSnapshot.exists() ? userSnapshot.val() : {};
		return { cartItems, userData };
	} catch (error) {
		console.error("Error fetching cart items:", error);
		return { cartItems: [], userData: {} };
	}
}
  
export async function updateCartItemQuantity(userId, itemId, newQuantity) {
	const db = getDatabase();
	const cartRef = ref(db, `users/${userId}/cart/${itemId}`);
	await update(cartRef, { quantity: newQuantity });
}
  
export async function removeCartItem(userId, itemId) {
	const db = getDatabase();
	const cartRef = ref(db, `users/${userId}/cart/${itemId}`);
	await remove(cartRef);
}
  
export async function processCheckout(userId, cartItems, totalPoints, userPoints) {
	if (userPoints < totalPoints) {
		throw new Error("Insufficient points for checkout.");
	}
	const db = getDatabase();
	const userRef = ref(db, `users/${userId}`);
	const cartRef = ref(db, `users/${userId}/cart`);
	const transactionsRef = ref(db, `users/${userId}/transactions`);
  
	await update(userRef, { voucherPoints: userPoints - totalPoints });
  
	const transactionPromises = cartItems.map(async (item) => {
		await push(transactionsRef, {
			productId: item.id,
			productName: item.name,
			quantity: item.quantity,
			totalPoints: item.quantity * item.pointsRequired,
			timestamp: new Date().toISOString(),
		});
  
		const productRef = ref(db, `products/${item.id}`);
		await update(productRef, { stock: item.stock - item.quantity });
	});
	await Promise.all(transactionPromises);
	await remove(cartRef);
}

export async function fetchAllPreorders() {
	const db = getDatabase();
	const preordersRef = ref(db, "preorders");
	const usersRef = ref(db, "users");

	try {
		// Fetch all preorders
		const snapshot = await get(preordersRef);
		if (snapshot.exists()) {
			const preorders = snapshot.val();

			// Fetch all users (to map user IDs to names)
			const userSnapshot = await get(usersRef);
			const users = userSnapshot.exists() ? userSnapshot.val() : {};

			// Map preorders to include the username
			return Object.entries(preorders).map(([id, preorder]) => ({
			id, // Preorder ID
			username: users[preorder.preordererId]?.username || "Unknown User", // Fetch the username
			...preorder, // Include other preorder details
			}));
		} else {
			return [];
		}
	} catch (error) {
	throw new Error("Failed to fetch preorders: " + error.message);
	}
}

// Update preorder status in Firebase
export async function updatePreorderStatus(preorderId, newStatus) {
	const db = getDatabase();
	const preorderRef = ref(db, `preorders/${preorderId}`);

	try {
	await update(preorderRef, { status: newStatus });
	} catch (error) {
	throw new Error("Failed to update preorder status: " + error.message);
	}
}

export async function updateProductStock(productId, stock, incrementAmount) {
	const db = getDatabase();
	const productRef = ref(db, `products/${productId}`);

	try {
		// Update the stock in Firebase
		await update(productRef, {
		stock: stock + incrementAmount, // Increment stock
		});

		return `Stock increased by ${incrementAmount}.`;
	} catch (error) {
		throw new Error("Failed to update stock: " + error.message);
	}
}

export async function deductProductStock(productId, quantity) {
	const db = getDatabase();
	const productRef = ref(db, `products/${productId}`);
  
	try {
		// Fetch current stock
		const snapshot = await get(productRef);
		if (!snapshot.exists()) {
		throw new Error("Product not found.");
		}

		const product = snapshot.val();

		// Check if stock is sufficient
		if (product.stock < quantity) {
		throw new Error(
			`Insufficient stock for product "${product.name}". Available stock: ${product.stock}`
		);
		}

		// Deduct stock
		await update(productRef, { stock: product.stock - quantity });
	} catch (error) {
		throw new Error("Failed to deduct product stock: " + error.message);
	}
}

export async function updateProductDetails(productId, updatedProduct) {
	const db = getDatabase();
	const productRef = ref(db, `products/${productId}`);
  
	try {
		await update(productRef, updatedProduct);
	} catch (error) {
		throw new Error("Failed to update product details: " + error.message);
	}
}

export async function logAuditEntry(auditDetails) {
	const db = getDatabase();
	const auditRef = ref(db, "audit");

	try {
		await push(auditRef, {
		...auditDetails,
		timestamp: new Date().toISOString(), // Add a timestamp
		});
	} catch (error) {
		throw new Error("Failed to log audit entry: " + error.message);
	}
}

export async function fetchAuditLogs() {
	const db = getDatabase();
	const auditRef = ref(db, "audit");
	const usersRef = ref(db, "users");

	try {
		// Fetch audit logs
		const auditSnapshot = await get(auditRef);
		if (!auditSnapshot.exists()) {
		return [];
		}

		const audits = auditSnapshot.val();

		// Fetch user data
		const usersSnapshot = await get(usersRef);
		const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

		// Map audit logs to include user names
		return Object.entries(audits).map(([id, audit]) => {
		const userName = users[audit.user]?.username || "Unknown User"; // Get user's name or fallback
		return {
			id,
			...audit,
			user: userName, // Replace UID with user's name
		};
		});
	} catch (error) {
		throw new Error("Failed to fetch audit logs: " + error.message);
	}
}