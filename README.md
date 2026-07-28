# 🔍 Lost & Found Web Application

A modern, responsive, and full-featured **Lost & Found Portal** built with **HTML5, Vanilla CSS3, Vanilla JavaScript (ES Module), Firebase Firestore, and Firebase Storage**.

---

## 🌟 Features

- **Modern Blue & White Design System**: Glassmorphism navbar, responsive card grid, dynamic animations, and clean modal dialogs.
- **Report Lost Items**: Popup modal form allowing users to submit lost item details including title, category, location, date, contact number, and photo.
- **Image Upload Support**: Direct image upload preview and cloud storage integration via Firebase Storage (`lost-items/` folder).
- **Real-Time Search & Category Filters**: Search reports in real time by **Item Name**, **Category**, **Location**, or **Description**.
- **Instant UI Updates**: Newly reported items appear immediately on the home page without requiring a page reload.
- **Offline / Demo Mode**: Built-in `localStorage` persistence so added items stay saved even before connecting live Firebase credentials.
- **Zero-Build Setup**: Runs directly by opening `index.html` in any modern browser without needing Node.js or build tools.

---

## 🛠️ Built With

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Icons & Fonts**: FontAwesome 6, Plus Jakarta Sans (Google Fonts)
- **Database & Storage**: Firebase Firestore & Firebase Storage (Firebase v10)

---

## 📁 Project Structure

```text
LostAndFound/
├── index.html          # Semantic HTML5 single page app structure
├── style.css           # Custom CSS design system, responsive card grid & animations
├── firebase.js         # Firebase v10 initialization module (Firestore & Storage export)
├── app.js              # Application logic, search filters, form handling & data persistence
└── README.md           # Project documentation
```

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shahnoor046/Lost-Found.git
   cd Lost-Found
   ```

2. **Open the App:**
   Simply double-click `index.html` to launch the application directly in your web browser!

---

## ⚙️ Connecting Your Firebase Project

To sync items live with your own Firebase Cloud Database:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** and **Firebase Storage**.
3. Open [`firebase.js`](firebase.js) and update the `firebaseConfig` object with your project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
