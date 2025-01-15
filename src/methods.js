// methods.js
import { getDatabase, ref, get, set, push, update, remove, query, orderByChild, startAt, endAt} from "firebase/database";
import { signInWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { auth, storage} from "@/firebase";
import { ref as storageRef, getDownloadURL } from "firebase/storage";

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
		console.log(snapshot);
		console.log(snapshot.exists());
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
	const productsRef = ref(db, "products"); // Realtime Database path for products

	try {
		const snapshot = await get(productsRef);

		if (snapshot.exists()) {
			const products = snapshot.val();
			const productsWithImages = await Promise.all(
				Object.entries(products).map(async ([id, product]) => {
					try {
						// Attempt to fetch the image URL from Firebase Storage
						const imageRef = storageRef(storage, `products/${id}`);
						const imageUrl = await getDownloadURL(imageRef);
						return { id, ...product, imageUrl }; // Attach the image URL to the product
					} catch (error) {
						console.warn(`No image found for product ${id}, using default image:`, error);
						// Use default image URL
						const defaultImageRef = storageRef(storage, `no-image.jpg`);
						const defaultImageUrl = await getDownloadURL(defaultImageRef);
						return { id, ...product, imageUrl: defaultImageUrl }; // Attach default image URL
					}
				})
			);

			console.log("Products with images fetched successfully:", productsWithImages);
			return productsWithImages; // Return an array of products with their details and images
		} else {
			console.log("No products found in the database.");
			return [];
		}
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

export async function fetchProduct(productId) {
	const db = getDatabase(); // Initialize Realtime Database
	const productRef = ref(db, `products/${productId}`); // Path to the specific product in the database

	try {
		// Fetch product details
		const snapshot = await get(productRef);
		if (!snapshot.exists()) {
			console.warn(`No product found with ID: ${productId}`);
			return { productName: "Unknown Product", pointsRequired: 0, stock: 0, imageUrl: await getDefaultImageUrl() };
		}

		const productDetails = snapshot.val(); // Get product details

		// Fetch product image URL from Firebase Storage
		const imageRef = storageRef(storage, `products/${productId}`);
		let imageUrl;
		try {
			imageUrl = await getDownloadURL(imageRef);
		} catch (error) {
			console.warn(`No image found for product ${productId}, using default image.`);
			imageUrl = await getDefaultImageUrl(); // Use default image URL
		}

		return { ...productDetails, imageUrl }; // Combine product details and image URL
	} catch (error) {
		alert(error.message);
		console.error(`Error fetching product details for ${productId}:`, error);
		throw new Error(`Unable to fetch product details and image. Please try again.`);
	}
}

// Function to fetch the default image URL
async function getDefaultImageUrl() {
	try {
		const defaultImageRef = storageRef(storage, `no-image.jpg`);
		return await getDownloadURL(defaultImageRef);
	} catch (error) {
		console.error("Error fetching default image:", error);
		return null; // Return null if default image cannot be fetched
	}
}


export async function fetchPreorders() {
    const db = getDatabase();
    const preordersRef = ref(db, "preorders");

    try {
        const snapshot = await get(preordersRef);

        if (snapshot.exists()) {
            const allPreorders = [];

            // Loop through users' preorders
            Object.entries(snapshot.val()).forEach(([userId, userPreorders]) => {
                Object.entries(userPreorders).forEach(([preorderId, preorder]) => {
                    allPreorders.push({
                        preorderId,
                        preordererId: userId,
                        ...preorder,
                    });
                });
            });

            // Fetch usernames for each preorder
            const usersRef = ref(db, "users");
            const usersSnapshot = await get(usersRef);
            const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

            // Fetch product details and images for each preorder
            const preordersWithDetails = await Promise.all(
                allPreorders.map(async (preorder) => {
                    try {
                        // Fetch product details including the image
                        const productDetails = await fetchProduct(preorder.productId);

                        // Combine preorder with product details and username
                        return {
                            ...preorder,
                            ...productDetails,
                            username: users[preorder.preordererId]?.username || "Unknown User",
                        };
                    } catch (error) {
                        console.warn(
                            `Error fetching product details for preorder ${preorder.productId}:`,
                            error
                        );
                        return {
                            ...preorder,
                            username: users[preorder.preordererId]?.username || "Unknown User",
                            productName: "Unknown Product",
                            imageUrl: null,
                        };
                    }
                })
            );

            return preordersWithDetails;
        } else {
            return []; // No preorders found
        }
    } catch (error) {
        console.error("Error fetching preorders:", error);
        throw new Error("There was an error fetching the preorders. Please try again.");
    }
}

export async function fetchUserPreorders() {
    try {
        // Get the current user's key (ID)
        const key = await getCurrentUser();
        if (!key) throw new Error("User not logged in.");

        const db = getDatabase();
        const userPreordersRef = ref(db, `preorders/${key}`);

        const snapshot = await get(userPreordersRef);

        if (!snapshot.exists()) {
            return []; // No preorders for the user
        }

        const userPreorders = Object.entries(snapshot.val()).map(([preorderId, preorder]) => ({
            preorderId,
            ...preorder,
        }));

        // Fetch product details for each preorder
        const preordersWithDetails = await Promise.all(
            userPreorders.map(async (preorder) => {
                try {
                    const productDetails = await fetchProduct(preorder.productId);

                    return {
                        ...preorder,
                        productName: productDetails?.name || "Unknown Product",
                        imageUrl: productDetails?.imageUrl || null,
                        pointsRequired: productDetails?.pointsRequired || 0,
                    };
                } catch (error) {
                    console.warn(
                        `Error fetching product details for preorder ID: ${preorder.productId}`,
                        error
                    );
                    return {
                        ...preorder,
                        productName: "Unknown Product",
                        imageUrl: null,
                        pointsRequired: 0,
                    };
                }
            })
        );

        return preordersWithDetails;
    } catch (error) {
        console.error("Error fetching user preorders:", error);
        throw new Error("Failed to fetch preorders. Please try again later.");
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
			} else if (currentCartItem.quantity >= product.stock) {
				return `There amount you are trying to add to your cart exceeds the stock we currently have`;
				// throw new Error(`No more stock available for ${product.name}.`);
			}
		} else {
			// Add new item to the cart
			await update(cartRef, { quantity: 1 });
			return `${product.name} has been added to your cart.`;
		}
	} catch (error) {
		alert(error.message);
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
	const userRef = ref(db, `users/${user.uid}`);

	try {
		// Fetch cart and user data
		const [cartSnapshot, userSnapshot] = await Promise.all([
			get(cartRef),
			get(userRef),
		]);

		// Check if cart exists
		const cartItems =
			cartSnapshot.exists()
				? Object.entries(cartSnapshot.val()).map(([productId, cartData]) => ({
					id: productId,
					quantity: cartData.quantity,
				}))
				: [];

		// Fetch product details for each item in the cart
		const cartItemsWithDetails = await Promise.all(
			cartItems.map(async (item) => {
				try {
					// Fetch product details including the image
					const productDetails = await fetchProduct(item.id);
					// Combine cart item with product details
					return { ...item, ...productDetails };
				} catch (error) {
					console.warn(
						`Error fetching product details for cart item ${item.id}:`,
						error
					);
					return { ...item, productName: "Unknown Product", imageUrl: null };
				}
			})
		);

		// Get user data if available
		const userData = userSnapshot.exists() ? userSnapshot.val() : {};

		return { cartItems: cartItemsWithDetails, userData };
	} catch (error) {
		console.error("Error fetching cart data:", error);
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
			type: "Product",
			productId: item.id,
			details: "Purchased product '" + item.name + "'",
			quantity: item.quantity,
			totalPoints: -item.quantity * item.pointsRequired,
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
export async function updatePreorderStatus(preorder, newStatus) {
	const db = getDatabase();
	const preorderRef = ref(db, `preorders/${preorder.preordererId}/${preorder.preorderId}`);

	try {
	await update(preorderRef, { status: newStatus });
	} catch (error) {
	throw new Error("Failed to update preorder status: " + error.message);
	}
}

export async function updateProductStock(productId, currStock, incrementAmount) {
	const db = getDatabase();
	const productRef = ref(db, `products/${productId}`);

	try {
		// Update the stock in Firebase
		await update(productRef, {
		stock: currStock + incrementAmount, // Increment stock
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


export async function fetchRequests() {
    const db = getDatabase();
    const requestsRef = ref(db, "requests");

    try {
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            const requests = Object.entries(snapshot.val()).map(([key, request]) => ({
                id: key,
                ...request,
            }));

            // Fetch usernames for each request
            const usersRef = ref(db, "users");
            const usersSnapshot = await get(usersRef);
            const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

            // Map requestorId to username
            return requests.map((request) => ({
                ...request,
                username: users[request.requestorId]?.username || "Unknown User",
            }));
        } else {
            return []; // No requests found
        }
    } catch (error) {
        console.error("Error fetching requests:", error);
        throw new Error("There was an error fetching the requests. Please try again.");
    }
}

export async function fetchUserRequests() {
    const key = await getCurrentUser();
    try {
        // Fetch all requests
        const allRequests = await fetchRequests();
        // Filter requests by userId
        const userRequests = allRequests.filter(
            (request) => request.requestorId === key
        );

        return userRequests; // Return only requests for this user
    } catch (error) {
        console.error("Error fetching user requests:", error);
        throw new Error("There was an error fetching the user's requests. Please try again.");
    }
}

export async function submitProductRequest(request) {
    const db = getDatabase();
    const requestRef = ref(db, "requests/");
    const newRequestRef = push(requestRef);

    await set(newRequestRef, {
        ...request,
        status: "Pending",
        timestamp: Date.now(), // Add a timestamp for the request
    });

    return "Request submitted successfully.";
}

export async function updateRequestStatus(requestId, status) {
	const db = getDatabase();
	const requestRef = ref(db, `requests/${requestId}/status`);

	try {
		await set(requestRef, status);
	} catch (error) {
		console.error("Error updating request status:", error);
		throw new Error("There was an error updating the request status. Please try again.");
	}
}

export async function fetchVoucherTasks() {
    const db = getDatabase();
    const voucherTasksRef = ref(db, "voucherTasks");
    const usersRef = ref(db, "users");

    try {
        // Fetch all voucher tasks
        const tasksSnapshot = await get(voucherTasksRef);
        const usersSnapshot = await get(usersRef);

        if (tasksSnapshot.exists() && usersSnapshot.exists()) {
            const tasks = Object.entries(tasksSnapshot.val()).map(([key, task]) => ({
                id: key,
                ...task,
            }));

            const users = usersSnapshot.val();

            // Map `requestorId` to `username` for each task
            return tasks.map((task) => ({
                ...task,
                username: users[task.requestorId]?.username || "Unknown User",
            }));
        } else {
            return []; // Return an empty array if no tasks or users exist
        }
    } catch (error) {
        console.error("Error fetching voucher tasks:", error);
        throw new Error("Could not fetch voucher tasks. Please try again later.");
    }
}

export async function fetchUserVoucherTasks() {
	const db = getDatabase();
	const auth = getAuth();
	const user = auth.currentUser;

	if (!user) {
		throw new Error("User is not logged in.");
	}

	const tasksRef = ref(db, "voucherTasks");

	try {
		const snapshot = await get(tasksRef);
		if (snapshot.exists()) {
			const tasks = Object.entries(snapshot.val()).map(([key, task]) => ({
				id: key,
				...task,
				status: task.status || "Pending", // Default to Pending if missing
			}));

			// Filter tasks by the current user's ID
			return tasks.filter((task) => task.requestorId === user.uid);
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching user voucher tasks:", error);
		throw new Error("Could not fetch your voucher tasks. Please try again later.");
	}
}


export async function submitVoucherTask(task) {
	const db = getDatabase();
	const tasksRef = ref(db, "voucherTasks");

	try {
		await push(tasksRef, task); // Push the new task to Firebase
		return "Task submitted successfully.";
	} catch (error) {
		console.error("Error submitting voucher task:", error);
		throw new Error("Could not submit voucher task. Please try again.");
	}
}


export async function updateVoucherTaskStatus(taskId, status) {
	const db = getDatabase();
	const taskRef = ref(db, `voucherTasks/${taskId}`);

	try {
		await update(taskRef, { status });
		return `Task ${taskId} updated successfully.`;
	} catch (error) {
		console.error("Error updating task status:", error);
		throw new Error("Could not update voucher task status.");
	}
}

export async function recordTransaction(userId, task) {
    const db = getDatabase();
    const transactionsRef = ref(db, `users/${userId}/transactions`);

    try {
        // Add a new transaction entry under the user's transactions
        await push(transactionsRef, {
			type: "Voucher Transaction",
			productId: task.id,
			details: "Task '" + task.title + "' has been approved",
			quantity: "-",
			totalPoints: task.points,
			timestamp: Date.now(),
        });
        console.log(`Transaction recorded for user ${userId}: ${task.description}`);
    } catch (error) {
        console.error("Error recording transaction:", error);
        throw new Error("Failed to record transaction.");
    }
}

export async function updateUserPoints(userId, points) {
	const db = getDatabase();
	const userRef = ref(db, `users/${userId}`);
	
	try {
		// Fetch the current points and update them
		const snapshot = await get(userRef);
		if (snapshot.exists()) {
			const currentPoints = snapshot.val().voucherPoints || 0;
			await update(userRef, { voucherPoints: currentPoints + points });
			console.log(`Updated points for user ${userId}: ${currentPoints + points}`);
		} else {
			console.error(`User ${userId} not found.`);
		}
	} catch (error) {
		console.error("Error updating user points:", error);
		throw new Error("Failed to update user points.");
	}
}

export async function generateWeeklyReport() {
    const db = getDatabase();
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(currentDate.getDate() - 7);
	
    try {
        // Fetch Weekly Requests
        const requestsRef = ref(db, "requests");
        const requestsQuery = query(
            requestsRef,
            orderByChild("timestamp"),
            startAt(oneWeekAgo.getTime()),
            endAt(currentDate.getTime())
        );
        const requestsSnapshot = await get(requestsQuery);

        const weeklyRequests = [];
        if (requestsSnapshot.exists()) {
            requestsSnapshot.forEach((childSnapshot) => {
                weeklyRequests.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val(),
                });
            });
        }

        // Fetch Inventory
        const inventoryRef = ref(db, "products");
        const inventorySnapshot = await get(inventoryRef);

        const inventorySummary = [];
        if (inventorySnapshot.exists()) {
            inventorySnapshot.forEach((childSnapshot) => {
                const item = childSnapshot.val();
                inventorySummary.push({
                    id: childSnapshot.key,
                    name: item.name,
                    stock: item.stock,
                });
            });
        }
        // Generate Report
        const report = {
            date: currentDate.toISOString(),
            weeklyRequests: {
                total: weeklyRequests.length,
                details: weeklyRequests,
            },
            inventorySummary: {
                totalItems: inventorySummary.length,
                details: inventorySummary,
            },
        };

        return report;
    } catch (error) {
        console.error("Error generating weekly report:", error);
        throw new Error("Failed to generate weekly report. Please try again.");
    }
}

export function downloadReport(filename, content) {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    link.click();

    URL.revokeObjectURL(url); // Clean up the URL object
}

export async function addProductToDatabase(product) {
	const db = getDatabase();
	const productRef = ref(db, "products");
	const newProductRef = push(productRef); // Create a new product with a unique ID
	await set(newProductRef, product); // Save the product details
	return newProductRef.key; // Return the unique ID (productId)
  }


  