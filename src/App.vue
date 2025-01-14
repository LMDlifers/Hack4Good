<template>
	<body id="app" class="main bg-lightgrey">
	  <!-- Desktop Navigation -->
	  <nav id="desktop-nav">
		<router-link v-if="isLoggedIn && role === 'user'" to="/dashboard">
		  <img src="@/assets/logo.png" class="logo">
		</router-link>
		<router-link v-else-if="isLoggedIn && role === 'admin'" to="/admin">
		  <img src="@/assets/logo.png" class="logo">
		</router-link>
		<div v-else>
		  <img src="@/assets/logo.png" class="logo">
		</div>
		<div class="nav-links" v-if="isLoggedIn && role === 'user'">
		  <router-link to="/dashboard">Dashboard</router-link>
		  <router-link to="/preorder">Pre-Orders</router-link>
		  <router-link to="/vouchertask">Voucher Tasks</router-link>
		  <router-link to="/requestproduct">Request</router-link>
		  <router-link to="/auction">Auction</router-link>
		  <router-link to="/shoppingcart">Cart</router-link>
		  <button class="logout-button" @click="logout">Log Out</button>
		</div>
		<div class="nav-links" v-else-if="isLoggedIn && role === 'admin'">
		  <div class="dropdown">
			<span class="dropdown-header">Administration</span>
			<div class="dropdown-content">
			  <router-link to="/admin">Admin Panel</router-link>
			  <router-link to="/manageuser">Manage Users</router-link>
			</div>
		  </div>
		  <div class="dropdown">
			<span class="dropdown-header">Operations</span>
			<div class="dropdown-content">
			  <router-link to="/addproduct">Products</router-link>
			  <router-link to="/preorderadmin">Pre-Orders</router-link>
			  <router-link to="/viewrequest">Requests</router-link>
			  <router-link to="/vouchertaskadmin">Voucher Tasks</router-link>
			</div>
		  </div>
		  <div class="dropdown">
			<span class="dropdown-header">Audit</span>
			<div class="dropdown-content">
			  <router-link to="/auditpage">Audit Logs</router-link>
			</div>
		  </div>
		  <div class="dropdown">
			<span class="dropdown-header">Special Features</span>
			<div class="dropdown-content">
			  <router-link to="/auctionhome">Auction</router-link>
			</div>
		  </div>
		  <button class="logout-button" @click="logout">Log Out</button>
		</div>
		<div v-else class="nav-links">
		  <router-link to="/login">Login</router-link>
		  <router-link to="/signup">Sign Up</router-link>
		</div>
	  </nav>
  

    <!-- Hamburger Navigation -->
    <nav id="hamburger-nav">
      <img src="@/assets/logo.png" class="logo">
      <div class="hamburger-menu">
        <div class="hamburger-icon" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div v-if="isLoggedIn && role === 'user'" :class="['menu-links', { open: openMenu }]">
          <router-link to="/dashboard" @click="closeMenu">Dashboard</router-link>
                    <router-link to="/preorder" @click="closeMenu">Pre-Orders</router-link>
                    <router-link to="/vouchertask" @click="closeMenu">Voucher Tasks</router-link>
                    <router-link to="/requestproduct" @click="closeMenu">Request</router-link>
          <router-link to="/auction" @click="closeMenu">Auction</router-link>
                    <router-link to="/shoppingcart" @click="closeMenu">Cart</router-link>
          <button class="logout-button" @click="logout">Log Out</button>
        </div>
        <div v-else-if="isLoggedIn && role === 'admin'" :class="['menu-links', { open: openMenu }]">
          <router-link to="/admin" @click="closeMenu">Admin Panel</router-link>
          <router-link to="/auditpage" @click="closeMenu">Audit</router-link>
          <router-link to="/addproduct" @click="closeMenu">Products</router-link>
          <router-link to="/preorderadmin" @click="closeMenu">Pre-Orders</router-link>
          <router-link to="/viewrequest" @click="closeMenu">Requests</router-link>
          <router-link to="/vouchertaskadmin" @click="closeMenu">Voucher Tasks</router-link>
          <router-link to="/manageuser" @click="closeMenu">Manage Users</router-link>
          <router-link to="/auctionhome" @click="closeMenu">Auction</router-link>
          <button class="logout-button" @click="logout">Log Out</button>
        </div> 
        <div v-else :class="['menu-links', { open: openMenu }]">
          <router-link v-if="!isLoggedIn" to="/login" @click="closeMenu">Login</router-link>
          <router-link v-if="!isLoggedIn" to="/signup" @click="closeMenu">Sign Up</router-link>
        </div>
      </div>
    </nav>

    <router-view></router-view>
  </body>
  <footer>
    <p>Copyright &#169; 2025 MUHAMMADIYAH WELFARE HOME. All Rights Reserved.</p>
  </footer>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";


export default {
  name: "App",
  data() {
    return {
      isLoggedIn: false,
      role: "",
      openMenu: false,
    };
  },
  methods: {
    toggleMenu() {
      this.openMenu = !this.openMenu;
    },
    closeMenu() {
      this.openMenu = false;
    },
    async logout() {
      const auth = getAuth();
      try {
        await signOut(auth);
        this.isLoggedIn = false;
        this.role = "";
        this.openMenu = false;
        this.$router.push({ name: "Login" });
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },
    async fetchUserRole(uid) {
      const db = getDatabase();
      const userRef = ref(db, `users/${uid}`);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          this.role = snapshot.val().role;
        } else {
          console.warn("User role data does not exist.");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    },
    initializeBotpress() {
      if (window.botpressWebChat) {
        window.botpressWebChat.init({
          botId: "your-bot-id",
          hostUrl: "https://cdn.botpress.cloud/webchat",
          messagingUrl: "https://files.bpcontent.cloud",
          showPoweredBy: false,
          enableHistory: true,
        });
      } else {
        console.error("Botpress WebChat is not available on window.");
      }
    },
  },
  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
        this.fetchUserRole(user.uid);
      } else {
        this.isLoggedIn = false;
        this.role = "";
        this.openMenu = false; // Close the menu on logout
      }
    });
  },
  mounted() {
    // Chatbot integration
    const script1 = document.createElement("script");
    script1.src = "https://cdn.botpress.cloud/webchat/v2.2/inject.js";
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://files.bpcontent.cloud/2025/01/14/00/20250114002928-E5F46SRJ.js";
    document.body.appendChild(script2);

    script1.onload = () => {
      console.log("Botpress WebChat script loaded.");
      this.initializeBotpress();
    };

    script1.onerror = () => {
      console.error("Failed to load Botpress WebChat script.");
    };

    script2.onload = () => {
      console.log("Additional Botpress script loaded.");
    };

    script2.onerror = () => {
      console.error("Failed to load the additional Botpress script.");
    };
  },
};
</script>
<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-header {
  cursor: pointer;
  padding: 5px 10px;
}

.dropdown-header:hover {
  color: #bf4a2a;
    text-decoration: underline;
    text-underline-offset: 1rem;
    text-decoration-color: #bf4a2a;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: white;
  min-width: 150px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content a {
  color: black;
  text-decoration: none;
  display: block;
  padding: 10px;
}

.dropdown-content a:hover {
  color: #bf4a2a;
}
</style>
