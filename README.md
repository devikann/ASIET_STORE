ASIET Store: Stock Management System
This is a simple, real-time web application for the ASIET college store, designed to help students and administrators manage and view store stock. The application features separate views and functionalities for students and administrators, powered by Firebase for secure authentication and a real-time database.

✨ Features
Student Login: Students can securely log in to view the current stock of items.

Admin Login: A dedicated admin account allows for full control over the stock.

Real-time Stock View: The stock list updates instantly for all logged-in users when an admin makes a change.

Admin Stock Management: Administrators can easily update the quantity of items in the store.

Firebase Integration: Utilizes Firebase Authentication for user logins and Firestore for the real-time database, ensuring data persistence and security.

Responsive Design: The interface is clean and works well on both desktop and mobile devices.

🚀 Getting Started
To set up and run this project locally, you will need a Firebase project.

Prerequisites
Firebase Project: Create a new project in the Firebase Console.

Enable Firestore & Auth: In your Firebase project, enable Firestore and the Email/Password sign-in method under the Authentication tab.

Create Admin User: For the first time, you will need to create the admin user to initialize the stock. The provided code has a button on the login page to do this.

File Structure
The project is organized into three main files:

index.html: The main HTML file that provides the user interface and links to the other files.

style.css: The stylesheet that handles the look and feel of the application.

app.js: The JavaScript file that contains all the logic for Firebase authentication, Firestore interactions, and updating the UI.

📋 Usage
Admin
Log in using the default admin credentials: Email: admin@asiet.ac.in and Password: admin123.

The admin dashboard will display the current stock with an input field to update the quantity for each item.

Clicking the Update button will instantly save the new quantity to the database.

Student
Log in with a student account (created by an admin).

The student dashboard will display a read-only list of all stock items and their quantities. The view updates in real-time as the admin makes changes.

🛠️ Built With
HTML5 - For the document structure.

CSS3 - For styling the application.

JavaScript - For the application logic.

Firebase - Authentication and real-time database.

Tailwind CSS - A utility-first CSS framework for rapid UI development.
