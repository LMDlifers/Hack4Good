# Project Title: Muhammadiyah Welfare Home’s Web-based Minimart

## Table of Contents
1. [Project Description](#1-project-description)  
2. [Installation Guide](#2-installation-guide)  
3. [How to Use](#3-how-to-use)  
4. [Credits](#4-credits)  

---

## 1. Project Description

Our web-based minimart provides a straightforward and user-friendly platform for residents to purchase products using their vouchers while maintaining a minimalist yet functional design. The project features two core interfaces: one for residents and another for administrators.

### Key Features:
- **Voucher Sharing**: Enable collaborative sharing of vouchers among residents.  
- **Priority Requests**: Allow residents to prioritize product requests.  
- **Wishlist**: Save preferred items for future purchases.  
- **Product Ratings**: Share feedback to improve the shopping experience.  

### Auction Module:
- Hidden bids for fair competition.  
- A dictionary-based fund storage system.  
- Option for users to contribute items from their inventory for auction.  
- Encourages platform engagement while fostering community spirit.  

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
For more details, visit the Configuration Reference.
---

3. How to Use
As a Resident:
Sign-Up: Register using your credentials to access the dashboard.

Dashboard features: Account balance, transaction history, pre-orders, and shopping cart management.
Navigate additional features (e.g., Voucher Tasks) via the menu.
Auction House: Bid on exclusive items to enhance platform engagement and foster community.

As an Admin:
Admin Login Credentials: 
User: admin@gmail.com
Password: 123123

Admin Features:
Configure user permissions, product pricing, and auction items.
Manage platform data with streamlined tools.
4. Credits
Tan Kee Xiang (Project Head): [GitHub](https://github.com/kee-x)
Lee Wei Kiat (DevOps Engineer): [GitHub](https://github.com/weikiatt)
Marcus Liang (Frontend Engineer): [GitHub](https://github.com/LiangMarcus)
Tony Koo (QA / Operations): [GitHub](https://github.com/LMDlifers)
