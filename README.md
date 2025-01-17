# Muhammadiyah Welfare Home’s Web-based Minimart

### Website: https://h4g-tft.web.app

## Table of Contents
1. [Project Description](#1-project-description)  
2. [Installation Guide](#2-installation-guide)  
3. [How to Use](#3-how-to-use)  
4. [Credits](#4-credits)
5. [Licence](#5-licence)

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

## 3. How to Use

#### As a Resident:
1. **Sign-Up**:
   - Create an account with your credentials to access all features on the dashboard.
     ![image](https://github.com/user-attachments/assets/d9a5597c-6cd6-4000-81d3-a3462ae82131)
3. **Dashboard Features**:  
   - Check your account balance and review transaction history.
     ![image](https://github.com/user-attachments/assets/2aefbfae-e19c-4b79-83b7-2efe72096157)
     ![image](https://github.com/user-attachments/assets/dbf3f0f3-ce33-408c-bb6e-c00d94820d51)
   - Add items to your shopping cart seamlessly.
     ![image](https://github.com/user-attachments/assets/d0a44356-4bb9-4e00-94b8-d6ce1239040d)
   - Preorder items that are currently out of stock.
     ![image](https://github.com/user-attachments/assets/242818d1-35c1-4d60-b637-bb57c85daf96)
     ![image](https://github.com/user-attachments/assets/e819b93b-8e71-4dde-8095-ef0d3709a2c8)
4. **Pre-Orders Tab**:
   - Keep track of all your preordered items in one place.
     ![image](https://github.com/user-attachments/assets/486ea14b-30a6-46db-8b36-6ed765388f4c)
5. **Voucher Tasks Tab**:
   - Review details of submitted tasks, including descriptions and their current status.
     ![image](https://github.com/user-attachments/assets/35d404c5-4816-4d00-b7a5-f4a0adcef994)
   - Submit tasks to earn reward points, pending admin approval.
     ![image](https://github.com/user-attachments/assets/61d8ba61-fd8d-4ed7-8c9b-dcd2fbb1a9e3)
6. **Request Product Tab**:
   - View the status and details of all your submitted product requests.
     ![image](https://github.com/user-attachments/assets/8527d8f6-0a1c-4024-9583-79d0b06429ed)
   - Suggest new products that are not yet available in the system.
     ![image](https://github.com/user-attachments/assets/d94cda82-6ebd-4ed7-abf8-ac6a4a9b601d)
7. **Shopping Cart**:
   - Effortlessly proceed to checkout with your selected items.
     ![image](https://github.com/user-attachments/assets/43378aef-e078-43b2-a33b-9099af37841d)
     ![image](https://github.com/user-attachments/assets/32cc584f-f67d-4c3a-83a1-8cf6dcf930c1)
8. **Auction House**:  
   - Participate in bidding for exclusive or limited-edition items.
     ![image](https://github.com/user-attachments/assets/32dc24fe-9611-41cb-9e50-4879790890c5)
     ![image](https://github.com/user-attachments/assets/7ea5506f-ab52-49ed-a431-3533f38102ab)
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

## 4. Credits

- **Tan Kee Xiang (Project Head)**: [GitHub](https://github.com/kee-x)  
- **Lee Wei Kiat (DevOps Engineer)**: [GitHub](https://github.com/weikiatt)  
- **Marcus Liang (Frontend Engineer)**: [GitHub](https://github.com/LiangMarcus)  
- **Tony Koo (QA / Operations)**: [GitHub](https://github.com/LMDlifers)


## 5. Licence

Distributed under the MIT License. See [LICENSE](https://choosealicense.com/licenses/mit/) for more information.
