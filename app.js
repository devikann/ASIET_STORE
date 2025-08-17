// js/app.js

import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- DOM ELEMENTS ---
const appContainer = document.getElementById('app');
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// --- APP STATE ---
let currentUser = null;
const productsCollection = collection(db, 'products');

// --- TEMPLATE RENDERING FUNCTIONS ---

const renderHeader = () => {
    const headerHTML = `
        <header class="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
            <h1 class="text-3xl font-bold text-gray-800">ASIET-Store</h1>
            <div id="auth-links"></div>
        </header>
    `;
    appContainer.insertAdjacentHTML('afterbegin', headerHTML);
    renderAuthLinks();
};

const renderAuthLinks = () => {
    const authLinksContainer = document.getElementById('auth-links');
    if (!authLinksContainer) return;

    if (currentUser) {
        authLinksContainer.innerHTML = `
            <button id="home-btn" class="text-blue-600 hover:text-blue-800 mr-4 font-medium">Store View</button>
            <button id="admin-dashboard-btn" class="text-blue-600 hover:text-blue-800 mr-4 font-medium">Admin Dashboard</button>
            <button id="logout-btn" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Logout</button>
        `;
    } else {
        authLinksContainer.innerHTML = `
            <button id="login-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Admin Login</button>
        `;
    }
};

const renderStudentView = (products) => {
    let content = `<div id="student-view">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Available Items</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    `;

    if (products.length === 0) {
        content += `<p class="text-gray-500 col-span-full">No items are currently available. Please check back later!</p>`;
    } else {
        products.forEach(product => {
            const stockStatusClass = product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const stockStatusText = product.inStock ? 'In Stock' : 'Out of Stock';
            content += `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <img src="${product.imageUrl || 'https://placehold.co/600x400/e2e8f0/3d4451?text=Item'}" alt="${product.name}" class="w-full h-48 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/3d4451?text=Item';">
                    <div class="p-4">
                        <h3 class="font-bold text-xl mb-2 text-gray-800">${product.name}</h3>
                        <p class="text-gray-600 text-base mb-4 h-20 overflow-hidden">${product.description}</p>
                        <div class="flex justify-between items-center">
                            <p class="text-gray-900 font-bold text-lg">$${parseFloat(product.price).toFixed(2)}</p>
                            <span class="text-sm font-semibold px-3 py-1 rounded-full ${stockStatusClass}">${stockStatusText}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    content += `</div></div>`;
    appContainer.innerHTML = content;
    renderHeader();
};

const renderAdminDashboard = (products) => {
    let content = `
        <div id="admin-view">
            <h2 class="text-2xl font-semibold text-gray-700 mb-4">Admin Dashboard</h2>
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 class="text-xl font-bold mb-4">Add New Product</h3>
                <form id="addProductForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" id="productName" placeholder="Product Name" class="border p-2 rounded w-full" required>
                    <input type="number" id="productPrice" placeholder="Price" step="0.01" class="border p-2 rounded w-full" required>
                    <textarea id="productDescription" placeholder="Description" class="border p-2 rounded w-full md:col-span-2" required></textarea>
                    <input type="url" id="productImageUrl" placeholder="Image URL" class="border p-2 rounded w-full md:col-span-2">
                    <div class="flex items-center md:col-span-2">
                        <input type="checkbox" id="productInStock" class="mr-2 h-4 w-4" checked>
                        <label for="productInStock">In Stock</label>
                    </div>
                    <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded md:col-span-2">Add Product</button>
                </form>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4">Manage Existing Products</h3>
                <div id="adminProductList" class="space-y-4"></div>
            </div>
        </div>
    `;
    appContainer.innerHTML = content;
    renderHeader();

    const adminProductList = document.getElementById('adminProductList');
    if (products.length === 0) {
        adminProductList.innerHTML = `<p class="text-gray-500">No products found. Add one using the form above.</p>`;
    } else {
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border gap-4';
            productElement.innerHTML = `
                <div class="flex items-center w-full sm:w-auto">
                    <img src="${product.imageUrl || 'https://placehold.co/100x100/e2e8f0/3d4451?text=Item'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-md mr-4" onerror="this.onerror=null;this.src='https://placehold.co/100x100/e2e8f0/3d4451?text=Item';">
                    <div>
                        <p class="font-bold">${product.name}</p>
                        <p class="text-sm text-gray-600">$${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button data-id="${product.id}" data-stock="${product.inStock}" class="toggle-stock-btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-2 px-4 rounded">
                        ${product.inStock ? 'Set Out of Stock' : 'Set In Stock'}
                    </button>
                    <button data-id="${product.id}" class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                </div>
            `;
            adminProductList.appendChild(productElement);
        });
    }

    attachAdminEventListeners();
};

const listenForProducts = (isAdminView = false) => {
    onSnapshot(productsCollection, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        products.sort((a, b) => b.inStock - a.inStock);

        if (isAdminView) {
            renderAdminDashboard(products);
        } else {
            renderStudentView(products);
        }
    }, (error) => {
        console.error("Error fetching products: ", error);
        appContainer.innerHTML = `<p class="text-red-500">Could not load store items. Please try again later.</p>`;
    });
};

const handleAddProduct = async (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const imageUrl = document.getElementById('productImageUrl').value;
    const inStock = document.getElementById('productInStock').checked;

    try {
        await addDoc(productsCollection, { name, price: Number(price), description, imageUrl, inStock });
        e.target.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to add product.");
    }
};

const handleToggleStock = async (id, currentStatus) => {
    const productRef = doc(db, 'products', id);
    try {
        await updateDoc(productRef, { inStock: !currentStatus });
    } catch (error) {
        console.error("Error updating stock: ", error);
        alert("Failed to update stock status.");
    }
};

const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
        const productRef = doc(db, 'products', id);
        try {
            await deleteDoc(productRef);
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert("Failed to delete product.");
        }
    }
};

const attachAdminEventListeners = () => {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    document.querySelectorAll('.toggle-stock-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const currentStock = e.target.dataset.stock === 'true';
            handleToggleStock(id, currentStock);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            handleDeleteProduct(e.target.dataset.id);
        });
    });
};

document.addEventListener('click', (e) => {
    if (e.target.id === 'login-btn') loginModal.style.display = 'block';
    if (e.target.id === 'logout-btn') signOut(auth);
    if (e.target.id === 'admin-dashboard-btn') listenForProducts(true);
    if (e.target.id === 'home-btn') listenForProducts(false);
});

closeModalBtn.addEventListener('click', () => loginModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginError.textContent = '';

    if (!email || !password) {
        loginError.textContent = 'Please fill in both email and password.';
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginModal.style.display = 'none';
        e.target.reset();
    } catch (error) {
        console.error("Login failed:", error.code, error.message);
        loginError.textContent = `Login failed: ${error.code}`;
    }
});

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        const userDocRef = doc(db, "students", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            console.log("Admin logged in:", user.email);
            listenForProducts(true);
        } else {
            console.log("User is not an admin, showing student view.");
            listenForProducts(false);
        }
    } else {
        console.log("User is a visitor or logged out, showing student view.");
        listenForProducts(false);
    }
});