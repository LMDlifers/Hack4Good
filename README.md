# Muhammadiyah Welfare Home’s Web-based Minimart

### Website: https://h4g-tft.web.app

## Table of Contents
1. [Project Description](#1-project-description)  
2. [Installation Guide](#2-installation-guide)  
3. [How to Use](#3-how-to-use)  
4. [Credits](#4-credits)  

---

## 1. Project Description

Our web-based minimart provides a straightforward and user-friendly platform for residents to purchase products using their vouchers while maintaining a minimalist yet functional design. The project features two core interfaces: one for residents and another for administrators.

### Key Features:
- **Purchase Products**: Conveniently browse and purchase available products.
- **Preorder Products**: Place preorders for out-of-stock items to secure them in advance.
- **Claim Points**: Complete voucher tasks to earn points, subject to admin approval.
- **Request Products**: Submit requests for products not currently listed in the system.
- **Chatbot**: Get instant answers to your questions through an AI-powered chatbot.
- **Auction**: Engage in competitive bidding to win exclusive items or deals.

### Challenges Overcome:
1. **Seamless Integration**: Ensuring the platform aligns with MWH’s existing website design to avoid user confusion.  
2. **System Design**: Balancing simplicity with maximum functionality in system architecture and UX design.  
3. **Image Hosting**: Managing multiple hosted images efficiently.  
4. **Security**: Protecting sensitive data, such as API keys, from public exposure.  
5. **Limited Data**: Addressing functionality gaps due to incomplete information, especially for the AI assistant.

The platform leverages **Vue.js** for its frontend, **Firebase** for its backend, and **Botpress** for "Tom," MWH’s AI assistant.

---

## 2. Installation Guide

### Project Setup

## Node.js manager
```
nvm install latest
npm install
```

## Report / Analytics generation
```
npm install jspdf
npm install jspdf-autotable
```

## Compiles and Hot-Reloads for Development
```
npm run serve
```

## Compiles and Minifies for Production

```
npm run build
```

## Lints and fixes files
```
npm run lint
```

## Customize Configuration
For more details, visit the [Configuration Reference](https://cli.vuejs.org/config/).
---

### 3. How to Use

#### As a Resident:
1. **Sign-Up**:
   - Create an account with your credentials to access all features on the dashboard.
3. **Dashboard Features**:  
   - Check your account balance and review transaction history.
   - Add items to your shopping cart seamlessly.
   - Preorder items that are currently out of stock.
4. **Pre-Orders Tab**:
   - Keep track of all your preordered items in one place.
5. **Voucher Tasks Tab**:
   - Submit tasks to earn reward points, pending admin approval.
   - Review details of submitted tasks, including descriptions and their current status.
6. **Request Product Tab**:
   - Suggest new products that are not yet available in the system.
   - View the status and details of all your submitted product requests.
7. **Shopping Cart**:
   - Effortlessly proceed to checkout with your selected items.
8. **Auction House**:  
   - Participate in bidding for exclusive or limited-edition items.
   - Promote engagement and strengthen the sense of community involvement.
---

#### As an Admin:
- **Login Credentials**:  
  - **User**: `admin@gmail.com`  
  - **Password**: `123123`

1. **Administration**:
   ##### Admin Panel
      - Generate and download reports, including weekly requests and inventory summaries.
   ##### Manage users
      - Register new users with ease.
      - Suspend users when necessary.
      - Reset user passwords via email for account recovery.
2. **Operations**
   ##### Products
      - Add new products to the inventory.
      - Update product details as needed.
      - Adjust stock levels to ensure availability.
      - Quickly search for specific products.
   ##### Pre Orders
      - Review and approve or reject preorder requests from residents.
   ##### Requests
      - Evaluate and approve or reject product requests submitted by residents.
   ##### Voucher Tasks
      - Manage voucher task claims by approving or rejecting submissions.
3. **Audit**
   ##### Audit Log
      - Monitor all administrative activities for transparency.
      - Generate detailed audit reports.
4. **Special Features**
   ##### Auction
      - Create new auctions for exclusive items.
      - Search and manage existing auctions effortlessly.
      - Edit auction details to reflect updates.
      - Remove outdated or completed auctions.
   

---

### 4. Credits

- **Tan Kee Xiang (Project Head)**: [GitHub](https://github.com/kee-x)  
- **Lee Wei Kiat (DevOps Engineer)**: [GitHub](https://github.com/weikiatt)  
- **Marcus Liang (Frontend Engineer)**: [GitHub](https://github.com/LiangMarcus)  
- **Tony Koo (QA / Operations)**: [GitHub](https://github.com/LMDlifers)
