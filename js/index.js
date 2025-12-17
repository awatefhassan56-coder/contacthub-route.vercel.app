/* ============================
   INPUTS
============================ */
var inputName = document.getElementById("FullName");
var inputphone = document.getElementById("PhoneNumber");
var inputEmail = document.getElementById("EmailAddress");
var inputAddress = document.getElementById("Address");
var inputformSelect = document.getElementById("form-select");
var inputNotes = document.getElementById("Notes");
var inputfavoriteCheck = document.getElementById("favoriteCheck");
var inputemergencyCheck = document.getElementById("emergencyCheck");

var addCon = document.getElementById("addCon");
var updateCon = document.getElementById("updateCon");
var searchInput = document.getElementById("search-input");
var inputImg = document.getElementById("formFile");
var avatarPreview = document.getElementById("avatarPreview");

var selectedImage = "";
var updatedIndex = null;

// Divs للرسائل أسفل الحقول
var nameError = document.querySelector("#FullName + .error-msg");
var phoneError = document.querySelector("#PhoneNumber + .error-msg");
var emailError = document.querySelector("#EmailAddress + .error-msg");

/* ============================
   ARRAYS - LOAD FROM LOCALSTORAGE
============================ */
var ContactList = JSON.parse(localStorage.getItem("contacts") || "[]");
var FavoriteList = JSON.parse(localStorage.getItem("favorites") || "[]");
var EmergencyList = JSON.parse(localStorage.getItem("emergency") || "[]");

/* ============================
   IMAGE UPLOAD
============================ */
var selectedImageNameOrPath = "";  

inputImg.onchange = function () {
    var file = inputImg.files[0];
    if (!file) return;

    selectedImageNameOrPath = file.name;

   
    var reader = new FileReader();
    reader.onload = function (e) {
        avatarPreview.innerHTML = `<img src="${e.target.result}" class="avatar-img">`;
    };
    reader.readAsDataURL(file);
};

/* ============================
   INIT ON PAGE LOAD
============================ */
window.addEventListener("DOMContentLoaded", function() {
    displayContacts(ContactList);
    updateCounters();
});
/* ============================
   SWEETALERT HELPERS
============================ */
function AddFailed(title, text) {
    Swal.fire({ icon: "error", title: title, text: text });
}



function showSuccess(action, name = "") {
    Swal.fire({
        title: "Done!",
        text: name
            ? `${name} has been ${action} successfully.`
            : `Contact ${action} successfully.`,
        icon: "success"
    });
}

/* ============================
   VALIDATION
============================ */

function validateContact(contact, showAlert = true, index = null) {
    var phoneRegex = /^01[0125][0-9]{8}$/;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // مسح رسائل الأخطاء
    nameError.textContent = "";
    phoneError.textContent = "";
    emailError.textContent = "";

    var valid = true;

    // الاسم
    if (!contact.name.trim()) {
        nameError.textContent = "Name is required";
        if (showAlert) AddFailed("Missing Name", "Please enter a name!");
        valid = false;
    }

    // رقم الموبايل
    if (!contact.phone.trim()) {
        phoneError.textContent = "Phone number is required";
        if (showAlert) AddFailed("Missing Phone", "Please enter a phone number!");
        valid = false;
    }
    else if (!phoneRegex.test(contact.phone.trim())) {
        phoneError.textContent = "Invalid Egyptian phone number";
        if (showAlert)
            AddFailed("Invalid Phone", "Use Egyptian number like 01012345678");
        valid = false;
    }

    // الإيميل
    if (contact.email && !emailRegex.test(contact.email.trim())) {
        emailError.textContent = "Invalid email address";
     
        valid = false;
    }

    // 🔴 فحص تكرار رقم الموبايل (وقت الحفظ فقط)
    if (showAlert) {
        for (var i = 0; i < ContactList.length; i++) {
            if (i !== index && ContactList[i].phone === contact.phone) {
                AddFailed(
                    "Number already exists",
                    "This number is already added for: " + ContactList[i].name
                );
                valid = false;
                break;
            }
        }
    }

    return valid;
}




// Event listeners للفلديشن الحي أثناء الكتابة
inputName.addEventListener("input", () => validateContact(createContactObject(), false));
inputphone.addEventListener("input", () => validateContact(createContactObject(), false));
inputEmail.addEventListener("input", () => validateContact(createContactObject()))






/* ============================
   CLEAR FORM
============================ */
function clearForm() {
    inputName.value = "";
    inputphone.value = "";
    inputEmail.value = "";
    inputAddress.value = "";
    inputNotes.value = "";
    inputformSelect.value = "";
    inputfavoriteCheck.checked = false;
    inputemergencyCheck.checked = false;
    inputImg.value = "";
    avatarPreview.innerHTML = "";
    selectedImage = "";
    updatedIndex = null;
}

/* ============================
   CREATE CONTACT OBJECT
============================ */
function createContactObject() {
    return {
        img: selectedImageNameOrPath,
        name: inputName.value.trim(),
        phone: inputphone.value.trim(),
        email: inputEmail.value.trim(),
        Address: inputAddress.value.trim(),
        formSelect: inputformSelect.value,
        Notes: inputNotes.value.trim(),
        favoriteCheck: inputfavoriteCheck.checked,
        emergencyCheck: inputemergencyCheck.checked
    };
}
/* ============================
   TOGGLES
============================ */
function toggleFavorite(index) {
    console.log("hi")
    ContactList[index].favoriteCheck = !ContactList[index].favoriteCheck;
    buildFavoriteAndEmergencyLists();
    saveAll();
    displayContacts(ContactList);
    updateCounters();
}

function toggleEmergency(index) {
    ContactList[index].emergencyCheck = !ContactList[index].emergencyCheck;
    buildFavoriteAndEmergencyLists();
    saveAll();
    displayContacts(ContactList);
    updateCounters();
}

/* ============================
   CREATE CARDS
============================ */

function creatContactCard(c, index) {
    return `
    <div class="col-md-6">
        <div class="contact-card">

            <!-- Top -->
            <div class="d-flex align-items-center mb-3 top-row"> 
                <div class="avatar-wrapper position-relative me-3">
                    <div class="avatar">
                        ${
                            c.img
                                ? `<img src="${c.img}" class="avatar-img">`
                                : `<span class="avatar-letter">${c.name.substring(0,2).toUpperCase()}</span>`
                        }

                        ${c.favoriteCheck ? `<span class="badge-icon fav-badge"><i class="fa-solid fa-star"></i></span>` : ''}
                        ${c.emergencyCheck ? `<span class="badge-icon emerg-badge"><i class="fa-solid fa-heart-pulse"></i></span>` : ''}
                    </div>
                </div>

                <div class="main-info">
                    <h5 class="mb-1 name">${c.name}</h5>
                    <p class="mb-0 phone">
                        <i class="fa-solid fa-phone me-1"></i>${c.phone}
                    </p>
                </div>
            </div>

            <!-- Info -->
            ${c.email ? `
            <div class="info-row mb-2">
                <i class="fa-solid fa-envelope me-2 emailBg"></i>
                <span>${c.email}</span>
            </div>` : ''}

            <div class="info-row mb-3">
                <i class="fa-solid fa-location-dot me-2 addressBg"></i>
                <span>${c.Address || ""}</span>
            </div>

            <!-- Tags -->
            <div class="mb-3 tags">
                ${c.formSelect ? `<span class="tag family">${c.formSelect}</span>` : ""}
                ${c.emergencyCheck ? `<span class="tag emergency">Emergency</span>` : ""}
            </div>

            <!-- Actions -->
            <div class="actions d-flex justify-content-between align-items-center pt-3 border-top">
                <div class="btn-container">
                    <a href="tel:${c.phone}" class="btn call">
                        <i class="fa-solid fa-phone"></i>
                    </a>
     ${c.email ? `
    <a href="mailto:${c.email}" class="btn email">
        <i class="fa-solid fa-envelope"></i>
    </a>
` : ''}



                </div>

                <div class="btn-container">
                    <button onclick="toggleFavorite(${index})" class="btn fav">
                        ${
                            c.favoriteCheck 
                            ? `<i class="fa-solid fa-star text-warning"></i>`
                            : `<i class="fa-regular fa-star"></i>`
                        }
                    </button>

                    <button onclick="toggleEmergency(${index})" class="btn emerg">
                        ${
                            c.emergencyCheck 
                            ? `<i class="fa-solid fa-heart-pulse text-danger"></i>`
                            : `<i class="fa-regular fa-heart"></i>`
                        }
                    </button>

                    <button onclick="resertForm(${index})" class="btn edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button onclick="deleteAlert(${index})" class="btn delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

        </div>
    </div>
    `;
}





function creatFavCard(c) {
    if (!c.favoriteCheck) return "";
    return `
    <div class="small-card">
        <div class="avatarFev bg-main-color">
            <span class="avatar-letter">${c.name.charAt(0).toUpperCase()}</span>
        </div>
        <div class="main-info">
            <h3>${c.name}</h3>
            <p>${c.phone}</p>
        </div>
        <a href="tel:${c.phone || ''}" class="phoneRight fevPhone">
            <i class="fa-solid fa-phone"></i>
        </a>
    </div>`;
}

function creatEmerCard(c) {
    if (!c.emergencyCheck) return "";
    return `
    <div class="small-card">
        <div class="avatarFev bg-main-color">
            <span class="avatar-letter">${c.name.charAt(0).toUpperCase()}</span>
        </div>
        <div class="main-info">
            <h3>${c.name}</h3>
            <p>${c.phone}</p>
        </div>
        <a href="tel:${c.phone || ''}" class="phoneRight emrPhone">
            <i class="fa-solid fa-phone"></i>
        </a>
    </div>`;
}

/* ============================
   BUILD FAVORITE & EMERGENCY LISTS
============================ */
function buildFavoriteAndEmergencyLists() {
    FavoriteList = ContactList.filter(c => c.favoriteCheck);
    EmergencyList = ContactList.filter(c => c.emergencyCheck);
    localStorage.setItem("favorites", JSON.stringify(FavoriteList));
    localStorage.setItem("emergency", JSON.stringify(EmergencyList));
}

/* ============================
   UPDATE COUNTERS
============================ */
function updateCounters() {
    document.getElementById("Total").innerHTML = ContactList.length;
    document.getElementById("Favorites").innerHTML = FavoriteList.length;
    document.getElementById("Emergency").innerHTML = EmergencyList.length;
}

/* ============================
   SAVE CONTACTS
============================ */
function saveAll() {
    localStorage.setItem("contacts", JSON.stringify(ContactList));
}

/* ============================
   DISPLAY CONTACTS
============================ */
function displayContacts(list) {
    var contactsHTML = "";
    var favHTML = "";
    var emHTML = "";

    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        var realIndex = ContactList.indexOf(c);

        contactsHTML += creatContactCard(c, realIndex);
        if (c.favoriteCheck) favHTML += creatFavCard(c);
        if (c.emergencyCheck) emHTML += creatEmerCard(c);
    }

    document.getElementById("ContactsData").innerHTML = contactsHTML;
    document.getElementById("FavoritesData").innerHTML = favHTML;
    document.getElementById("EmergencyData").innerHTML = emHTML;
}

/* ============================
   ADD CONTACT
============================ */
function addContact() {
    var contact = createContactObject();
    if (!validateContact(contact)) return;

    ContactList.push(contact);
    buildFavoriteAndEmergencyLists();
    saveAll();
    clearForm();
    displayContacts(ContactList);
    updateCounters();
    showSuccess("added");
}

/* ============================
   EDIT CONTACT
============================ */
function resertForm(index) {
    updatedIndex = index;
    var c = ContactList[index];

    selectedImage = c.img || "";
    avatarPreview.innerHTML = c.img
        ? `<img src="${c.img}" class="avatar-img">`
        : `<span class="avatar-letter">${c.name.substring(0,2).toUpperCase()}</span>`;

    inputName.value = c.name;
    inputphone.value = c.phone;
    inputEmail.value = c.email;
    inputAddress.value = c.Address;
    inputNotes.value = c.Notes;
    inputformSelect.value = c.formSelect;
    inputfavoriteCheck.checked = c.favoriteCheck;
    inputemergencyCheck.checked = c.emergencyCheck;

    addCon.classList.add("d-none");
    updateCon.classList.remove("d-none");
}

/* ============================
   UPDATE CONTACT
============================ */
function updateContact() {
    if (updatedIndex === null) return;

    var contact = createContactObject();
    if (!validateContact(contact, updatedIndex)) return;

    ContactList[updatedIndex] = contact;
    buildFavoriteAndEmergencyLists();
    saveAll();
    clearForm();
    displayContacts(ContactList);
    updateCounters();

    addCon.classList.remove("d-none");
    updateCon.classList.add("d-none");
    showSuccess("updated", "content");
}

/* ============================
   DELETE CONTACT
============================ */
function deleteAlert(index) {
    var name = ContactList[index].name;

    Swal.fire({
        title: "Delete Contact?",
        text: `Are you sure you want to delete ${name}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#333",
        confirmButtonText: "Yes, delete it!"
    }).then(result => {
        if (result.isConfirmed) {
            ContactList.splice(index, 1);
            buildFavoriteAndEmergencyLists();
            saveAll();
            displayContacts(ContactList);
            updateCounters();
            showSuccess("deleted", name);
        }
    });
}


/* ============================
   SEARCH
============================ */
searchInput.addEventListener("input", function () {
    var query = this.value.trim().toLowerCase();
    if (!query) { displayContacts(ContactList); return; }

    var filteredList = ContactList.filter(c =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
    );
    displayContacts(filteredList);
});



