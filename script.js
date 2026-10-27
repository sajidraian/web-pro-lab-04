
// Select form elements
const form = document.getElementById("registrationForm");

const studentId = document.getElementById("studentId");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");

const inputs = [studentId, fullName, email, phone, password];

const tableBody = document.getElementById("studentTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const successMessage = document.getElementById("successMessage");

// Regular Expression patterns
const patterns = {
    studentId: /^CSE-\d{4}-\d{3}$/,
    fullName: /^[A-Za-z ]{2,40}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^01\d{9}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
};

// Validation error messages
const errorMessages = {
    studentId: "Use the format CSE-2026-001.",
    fullName: "Name must contain 2–40 letters and spaces only.",
    email: "Enter a valid email, such as student@example.com.",
    phone: "Phone must contain exactly 11 digits and start with 01.",
    password: "Password must have at least 8 characters, including letters and digits."
};

// Validate a single input
function validateField(input) {
    const value = input.value.trim();
    const errorElement = input.parentElement.querySelector(".error-message");
    const pattern = patterns[input.id];

    if (value === "") {
        input.classList.remove("valid");
        input.classList.add("invalid");
        errorElement.textContent = "This field is required.";
        input.setAttribute("aria-invalid", "true");
        return false;
    }

    if (!pattern.test(value)) {
        input.classList.remove("valid");
        input.classList.add("invalid");
        errorElement.textContent = errorMessages[input.id];
        input.setAttribute("aria-invalid", "true");
        return false;
    }

    // Field is valid
    input.classList.remove("invalid");
    input.classList.add("valid");
    errorElement.textContent = "";
    input.setAttribute("aria-invalid", "false");

    return true;
}

// Real-time validation
inputs.forEach(function (input) {
    input.addEventListener("input", function () {
        validateField(input);
        successMessage.textContent = "";
        successMessage.classList.remove("success-message");
    });

    input.addEventListener("blur", function () {
        if (input.value.trim() !== "") {
            validateField(input);
        }
    });
});

// Handle form submission
form.addEventListener("submit", function (event) {
    // Prevent page reload
    event.preventDefault();

    successMessage.textContent = "";

    // Validate all fields
    let isFormValid = true;

    inputs.forEach(function (input) {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    // Stop submission if any field is invalid
    if (!isFormValid) {
        const firstInvalid = form.querySelector(".invalid");

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return;
    }

    // Create a new table row
    const row = document.createElement("tr");

    // Insert text safely into table cells
    const values = [
        studentId.value.trim(),
        fullName.value.trim(),
        email.value.trim(),
        phone.value.trim()
    ];

    values.forEach(function (value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });

    // Add the new student to the table
    tableBody.appendChild(row);

    // Hide the empty table message
    emptyMessage.style.display = "none";

    // Display success feedback
    successMessage.textContent = "Student registered successfully!";
    successMessage.classList.add("success-message");

    // Reset form controls and validation states
    form.reset();

    inputs.forEach(function (input) {
        input.classList.remove("valid", "invalid");
        input.removeAttribute("aria-invalid");

        input.parentElement.querySelector(
            ".error-message"
        ).textContent = "";
    });
});

// Handle manual form reset
form.addEventListener("reset", function () {
    // Wait until the browser resets the form controls
    setTimeout(function () {
        inputs.forEach(function (input) {
            input.classList.remove("valid", "invalid");
            input.removeAttribute("aria-invalid");

            input.parentElement.querySelector(
                ".error-message"
            ).textContent = "";
        });

        successMessage.textContent = "";
        successMessage.classList.remove("success-message");
    }, 0);
});

