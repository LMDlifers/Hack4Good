import app from "./firebase"; // Your Firebase initialization
import { getDatabase, ref, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

export function writeUserData(userId, name, email) {
  console.log("writeUserData function called");
  const db = getDatabase(app);
  const reference = ref(db, `users/${userId}`);

  // Return the Promise
  return set(reference, {
    username: name,
    email: email
  });
}


export function getUserData(userId) {
    console.log("Retrieving user data...");
    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`); // Reference the user's data path
  
    return get(userRef) // Returns a Promise
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("User data retrieved:", snapshot.val());
          return snapshot.val(); // Returns the data
        } else {
          console.log("No data available for this user.");
          return null;
        }
      })
      .catch((error) => {
        console.error("Error retrieving user data:", error);
        throw error; // Rethrow to handle in the caller
      });
  }

export async function fetchUserData() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log("No user is logged in.");
    return;
  }

  const db = getDatabase();
  const userRef = ref(db, `users/${user.uid}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("User Data:", data);
      return data;
    } else {
      console.log("No data available for the user.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

fetchUserData();
