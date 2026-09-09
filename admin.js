const ENROLLMENTS_ENDPOINT = "/api/admin/enrollments";
const GRADES_ENDPOINT = "/api/grades";

const tableBody = document.getElementById("table-body");
const tableStatus = document.getElementById("table-status");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const refreshBtn = document.getElementById("refresh-btn");
const toast = document.getElementById("toast");

const modal = document.getElementById("grade-modal");
const modalStudentName = document.getElementById("modal-student-name");
const modalTrackName = document.getElementById("modal-track-name");
const modalAssessmentType = document.getElementById("modal-assessment-type");
const modalScoreInput = document.getElementById("modal-score");
const modalStatusSelect = document.getElementById("modal-status");
const modalScoreError = document.getElementById("error-modal-score");
const modalStatusMessage = document.getElementById("modal-status-message");
const gradeForm = document.getElementById("grade-form");
const modalSaveBtn = document.getElementById("modal-save-btn");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");

let enrollments = [];
let activeEnrollment = null;
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

function statusToClass(status) {
  return "status-" + (status || "pending").toLowerCase().replace(/\s+/g, "-");
}

function renderStatusBadge(status) {
  const label = status || "Pending";
  return `<span class="status-badge ${statusToClass(label)}">${escapeHtml(label)}</span>`;
}

function renderScore(score) {
  if (score === null || score === undefined || score === "") {
    return `<span class="score-value empty">Not graded</span>`;
  }
  return `<span class="score-value">${escapeHtml(String(score))}</span>`;
}

function matchesFilters(enrollment) {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  const matchesQuery =
    !query ||
    enrollment.student_name.toLowerCase().includes(query) ||
    enrollment.student_email.toLowerCase().includes(query) ||
    enrollment.track_title.toLowerCase().includes(query) ||
    enrollment.track_code.toLowerCase().includes(query);

  const matchesStatus = !status || (enrollment.status || "Pending") === status;

  return matchesQuery && matchesStatus;
}

function renderTable() {
  const filtered = enrollments.filter(matchesFilters);

  if (filtered.length === 0) {
    tableBody.innerHTML = "";
    tableStatus.hidden = false;
    tableStatus.classList.remove("error");
    tableStatus.textContent = enrollments.length === 0
      ? "No enrollments found."
      : "No results match your search or filter.";
    return;
  }

  tableStatus.hidden = true;

  tableBody.innerHTML = filtered
    .map((enrollment, index) => `
      <tr data-index="${index}">
        <td>
          <div class="cell-student">
            <strong>${escapeHtml(enrollment.student_name)}</strong>
          </div>
        </td>
        <td class="cell-muted">${escapeHtml(enrollment.student_email)}</td>
        <td>${escapeHtml(enrollment.track_code)} &mdash; ${escapeHtml(enrollment.track_title)}</td>
        <td>${escapeHtml(enrollment.assessment_type || "Not set")}</td>
        <td>${renderScore(enrollment.score)}</td>
        <td>${renderStatusBadge(enrollment.status)}</td>
        <td class="col-action">
          <button type="button" class="row-action-btn" data-enrollment-id="${escapeHtml(String(enrollment.enrollment_id))}">
            Enter Score
          </button>
        </td>
      </tr>
    `)
    .join("");

  tableBody.querySelectorAll(".row-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const enrollmentId = btn.dataset.enrollmentId;
      const enrollment = enrollments.find(
        (item) => String(item.enrollment_id) === String(enrollmentId)
      );
      if (enrollment) openModal(enrollment);
    });
  });
}

async function loadEnrollments() {
  tableStatus.hidden = false;
  tableStatus.classList.remove("error");
  tableStatus.textContent = "Loading enrollments...";
  tableBody.innerHTML = "";
  refreshBtn.disabled = true;

  try {
    const response = await fetch(ENROLLMENTS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to load enrollments (status ${response.status}).`);
    }

    const data = await response.json();
    enrollments = Array.isArray(data) ? data : [];
    renderTable();
  } catch (error) {
    tableStatus.hidden = false;
    tableStatus.classList.add("error");
    tableStatus.textContent = error.message || "Something went wrong while loading enrollments.";
  } finally {
    refreshBtn.disabled = false;
  }
}

function openModal(enrollment) {
  activeEnrollment = enrollment;
  modalStudentName.textContent = enrollment.student_name;
  modalTrackName.textContent = `${enrollment.track_code} — ${enrollment.track_title}`;
  modalAssessmentType.value = enrollment.assessment_type || "Quiz";
  modalScoreInput.value = enrollment.score ?? "";
  modalStatusSelect.value = enrollment.status || "Pending";
  modalScoreError.textContent = "";
  modalScoreInput.classList.remove("invalid");
  modalStatusMessage.textContent = "";
  modalStatusMessage.className = "form-status";
  modal.hidden = false;
  modalScoreInput.focus();
}

function closeModal() {
  modal.hidden = true;
  activeEnrollment = null;
  gradeForm.reset();
}

function validateScore(value) {
  if (value === "" || value === null) return "Score is required.";
  const num = Number(value);
  if (Number.isNaN(num)) return "Score must be a number.";
  if (num < 0 || num > 100) return "Score must be between 0 and 100.";
  return "";
}

gradeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!activeEnrollment) return;

  const scoreError = validateScore(modalScoreInput.value);
  if (scoreError) {
    modalScoreInput.classList.add("invalid");
    modalScoreError.textContent = scoreError;
    return;
  }
  modalScoreInput.classList.remove("invalid");
  modalScoreError.textContent = "";

  const payload = {
    enrollment_id: activeEnrollment.enrollment_id,
    assessment_type: modalAssessmentType.value,
    score: Number(modalScoreInput.value),
    status: modalStatusSelect.value,
  };

  const hasExistingGrade = Boolean(activeEnrollment.grade_id);
  if (hasExistingGrade) {
    payload.grade_id = activeEnrollment.grade_id;
  }

  modalSaveBtn.disabled = true;
  modalSaveBtn.textContent = "Saving...";
  modalStatusMessage.textContent = "";
  modalStatusMessage.className = "form-status";

  try {
    const response = await fetch(GRADES_ENDPOINT, {
      method: hasExistingGrade ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save score (status ${response.status}).`);
    }

    const saved = await response.json().catch(() => ({}));

    activeEnrollment.score = payload.score;
    activeEnrollment.status = payload.status;
    activeEnrollment.assessment_type = payload.assessment_type;
    if (saved.grade_id) activeEnrollment.grade_id = saved.grade_id;

    renderTable();
    showToast("Score saved successfully.", "success");
    closeModal();
  } catch (error) {
    modalStatusMessage.textContent = error.message || "Something went wrong. Please try again.";
    modalStatusMessage.classList.add("error");
  } finally {
    modalSaveBtn.disabled = false;
    modalSaveBtn.textContent = "Save Score";
  }
});

modalCloseBtn.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
refreshBtn.addEventListener("click", loadEnrollments);

loadEnrollments();
