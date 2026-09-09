const SESSION_ENDPOINT = "/api/admin/session";
const LOGIN_ENDPOINT = "/api/admin/login";
const LOGOUT_ENDPOINT = "/api/admin/logout";
const APPLICANTS_ENDPOINT = "/api/admin/applicants";

const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const loginStatus = document.getElementById("login-status");
const logoutBtn = document.getElementById("logout-btn");

const adminMain = document.getElementById("admin-main");
const tableBody = document.getElementById("table-body");
const tableStatus = document.getElementById("table-status");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const refreshBtn = document.getElementById("refresh-btn");
const toast = document.getElementById("toast");

const detailsModal = document.getElementById("details-modal");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCloseBtn2 = document.getElementById("modal-close-btn-2");

let applicants = [];
let toastTimer = null;

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function showToast(message, type) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = "toast show" + (type ? ` ${type}` : "");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

function showLoggedInUI() {
  loginScreen.hidden = true;
  adminMain.hidden = false;
  logoutBtn.hidden = false;
  loadApplicants();
}

function showLoggedOutUI() {
  loginScreen.hidden = false;
  adminMain.hidden = true;
  logoutBtn.hidden = true;
}

async function checkSession() {
  try {
    const response = await fetch(SESSION_ENDPOINT, { headers: { Accept: "application/json" } });
    const data = await response.json();
    if (data.authenticated) {
      showLoggedInUI();
    } else {
      showLoggedOutUI();
    }
  } catch (error) {
    showLoggedOutUI();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "";
  loginStatus.className = "form-status";
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("login-username").value.trim(),
        password: document.getElementById("login-password").value,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Invalid username or password.");
    }

    loginForm.reset();
    showLoggedInUI();
  } catch (error) {
    loginStatus.textContent = error.message || "Something went wrong. Please try again.";
    loginStatus.classList.add("error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Log In";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await fetch(LOGOUT_ENDPOINT, { method: "POST" });
  } finally {
    showLoggedOutUI();
  }
});

function matchesFilters(applicant) {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const matchesQuery =
    !query ||
    applicant.full_name.toLowerCase().includes(query) ||
    applicant.work_type.toLowerCase().includes(query) ||
    (applicant.contact_number || "").toLowerCase().includes(query);

  const matchesCategory = !category || applicant.training_category === category;

  return matchesQuery && matchesCategory;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderTable() {
  const filtered = applicants.filter(matchesFilters);

  if (filtered.length === 0) {
    tableBody.innerHTML = "";
    tableStatus.hidden = false;
    tableStatus.classList.remove("error");
    tableStatus.textContent = applicants.length === 0
      ? "No applicants have registered yet."
      : "No results match your search or filter.";
    return;
  }

  tableStatus.hidden = true;

  tableBody.innerHTML = filtered
    .map((applicant, index) => `
      <tr data-index="${index}">
        <td><strong>${escapeHtml(applicant.full_name)}</strong></td>
        <td>${escapeHtml(applicant.work_type === "Other" ? applicant.work_type_other : applicant.work_type)}</td>
        <td>${escapeHtml(applicant.training_category)}</td>
        <td class="cell-muted">${escapeHtml(applicant.contact_number)}</td>
        <td>${escapeHtml(applicant.education_level === "Other" ? applicant.education_level_other : applicant.education_level)}</td>
        <td class="cell-muted">${formatDate(applicant.submitted_at)}</td>
        <td class="col-action">
          <button type="button" class="row-action-btn" data-applicant-id="${escapeHtml(String(applicant.applicant_id))}">
            View Details
          </button>
        </td>
      </tr>
    `)
    .join("");

  tableBody.querySelectorAll(".row-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const applicantId = btn.dataset.applicantId;
      const applicant = applicants.find((item) => String(item.applicant_id) === String(applicantId));
      if (applicant) openDetailsModal(applicant);
    });
  });
}

function detailRow(label, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<div class="detail-row"><span class="detail-label">${escapeHtml(label)}</span><span class="detail-value">${escapeHtml(value)}</span></div>`;
}

function openDetailsModal(applicant) {
  const workType = applicant.work_type === "Other" ? applicant.work_type_other : applicant.work_type;
  const educationLevel = applicant.education_level === "Other" ? applicant.education_level_other : applicant.education_level;

  let html = "";
  html += `<h3>Personal Details</h3>`;
  html += detailRow("Work Type", workType);
  html += detailRow("Training Purpose", applicant.training_purpose);
  html += detailRow("Full Name", applicant.full_name);
  html += detailRow("Gender", applicant.gender);
  html += detailRow("Date of Birth", applicant.date_of_birth);
  html += detailRow("Physical Address", applicant.physical_address);
  html += detailRow("Contact Number", applicant.contact_number);
  html += detailRow("Email", applicant.email);
  html += detailRow("Training Category", applicant.training_category);

  html += `<h3>Educational Background</h3>`;
  html += detailRow("Highest Education Level", educationLevel);

  if (applicant.training_category === "Apprentice Trainee") {
    html += `<h3>Apprenticeship Details</h3>`;
    html += detailRow("Master's Name", applicant.master_name);
    html += detailRow(
      "Master's Specialization",
      applicant.master_specialization === "Other" ? applicant.master_specialization_other : applicant.master_specialization
    );
    html += detailRow("Master's Contact Number", applicant.master_contact_number);
    html += detailRow("Workshop or Company Name", applicant.workshop_name);
    html += detailRow("Workshop Location", applicant.workshop_location);
    html += detailRow("Apprenticeship Duration", applicant.apprenticeship_duration);
  }

  html += `<h3>Skills &amp; Professional Experience</h3>`;
  html += detailRow(
    "Main Skill Area",
    applicant.main_skill_area && applicant.main_skill_area.includes("Other") && applicant.main_skill_area_other
      ? `${applicant.main_skill_area} (${applicant.main_skill_area_other})`
      : applicant.main_skill_area
  );
  html += detailRow("Tools Owned", applicant.tools_owned);

  html += `<h3>Health &amp; Safety</h3>`;
  html += detailRow("Ability Status", applicant.ability_status);

  html += `<h3>Declaration</h3>`;
  html += detailRow("Confirmed By", applicant.declaration_name);
  html += detailRow("Submitted", formatDate(applicant.submitted_at));

  modalBody.innerHTML = html;
  detailsModal.hidden = false;
}

function closeDetailsModal() {
  detailsModal.hidden = true;
}

modalCloseBtn.addEventListener("click", closeDetailsModal);
modalCloseBtn2.addEventListener("click", closeDetailsModal);
detailsModal.addEventListener("click", (event) => {
  if (event.target === detailsModal) closeDetailsModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !detailsModal.hidden) closeDetailsModal();
});

async function loadApplicants() {
  tableStatus.hidden = false;
  tableStatus.classList.remove("error");
  tableStatus.textContent = "Loading applicants...";
  tableBody.innerHTML = "";
  refreshBtn.disabled = true;

  try {
    const response = await fetch(APPLICANTS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (response.status === 401) {
      showLoggedOutUI();
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to load applicants (status ${response.status}).`);
    }

    const data = await response.json();
    applicants = Array.isArray(data) ? data : [];
    renderTable();
  } catch (error) {
    tableStatus.hidden = false;
    tableStatus.classList.add("error");
    tableStatus.textContent = error.message || "Something went wrong while loading applicants.";
  } finally {
    refreshBtn.disabled = false;
  }
}

searchInput.addEventListener("input", renderTable);
categoryFilter.addEventListener("change", renderTable);
refreshBtn.addEventListener("click", loadApplicants);

checkSession();
