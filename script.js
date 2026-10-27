"use strict";

/* =========================================
   1. DOM ELEMENTS
========================================= */

const studentForm = document.getElementById("studentForm");

const studentIdInput = document.getElementById("studentId");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");

const editingStudentIdInput =
    document.getElementById("editingStudentId");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");

const formMessage = document.getElementById("formMessage");

const studentTableBody =
    document.getElementById("studentTableBody");

const totalStudentsElement =
    document.getElementById("totalStudents");

const validStudentsElement =
    document.getElementById("validStudents");

const currentPageStatElement =
    document.getElementById("currentPageStat");

const searchInput = document.getElementById("searchInput");
const pageSizeSelect = document.getElementById("pageSize");

const tableInfo = document.getElementById("tableInfo");
const pagination = document.getElementById("pagination");

const exportButton = document.getElementById("exportButton");

const confirmDialog = document.getElementById("confirmDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogMessage = document.getElementById("dialogMessage");

const cancelDialogButton = document.getElementById("cancelDialog");
const confirmDialogButton =
    document.getElementById("confirmDialogButton");


/* =========================================
   2. REGEX VALIDATION RULES
========================================= */

const patterns = {
    studentId: /^[A-Z]{2,5}-\d{4}-\d{3}$/,

    fullName: /^[A-Za-z ]{2,40}$/,

    email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/,

    phone: /^01\d{9}$/,

    password: /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/
};


/* =========================================
   3. APPLICATION STATE
========================================= */

const STORAGE_KEY = "eduportal_student_records_v1";

let students = loadStudents();

let currentPage = 1;
let sortField = "studentId";
let sortDirection = "asc";

let pendingConfirmation = null;


/* =========================================
   4. STORAGE FUNCTIONS
========================================= */

function loadStudents() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        // Accept only records with the expected structure.
        return parsedData.filter(student => {
            return (
                student &&
                typeof student.studentId === "string" &&
                typeof student.fullName === "string" &&
                typeof student.email === "string" &&
                typeof student.phone === "string" &&
                typeof student.registeredAt === "string"
            );
        });

    } catch (error) {
        console.error("Unable to load student records:", error);
        return [];
    }
}


function saveStudents() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(students)
        );

        return true;

    } catch (error) {
        console.error("Unable to save student records:", error);

        showMessage(
            "Unable to save records in this browser. Check storage availability.",
            "error"
        );

        return false;
    }
}


/* =========================================
   5. VALIDATION FUNCTIONS
========================================= */

function validateField(fieldName, value) {
    const trimmedValue = value.trim();

    switch (fieldName) {
        case "studentId":
            if (!trimmedValue) {
                return "Student ID is required.";
            }

            if (!patterns.studentId.test(trimmedValue)) {
                return "Use the format CSE-2026-001.";
            }

            if (isDuplicateStudentId(trimmedValue)) {
                return "This Student ID is already registered.";
            }

            return "";

        case "fullName":
            if (!trimmedValue) {
                return "Full name is required.";
            }

            if (!patterns.fullName.test(trimmedValue)) {
                return "Use 2–40 English letters and spaces only.";
            }

            return "";

        case "email":
            if (!trimmedValue) {
                return "Email address is required.";
            }

            if (!patterns.email.test(trimmedValue)) {
                return "Enter a valid email address.";
            }

            if (isDuplicateEmail(trimmedValue)) {
                return "This email is already registered.";
            }

            return "";

        case "phone":
            if (!trimmedValue) {
                return "Phone number is required.";
            }

            if (!patterns.phone.test(trimmedValue)) {
                return "Enter 11 digits starting with 01.";
            }

            return "";

        case "password":
            if (!value) {
                return "Password is required.";
            }

            if (!patterns.password.test(value)) {
                return "Use at least 8 characters with letters and digits; no spaces.";
            }

            return "";

        default:
            return "";
    }
}


function isDuplicateStudentId(value) {
    const normalizedValue = value.toUpperCase();

    const editingId = editingStudentIdInput.value;

    return students.some(student => {
        const isSameRecord = student.studentId === editingId;

        return (
            student.studentId.toUpperCase() === normalizedValue &&
            !isSameRecord
        );
    });
}


function isDuplicateEmail(value) {
    const normalizedValue = value.toLowerCase();

    const editingId = editingStudentIdInput.value;

    return students.some(student => {
        const isSameRecord = student.studentId === editingId;

        return (
            student.email.toLowerCase() === normalizedValue &&
            !isSameRecord
        );
    });
}


function validateInput(input, fieldName) {
    const errorElement = document.getElementById(
        `${fieldName}Error`
    );

    const errorMessage = validateField(
        fieldName,
        input.value
    );

    if (errorMessage) {
        input.classList.remove("valid");
        input.classList.add("invalid");

        input.setAttribute("aria-invalid", "true");

        errorElement.textContent = errorMessage;

    } else {
        input.classList.remove("invalid");
        input.classList.add("valid");

        input.setAttribute("aria-invalid", "false");

        errorElement.textContent = "";
    }

    return errorMessage === "";
}


function validateEntireForm() {
    const fields = [
        [studentIdInput, "studentId"],
        [fullNameInput, "fullName"],
        [emailInput, "email"],
        [phoneInput, "phone"],
        [passwordInput, "password"]
    ];

    let firstInvalidInput = null;

    fields.forEach(([input, fieldName]) => {
        const valid = validateInput(input, fieldName);

        if (!valid && !firstInvalidInput) {
            firstInvalidInput = input;
        }
    });

    return firstInvalidInput;
}


/* =========================================
   6. REAL-TIME VALIDATION
========================================= */

const validationFields = [
    [studentIdInput, "studentId"],
    [fullNameInput, "fullName"],
    [emailInput, "email"],
    [phoneInput, "phone"],
    [passwordInput, "password"]
];

validationFields.forEach(([input, fieldName]) => {
    input.addEventListener("input", () => {
        validateInput(input, fieldName);

        // Update duplicate checks and visual indicators.
        if (fieldName === "studentId") {
            validateInput(emailInput, "email");
        }

        if (fieldName === "email") {
            validateInput(studentIdInput, "studentId");
        }

        clearMessage();
    });

    input.addEventListener("blur", () => {
        if (input.value.trim() !== "") {
            validateInput(input, fieldName);
        }
    });
});


/* =========================================
   7. MESSAGE FUNCTIONS
========================================= */

function showMessage(message, type) {
    formMessage.textContent = message;

    formMessage.className = `message ${type}`;

    formMessage.hidden = false;
}


function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "message";
    formMessage.hidden = true;
}


/* =========================================
   8. FORM SUBMISSION
========================================= */

studentForm.addEventListener("submit", event => {
    // Prevent the browser's normal form submission.
    event.preventDefault();

    clearMessage();

    const firstInvalidInput = validateEntireForm();

    if (firstInvalidInput) {
        showMessage(
            "Please correct the highlighted fields before continuing.",
            "error"
        );

        firstInvalidInput.focus();

        return;
    }

    const studentData = {
        studentId: studentIdInput.value.trim().toUpperCase(),

        fullName: normalizeName(fullNameInput.value),

        email: emailInput.value.trim().toLowerCase(),

        phone: phoneInput.value.trim()
    };

    const editingId = editingStudentIdInput.value;

    if (editingId) {
        updateStudent(editingId, studentData);
    } else {
        addStudent(studentData);
    }
});


function normalizeName(value) {
    return value
        .trim()
        .replace(/\s+/g, " ");
}


function addStudent(studentData) {
    const student = {
        ...studentData,

        // Passwords are deliberately excluded.
        registeredAt: new Date().toISOString()
    };

    students.push(student);

    if (!saveStudents()) {
        students.pop();
        return;
    }

    currentPage = 1;

    renderAll();

    resetForm();

    showMessage(
        "Student registered successfully!",
        "success"
    );
}


function updateStudent(originalId, studentData) {
    const index = students.findIndex(
        student => student.studentId === originalId
    );

    if (index === -1) {
        showMessage(
            "Student record could not be found.",
            "error"
        );

        return;
    }

    const previousStudent = students[index];

    const updatedStudent = {
        ...studentData,

        // Preserve the original registration date.
        registeredAt: previousStudent.registeredAt
    };

    students[index] = updatedStudent;

    if (!saveStudents()) {
        students[index] = previousStudent;
        return;
    }

    renderAll();

    resetForm();

    showMessage(
        "Student record updated successfully!",
        "success"
    );
}


/* =========================================
   9. RESET FORM
========================================= */

function resetForm() {
    studentForm.reset();

    editingStudentIdInput.value = "";

    validationFields.forEach(([input, fieldName]) => {
        input.classList.remove("valid", "invalid");

        input.removeAttribute("aria-invalid");

        document.getElementById(
            `${fieldName}Error`
        ).textContent = "";
    });

    formTitle.textContent = "Register a Student";

    submitButton.textContent = "+ Register Student";

    clearMessage();
}


document.getElementById("resetButton").addEventListener(
    "click",
    () => {
        resetForm();
        studentIdInput.focus();
    }
);


document.getElementById("newStudentButton").addEventListener(
    "click",
    () => {
        resetForm();

        document.getElementById("registration").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        studentIdInput.focus();
    }
);


/* =========================================
   10. SEARCH
========================================= */

searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderAll();
});


function getFilteredStudents() {
    const query = searchInput.value
        .trim()
        .toLowerCase();

    return students.filter(student => {
        return [
            student.studentId,
            student.fullName,
            student.email,
            student.phone
        ].some(value => {
            return value.toLowerCase().includes(query);
        });
    });
}


/* =========================================
   11. SORTING
========================================= */

document.querySelectorAll(".sort-button").forEach(button => {
    button.addEventListener("click", () => {
        const field = button.dataset.sort;

        if (sortField === field) {
            sortDirection =
                sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortField = field;
            sortDirection = "asc";
        }

        currentPage = 1;

        renderAll();
    });
});


function getSortedStudents(list) {
    return [...list].sort((a, b) => {
        const first = a[sortField].toLowerCase();
        const second = b[sortField].toLowerCase();

        const comparison = first.localeCompare(second);

        return sortDirection === "asc"
            ? comparison
            : -comparison;
    });
}


/* =========================================
   12. PAGINATION
========================================= */

pageSizeSelect.addEventListener("change", () => {
    currentPage = 1;
    renderAll();
});


function getPageData(list) {
    const pageSize = Number(pageSizeSelect.value);

    const totalPages = Math.max(
        1,
        Math.ceil(list.length / pageSize)
    );

    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * pageSize;

    return {
        pageSize,
        totalPages,
        startIndex,
        pageStudents: list.slice(
            startIndex,
            startIndex + pageSize
        )
    };
}


function renderPagination(totalPages) {
    pagination.replaceChildren();

    const previousButton = createPageButton(
        "‹",
        currentPage === 1,
        () => {
            currentPage--;
            renderAll();
        }
    );

    previousButton.setAttribute(
        "aria-label",
        "Previous page"
    );

    pagination.appendChild(previousButton);

    for (let page = 1; page <= totalPages; page++) {
        const button = createPageButton(
            String(page),
            false,
            () => {
                currentPage = page;
                renderAll();
            }
        );

        if (page === currentPage) {
            button.classList.add("active");

            button.setAttribute(
                "aria-current",
                "page"
            );
        }

        button.setAttribute(
            "aria-label",
            `Page ${page}`
        );

        pagination.appendChild(button);
    }

    const nextButton = createPageButton(
        "›",
        currentPage === totalPages,
        () => {
            currentPage++;
            renderAll();
        }
    );

    nextButton.setAttribute(
        "aria-label",
        "Next page"
    );

    pagination.appendChild(nextButton);
}


function createPageButton(label, disabled, callback) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "page-button";
    button.textContent = label;
    button.disabled = disabled;

    button.addEventListener("click", callback);

    return button;
}


/* =========================================
   13. TABLE RENDERING
========================================= */

function renderTable() {
    const filteredStudents = getFilteredStudents();

    const sortedStudents = getSortedStudents(
        filteredStudents
    );

    const pageData = getPageData(sortedStudents);

    studentTableBody.replaceChildren();

    if (pageData.pageStudents.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-state";

        cell.textContent = students.length === 0
            ? "No students registered yet."
            : "No matching student records found.";

        row.appendChild(cell);
        studentTableBody.appendChild(row);

    } else {
        pageData.pageStudents.forEach(student => {
            studentTableBody.appendChild(
                createStudentRow(student)
            );
        });
    }

    if (filteredStudents.length === 0) {
        tableInfo.textContent = "Showing 0 records";

    } else {
        const start = pageData.startIndex + 1;

        const end = Math.min(
            pageData.startIndex + pageData.pageSize,
            filteredStudents.length
        );

        tableInfo.textContent =
            `Showing ${start}–${end} of ${filteredStudents.length} records`;
    }

    renderPagination(pageData.totalPages);
}


function createStudentRow(student) {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.className = "student-id";
    idCell.textContent = student.studentId;

    const nameCell = document.createElement("td");
    nameCell.className = "student-name";
    nameCell.textContent = student.fullName;

    const emailCell = document.createElement("td");
    emailCell.className = "email-cell";
    emailCell.textContent = student.email;

    const phoneCell = document.createElement("td");
    phoneCell.textContent = student.phone;

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(student.registeredAt);

    const actionsCell = document.createElement("td");

    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "action-button edit";
    editButton.textContent = "Edit";

    editButton.setAttribute(
        "aria-label",
        `Edit ${student.fullName}`
    );

    editButton.addEventListener("click", () => {
        editStudent(student.studentId);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${student.fullName}`
    );

    deleteButton.addEventListener("click", () => {
        confirmDeleteStudent(student.studentId);
    });

    actions.append(editButton, deleteButton);

    actionsCell.appendChild(actions);

    row.append(
        idCell,
        nameCell,
        emailCell,
        phoneCell,
        dateCell,
        actionsCell
    );

    return row;
}


function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}


/* =========================================
   14. EDIT STUDENT
========================================= */

function editStudent(studentId) {
    const student = students.find(
        item => item.studentId === studentId
    );

    if (!student) {
        showMessage(
            "Student record could not be found.",
            "error"
        );

        return;
    }

    resetForm();

    editingStudentIdInput.value = student.studentId;

    studentIdInput.value = student.studentId;
    fullNameInput.value = student.fullName;
    emailInput.value = student.email;
    phoneInput.value = student.phone;

    /*
      Existing passwords are never stored.
      Therefore, editing requires a new password.
    */

    passwordInput.value = "";

    formTitle.textContent = "Edit Student";

    submitButton.textContent = "Save Changes";

    validationFields.forEach(([input, fieldName]) => {
        validateInput(input, fieldName);
    });

    passwordInput.classList.remove("valid", "invalid");

    passwordInput.removeAttribute("aria-invalid");

    document.getElementById(
        "passwordError"
    ).textContent = "";

    document.getElementById(
        "passwordHint"
    ).textContent =
        "Enter a new password to confirm this edit.";

    document.getElementById("registration").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    studentIdInput.focus();
}


/* =========================================
   15. DELETE STUDENT
========================================= */

function confirmDeleteStudent(studentId) {
    const student = students.find(
        item => item.studentId === studentId
    );

    if (!student) {
        return;
    }

    openConfirmation(
        "Delete Student?",
        `Are you sure you want to delete ${student.fullName}? This action cannot be undone.`,
        () => deleteStudent(studentId)
    );
}


function deleteStudent(studentId) {
    const originalStudents = [...students];

    students = students.filter(
        student => student.studentId !== studentId
    );

    if (!saveStudents()) {
        students = originalStudents;
        renderAll();
        return;
    }

    const pageSize = Number(pageSizeSelect.value);

    const filteredCount = getFilteredStudents().length;

    const maxPage = Math.max(
        1,
        Math.ceil(filteredCount / pageSize)
    );

    currentPage = Math.min(currentPage, maxPage);

    renderAll();

    showMessage(
        "Student record deleted successfully.",
        "success"
    );
}


/* =========================================
   16. CONFIRMATION DIALOG
========================================= */

function openConfirmation(title, message, callback) {
    dialogTitle.textContent = title;
    dialogMessage.textContent = message;

    pendingConfirmation = callback;

    confirmDialogButton.textContent = "Confirm";

    if (typeof confirmDialog.showModal === "function") {
        confirmDialog.showModal();
    } else {
        // Compatibility fallback for older browsers.
        if (window.confirm(message)) {
            callback();
        }
    }
}


cancelDialogButton.addEventListener("click", () => {
    pendingConfirmation = null;
    confirmDialog.close();
});


confirmDialogButton.addEventListener("click", () => {
    const callback = pendingConfirmation;

    pendingConfirmation = null;

    confirmDialog.close();

    if (callback) {
        callback();
    }
});


confirmDialog.addEventListener("close", () => {
    pendingConfirmation = null;
});


/* =========================================
   17. CSV EXPORT
========================================= */

exportButton.addEventListener("click", exportCSV);


function exportCSV() {
    const filteredStudents = getSortedStudents(
        getFilteredStudents()
    );

    if (filteredStudents.length === 0) {
        showMessage(
            "There are no student records to export.",
            "error"
        );

        return;
    }

    const headers = [
        "Student ID",
        "Full Name",
        "Email",
        "Phone",
        "Registration Date"
    ];

    const rows = filteredStudents.map(student => [
        student.studentId,
        student.fullName,
        student.email,
        student.phone,
        formatDate(student.registeredAt)
    ]);

    const csvContent = [
        headers,
        ...rows
    ]
        .map(row => row.map(escapeCSV).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const downloadURL = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = downloadURL;
    link.download = "student-records.csv";

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(downloadURL);

    showMessage(
        `${filteredStudents.length} student record(s) exported successfully.`,
        "success"
    );
}


function escapeCSV(value) {
    let safeValue = String(value ?? "");

    /*
      Reduce spreadsheet formula injection risk when opening
      CSV files in spreadsheet software.
    */

    if (/^[\s]*[=+\-@]/.test(safeValue)) {
        safeValue = "'" + safeValue;
    }

    return `"${safeValue.replace(/"/g, '""')}"`;
}


/* =========================================
   18. DASHBOARD STATISTICS
========================================= */

function renderStatistics() {
    totalStudentsElement.textContent = students.length;

    validStudentsElement.textContent = students.length;

    currentPageStatElement.textContent = currentPage;
}


/* =========================================
   19. RENDER APPLICATION
========================================= */

function renderAll() {
    renderTable();
    renderStatistics();
}


/* =========================================
   20. INITIALIZE APPLICATION
========================================= */

renderAll();