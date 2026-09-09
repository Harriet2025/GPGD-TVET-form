const API_ENDPOINT = "api/register";

const form = document.getElementById("registration-form");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s-()]{6,}$/;

function getCheckboxGroupValues(groupId) {
  const container = document.getElementById(groupId);
  return Array.from(container.querySelectorAll("input[type=checkbox]:checked")).map((input) => input.value);
}

function showFieldError(fieldId, message) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  const input = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message || "";
  if (input) input.classList.toggle("invalid", Boolean(message));
}

function isApprentice() {
  return document.getElementById("trainingCategory").value === "Apprentice Trainee";
}

// --- Conditional field toggling ---

const workTypeSelect = document.getElementById("workType");
const workTypeOtherGroup = document.getElementById("group-workTypeOther");
workTypeSelect.addEventListener("change", () => {
  workTypeOtherGroup.hidden = workTypeSelect.value !== "Other";
  if (workTypeSelect.value !== "Other") showFieldError("workTypeOther", "");
});

const educationLevelSelect = document.getElementById("educationLevel");
const educationLevelOtherGroup = document.getElementById("group-educationLevelOther");
educationLevelSelect.addEventListener("change", () => {
  educationLevelOtherGroup.hidden = educationLevelSelect.value !== "Other";
  if (educationLevelSelect.value !== "Other") showFieldError("educationLevelOther", "");
});

const trainingCategorySelect = document.getElementById("trainingCategory");
const apprenticeshipSection = document.getElementById("section-apprenticeship");
trainingCategorySelect.addEventListener("change", () => {
  apprenticeshipSection.hidden = !isApprentice();
});

document.querySelectorAll("input[data-other-toggle]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const targetGroup = document.getElementById(checkbox.dataset.otherToggle);
    const groupContainer = checkbox.closest(".checkbox-grid");
    const anyOtherChecked = groupContainer.querySelector("input[data-other-toggle]:checked");
    targetGroup.hidden = !anyOtherChecked;
    if (!anyOtherChecked) {
      const otherInput = targetGroup.querySelector("input");
      if (otherInput) otherInput.value = "";
    }
  });
});

// --- Validation ---

function validateSimpleFields() {
  let isValid = true;

  const requiredSelects = ["workType", "gender", "trainingCategory", "educationLevel", "toolsOwned", "abilityStatus"];
  requiredSelects.forEach((fieldId) => {
    const value = document.getElementById(fieldId).value;
    if (!value) {
      showFieldError(fieldId, "This field is required.");
      isValid = false;
    } else {
      showFieldError(fieldId, "");
    }
  });

  if (workTypeSelect.value === "Other") {
    const value = document.getElementById("workTypeOther").value.trim();
    if (!value) {
      showFieldError("workTypeOther", "Please specify your work type.");
      isValid = false;
    } else {
      showFieldError("workTypeOther", "");
    }
  }

  if (educationLevelSelect.value === "Other") {
    const value = document.getElementById("educationLevelOther").value.trim();
    if (!value) {
      showFieldError("educationLevelOther", "Please specify your education level.");
      isValid = false;
    } else {
      showFieldError("educationLevelOther", "");
    }
  }

  const fullName = document.getElementById("fullName").value.trim();
  if (fullName.length < 2) {
    showFieldError("fullName", "Full name is required.");
    isValid = false;
  } else {
    showFieldError("fullName", "");
  }

  const dateOfBirth = document.getElementById("dateOfBirth").value;
  if (!dateOfBirth) {
    showFieldError("dateOfBirth", "Date of birth is required.");
    isValid = false;
  } else {
    showFieldError("dateOfBirth", "");
  }

  const physicalAddress = document.getElementById("physicalAddress").value.trim();
  if (!physicalAddress) {
    showFieldError("physicalAddress", "Physical address is required.");
    isValid = false;
  } else {
    showFieldError("physicalAddress", "");
  }

  const contactNumber = document.getElementById("contactNumber").value.trim();
  if (!phonePattern.test(contactNumber)) {
    showFieldError("contactNumber", "Enter a valid contact number.");
    isValid = false;
  } else {
    showFieldError("contactNumber", "");
  }

  const email = document.getElementById("email").value.trim();
  if (email && !emailPattern.test(email)) {
    showFieldError("email", "Enter a valid email address, or leave it blank.");
    isValid = false;
  } else {
    showFieldError("email", "");
  }

  const declarationName = document.getElementById("declarationName").value.trim();
  if (!declarationName) {
    showFieldError("declarationName", "Your name is required to confirm the declaration.");
    isValid = false;
  } else {
    showFieldError("declarationName", "");
  }

  const declarationConfirmed = document.getElementById("declarationConfirmed").checked;
  if (!declarationConfirmed) {
    showFieldError("declarationConfirmed", "You must confirm the declaration.");
    isValid = false;
  } else {
    showFieldError("declarationConfirmed", "");
  }

  return isValid;
}

function validateCheckboxGroups() {
  let isValid = true;

  if (getCheckboxGroupValues("group-trainingPurpose").length === 0) {
    showFieldError("trainingPurpose", "Select at least one training purpose.");
    isValid = false;
  } else {
    showFieldError("trainingPurpose", "");
  }

  const mainSkillArea = getCheckboxGroupValues("group-mainSkillArea");
  if (mainSkillArea.length === 0) {
    showFieldError("mainSkillArea", "Select at least one skill area.");
    isValid = false;
  } else {
    showFieldError("mainSkillArea", "");
  }
  if (mainSkillArea.includes("Other")) {
    const value = document.getElementById("mainSkillAreaOther").value.trim();
    if (!value) {
      showFieldError("mainSkillAreaOther", "Please specify the skill area.");
      isValid = false;
    } else {
      showFieldError("mainSkillAreaOther", "");
    }
  }

  return isValid;
}

function validateApprenticeshipFields() {
  if (!isApprentice()) return true;

  let isValid = true;

  const masterName = document.getElementById("masterName").value.trim();
  if (!masterName) {
    showFieldError("masterName", "Master's name is required.");
    isValid = false;
  } else {
    showFieldError("masterName", "");
  }

  const masterContactNumber = document.getElementById("masterContactNumber").value.trim();
  if (!phonePattern.test(masterContactNumber)) {
    showFieldError("masterContactNumber", "Enter a valid contact number.");
    isValid = false;
  } else {
    showFieldError("masterContactNumber", "");
  }

  const masterSpecialization = getCheckboxGroupValues("group-masterSpecialization");
  if (masterSpecialization.length === 0) {
    showFieldError("masterSpecialization", "Select at least one specialization.");
    isValid = false;
  } else {
    showFieldError("masterSpecialization", "");
  }
  if (masterSpecialization.includes("Other")) {
    const value = document.getElementById("masterSpecializationOther").value.trim();
    if (!value) {
      showFieldError("masterSpecializationOther", "Please specify the specialization.");
      isValid = false;
    } else {
      showFieldError("masterSpecializationOther", "");
    }
  }

  const workshopName = document.getElementById("workshopName").value.trim();
  if (!workshopName) {
    showFieldError("workshopName", "Workshop or company name is required.");
    isValid = false;
  } else {
    showFieldError("workshopName", "");
  }

  const workshopLocation = document.getElementById("workshopLocation").value.trim();
  if (!workshopLocation) {
    showFieldError("workshopLocation", "Workshop location is required.");
    isValid = false;
  } else {
    showFieldError("workshopLocation", "");
  }

  const apprenticeshipDuration = document.getElementById("apprenticeshipDuration").value;
  if (!apprenticeshipDuration) {
    showFieldError("apprenticeshipDuration", "Please select a duration.");
    isValid = false;
  } else {
    showFieldError("apprenticeshipDuration", "");
  }

  return isValid;
}

function setFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = "form-status" + (type ? ` ${type}` : "");
}

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.querySelector(".btn-text").textContent = isSubmitting ? "Submitting..." : "Submit Registration";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormStatus("", "");

  const simpleValid = validateSimpleFields();
  const checkboxValid = validateCheckboxGroups();
  const apprenticeshipValid = validateApprenticeshipFields();

  if (!simpleValid || !checkboxValid || !apprenticeshipValid) {
    setFormStatus("Please correct the errors above and try again.", "error");
    return;
  }

  const apprentice = isApprentice();

  const payload = {
    work_type: workTypeSelect.value,
    work_type_other: workTypeSelect.value === "Other" ? document.getElementById("workTypeOther").value.trim() : null,
    training_purpose: getCheckboxGroupValues("group-trainingPurpose"),
    full_name: document.getElementById("fullName").value.trim(),
    gender: document.getElementById("gender").value,
    date_of_birth: document.getElementById("dateOfBirth").value,
    physical_address: document.getElementById("physicalAddress").value.trim(),
    contact_number: document.getElementById("contactNumber").value.trim(),
    email: document.getElementById("email").value.trim() || null,
    training_category: trainingCategorySelect.value,

    education_level: educationLevelSelect.value,
    education_level_other: educationLevelSelect.value === "Other" ? document.getElementById("educationLevelOther").value.trim() : null,

    master_name: apprentice ? document.getElementById("masterName").value.trim() : null,
    master_specialization: apprentice ? getCheckboxGroupValues("group-masterSpecialization") : [],
    master_specialization_other: apprentice ? document.getElementById("masterSpecializationOther").value.trim() || null : null,
    master_contact_number: apprentice ? document.getElementById("masterContactNumber").value.trim() : null,
    workshop_name: apprentice ? document.getElementById("workshopName").value.trim() : null,
    workshop_location: apprentice ? document.getElementById("workshopLocation").value.trim() : null,
    apprenticeship_duration: apprentice ? document.getElementById("apprenticeshipDuration").value : null,

    main_skill_area: getCheckboxGroupValues("group-mainSkillArea"),
    main_skill_area_other: document.getElementById("mainSkillAreaOther").value.trim() || null,
    tools_owned: document.getElementById("toolsOwned").value,

    ability_status: document.getElementById("abilityStatus").value,

    declaration_confirmed: document.getElementById("declarationConfirmed").checked,
    declaration_name: document.getElementById("declarationName").value.trim(),
  };

  setSubmitting(true);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed (status ${response.status}).`);
    }

    setFormStatus("Registration successful! We'll be in touch shortly.", "success");
    form.reset();
    workTypeOtherGroup.hidden = true;
    educationLevelOtherGroup.hidden = true;
    apprenticeshipSection.hidden = true;
    document.getElementById("group-masterSpecializationOther").hidden = true;
    document.getElementById("group-mainSkillAreaOther").hidden = true;
  } catch (error) {
    setFormStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    setSubmitting(false);
  }
});
