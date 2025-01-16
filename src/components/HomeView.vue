<template>
    <div class="background-image">
      <div class="centered-div">
        <h2>Follow Us</h2>
        <div class="social-links">
          <a href="https://www.facebook.com/muhammadiyahwelfarehome" target="_blank" rel="noopener noreferrer" class="social-link">
            <img src="@/assets/facebook-icon.png" alt="Facebook" />
            Facebook
          </a>
          <a href="https://www.instagram.com/muhammadiyahwelfarehome" target="_blank" rel="noopener noreferrer" class="social-link">
            <img src="@/assets/instagram-icon.png" alt="Instagram" />
            Instagram
          </a>
        </div>
      </div>
    </div>
</template>

<script>

</script>
<style>
.background-image {
  background-image: url('@/assets/mwh-background.jpeg');
  background-size: cover; /* Ensures the image covers the entire container */
  background-position: center; /* Centers the image */
  background-repeat: no-repeat; /* Avoids repeating the image */
  width: 100vw;
  height: 100vh;
  margin-top: -20px;
  display: flex;
  justify-content: center; /* Horizontally center */
  align-items: center; /* Vertically center */
}

.centered-div {
  background: rgba(255, 255, 255, 0.8); /* Optional: Semi-transparent background */
  padding: 20px;
  border-radius: 10px; /* Optional: Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Optional: Shadow */
  text-align: center; /* Center the text inside */
}

.centered-div h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.social-link img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}
</style>