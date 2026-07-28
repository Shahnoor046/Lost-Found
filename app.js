/**
 * Lost & Found Application Script
 * Standard JavaScript compatible with direct double-click (file://) and web servers.
 */

// MOCK DATA (Empty array by default)
const MOCK_ITEMS = [];

// APP STATE
let allItems = [];
let activeCategory = "all";
let searchQuery = "";
let selectedFile = null;

// Safe Helper to get elements
const $ = (id) => document.getElementById(id);

// ==============================================================================
// INITIALIZATION
// ==============================================================================
function initApp() {
  setupEventListeners();
  initDataFetching();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initDataFetching() {
  const firebaseNotice = $("firebaseNotice");
  const isConfigured = window.AppFirebase && window.AppFirebase.isFirebaseConfigured();

  if (isConfigured && window.AppFirebase.db) {
    try {
      window.AppFirebase.db.collection("lostItems").orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
          allItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : new Date()
            };
          });
          hideLoader();
          renderItems();
        }, (error) => {
          console.error("Firestore error:", error);
          useMockFallback();
        });
    } catch (err) {
      console.warn("Firestore error:", err);
      useMockFallback();
    }
  } else {
    if (firebaseNotice) firebaseNotice.style.display = "flex";
    useMockFallback();
  }
}

function useMockFallback() {
  const saved = localStorage.getItem("lostItems_local_data");
  if (saved) {
    try {
      allItems = JSON.parse(saved).filter(item => item.id && !item.id.toString().startsWith("mock-"));
    } catch (e) {
      allItems = [];
    }
  } else {
    allItems = [];
    saveToLocalStorage();
  }
  hideLoader();
  renderItems();
}

function saveToLocalStorage() {
  const isConfigured = window.AppFirebase && window.AppFirebase.isFirebaseConfigured();
  if (!isConfigured) {
    try {
      localStorage.setItem("lostItems_local_data", JSON.stringify(allItems));
    } catch (e) {
      console.warn("localStorage quota error:", e);
    }
  }
}

function hideLoader() {
  const loader = $("initialLoader");
  if (loader) loader.style.display = "none";
}

// ==============================================================================
// RENDER CARDS
// ==============================================================================
function renderItems() {
  const itemsGrid = $("itemsGrid");
  const emptyState = $("emptyState");
  const emptyStateText = $("emptyStateText");
  const itemCountDisplay = $("itemCountDisplay");

  if (!itemsGrid) return;

  const filtered = allItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      (item.itemName && item.itemName.toLowerCase().includes(searchQuery)) ||
      (item.category && item.category.toLowerCase().includes(searchQuery)) ||
      (item.location && item.location.toLowerCase().includes(searchQuery)) ||
      (item.description && item.description.toLowerCase().includes(searchQuery));
      
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  if (itemCountDisplay) {
    itemCountDisplay.textContent = `${filtered.length} Item${filtered.length === 1 ? '' : 's'} Reported`;
  }

  if (filtered.length === 0) {
    itemsGrid.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    if (emptyStateText) {
      if (searchQuery || activeCategory !== "all") {
        emptyStateText.textContent = `No items found matching "${searchQuery || activeCategory}".`;
      } else {
        emptyStateText.textContent = "No lost items reported yet. Click '+ Add Lost Item' to submit a report!";
      }
    }
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  itemsGrid.innerHTML = filtered.map(item => createCardHTML(item)).join("");
}

function createCardHTML(item) {
  const formattedDate = formatDate(item.date);
  const fallbackImg = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
  const imgUrl = item.imageURL || fallbackImg;

  return `
    <article class="item-card" data-id="${item.id}">
      <div class="card-media">
        <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(item.itemName)}" loading="lazy" onerror="this.src='${fallbackImg}'">
        <span class="card-category-badge">
          <i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'General')}
        </span>
        <span class="card-date-badge">
          <i class="fa-regular fa-calendar"></i> ${formattedDate}
        </span>
      </div>

      <div class="card-body">
        <h3 class="card-title">${escapeHTML(item.itemName)}</h3>
        <p class="card-description">${escapeHTML(item.description)}</p>

        <div class="card-info-list">
          <div class="info-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>Lost Location: <strong>${escapeHTML(item.location)}</strong></span>
          </div>
          <div class="info-item">
            <i class="fa-solid fa-phone"></i>
            <span>Contact Number: <strong class="phone-highlight">${escapeHTML(item.phone)}</strong></span>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ==============================================================================
// EVENT LISTENERS
// ==============================================================================
function setupEventListeners() {
  const searchInput = $("searchInput");
  const clearSearchBtn = $("clearSearchBtn");
  const resetSearchBtn = $("resetSearchBtn");
  const categoryChips = document.querySelectorAll(".chip");

  const openModalBtn = $("openModalBtn");
  const closeModalBtn = $("closeModalBtn");
  const cancelModalBtn = $("cancelModalBtn");
  const itemModal = $("itemModal");
  const addItemForm = $("addItemForm");
  const closeNoticeBtn = $("closeNoticeBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? "block" : "none";
      renderItems();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.style.display = "none";
      renderItems();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      activeCategory = "all";
      categoryChips.forEach(c => c.classList.toggle("active", c.dataset.category === "all"));
      if (clearSearchBtn) clearSearchBtn.style.display = "none";
      renderItems();
    });
  }

  categoryChips.forEach(chip => {
    chip.addEventListener("click", () => {
      categoryChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.category;
      renderItems();
    });
  });

  if (openModalBtn) openModalBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

  if (itemModal) {
    itemModal.addEventListener("click", (e) => {
      if (e.target === itemModal) closeModal();
    });
  }

  if (closeNoticeBtn) {
    closeNoticeBtn.addEventListener("click", () => {
      const notice = $("firebaseNotice");
      if (notice) notice.style.display = "none";
    });
  }

  setupImageUploadHandlers();

  if (addItemForm) {
    addItemForm.addEventListener("submit", handleFormSubmit);
  }
}

// ==============================================================================
// MODAL & DROPZONE CONTROLS
// ==============================================================================
function openModal() {
  const itemModal = $("itemModal");
  if (!itemModal) return;
  resetForm();
  
  const dateInput = $("date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
  itemModal.classList.add("active");
  itemModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const itemModal = $("itemModal");
  if (!itemModal) return;
  itemModal.classList.remove("active");
  itemModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function resetForm() {
  const addItemForm = $("addItemForm");
  const previewContainer = $("previewContainer");
  const dropzoneContent = $("dropzoneContent");
  const imagePreview = $("imagePreview");

  if (addItemForm) addItemForm.reset();
  clearErrors();
  selectedFile = null;

  if (previewContainer) previewContainer.style.display = "none";
  if (dropzoneContent) dropzoneContent.style.display = "block";
  if (imagePreview) imagePreview.src = "";
  setSubmitLoading(false);
}

function clearErrors() {
  const errorEls = document.querySelectorAll(".error-msg");
  errorEls.forEach(el => el.textContent = "");
}

function setupImageUploadHandlers() {
  const imageUpload = $("imageUpload");
  const dropzone = $("dropzone");
  const removeImageBtn = $("removeImageBtn");

  if (!imageUpload || !dropzone) return;

  imageUpload.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files && dt.files[0]) {
      imageUpload.files = dt.files;
      handleFileSelected(dt.files[0]);
    }
  });

  if (removeImageBtn) {
    removeImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFile = null;
      imageUpload.value = "";
      if ($("previewContainer")) $("previewContainer").style.display = "none";
      if ($("dropzoneContent")) $("dropzoneContent").style.display = "block";
      if ($("imagePreview")) $("imagePreview").src = "";
    });
  }
}

function handleFileSelected(file) {
  const imageError = $("imageError");
  const dropzoneContent = $("dropzoneContent");
  const previewContainer = $("previewContainer");
  const imagePreview = $("imagePreview");

  if (!file.type.startsWith("image/")) {
    if (imageError) imageError.textContent = "Please select a valid image file (PNG, JPG, WEBP).";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    if (imageError) imageError.textContent = "Image size should be less than 5MB.";
    return;
  }

  if (imageError) imageError.textContent = "";
  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (imagePreview) imagePreview.src = e.target.result;
    if (dropzoneContent) dropzoneContent.style.display = "none";
    if (previewContainer) previewContainer.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// ==============================================================================
// FORM SUBMISSION
// ==============================================================================
async function handleFormSubmit(e) {
  e.preventDefault();
  clearErrors();

  const itemName = $("itemName")?.value.trim();
  const category = $("category")?.value;
  const date = $("date")?.value;
  const location = $("location")?.value.trim();
  const phone = $("phone")?.value.trim();
  const description = $("description")?.value.trim();

  let isValid = true;

  if (!itemName) {
    if ($("itemNameError")) $("itemNameError").textContent = "Item name is required.";
    isValid = false;
  }

  if (!category) {
    if ($("categoryError")) $("categoryError").textContent = "Please select a category.";
    isValid = false;
  }

  if (!date) {
    if ($("dateError")) $("dateError").textContent = "Date is required.";
    isValid = false;
  }

  if (!location) {
    if ($("locationError")) $("locationError").textContent = "Lost location is required.";
    isValid = false;
  }

  if (!phone) {
    if ($("phoneError")) $("phoneError").textContent = "Contact number is required.";
    isValid = false;
  }

  if (!description) {
    if ($("descriptionError")) $("descriptionError").textContent = "Description is required.";
    isValid = false;
  }

  if (!selectedFile) {
    if ($("imageError")) $("imageError").textContent = "Please upload an image of the lost item.";
    isValid = false;
  }

  if (!isValid) return;

  setSubmitLoading(true);

  try {
    const isConfigured = window.AppFirebase && window.AppFirebase.isFirebaseConfigured();

    if (isConfigured && window.AppFirebase.db && window.AppFirebase.storage) {
      // Live Firebase Storage & Firestore Upload
      const storagePath = `lost-items/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const storageRef = window.AppFirebase.storage.ref(storagePath);
      
      const uploadTask = await storageRef.put(selectedFile);
      const imageURL = await uploadTask.ref.getDownloadURL();

      const newItemData = {
        itemName,
        category,
        description,
        location,
        date,
        phone,
        imageURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await window.AppFirebase.db.collection("lostItems").add(newItemData);

      prependNewItem({
        id: docRef.id,
        ...newItemData,
        createdAt: new Date().getTime()
      });

    } else {
      // Demo / Fallback Mode (Local Preview & LocalStorage)
      const imageURL = $("imagePreview")?.src || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
      
      prependNewItem({
        id: "local-" + Date.now(),
        itemName,
        category,
        description,
        location,
        date,
        phone,
        imageURL,
        createdAt: new Date().getTime()
      });
    }

    showToast("Lost item report published successfully!", "success");
    closeModal();

  } catch (error) {
    console.error("Error submitting item:", error);
    showToast("Failed to upload report: " + error.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

function prependNewItem(itemObj) {
  const existingIdx = allItems.findIndex(i => i.id === itemObj.id);
  if (existingIdx !== -1) {
    allItems[existingIdx] = itemObj;
  } else {
    allItems.unshift(itemObj);
  }
  saveToLocalStorage();
  renderItems();
}

function setSubmitLoading(isLoading) {
  const submitItemBtn = $("submitItemBtn");
  const btnSpinner = $("btnSpinner");
  const btnText = submitItemBtn?.querySelector(".btn-text");

  if (!submitItemBtn) return;

  submitItemBtn.disabled = isLoading;
  if (btnText) btnText.style.display = isLoading ? "none" : "inline";
  if (btnSpinner) btnSpinner.style.display = isLoading ? "flex" : "none";
}

// ==============================================================================
// UTILITIES
// ==============================================================================
function showToast(message, type = "info") {
  const container = $("toastContainer") || document.body;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconClass = type === "success" 
    ? "fa-circle-check" 
    : type === "error" 
    ? "fa-circle-xmark" 
    : "fa-circle-info";

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastSlideIn 0.3s reverse ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
