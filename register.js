const API_ENDPOINT = "/api/register";

const form = document.getElementById("registration-form");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");

const fields = ["firstName", "lastName", "email", "phone", "targetGroup", "level"];

const validators = {
  firstName: (value) => {
    if (!value.trim()) return "First name is required.";
    if (value.trim().length < 2) return "First name must be at least 2 characters.";
    return "";
  },
  lastName: (value) => {
    if (!value.trim()) return "Last name is required.";
    if (value.trim().length < 2) return "Last name must be at least 2 characters.";
    return "";
  },
  email: (value) => {
    if (!value.trim()) return "Email address is required.";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
    return "";
  },
  phone: (value) => {
    if (!value.trim()) return "Phone number is required.";
    const phonePattern = /^[+\d][\d\s-()]{6,}$/;
    if (!phonePattern.test(value.trim())) return "Enter a valid phone number.";
    return "";
  },
  targetGroup: (value) => {
    if (!value) return "Please select a target group.";
    return "";
  },
  level: (value) => {
    if (!value) return "Please select a level.";
    return "";
  },
};

function showFieldError(fieldName, message) {
  const input = document.getElementById(fieldName);
  const errorEl = document.getElementById(`error-${fieldName}`);
  if (message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }
}

function validateField(fieldName) {
  const input = document.getElementById(fieldName);
  const message = validators[fieldName](input.value);
  showFieldError(fieldName, message);
  return message === "";
}

function validateForm() {
  let isValid = true;
  fields.forEach((fieldName) => {
    if (!validateField(fieldName)) {
      isValid = false;
    }
  });
  return isValid;
}

fields.forEach((fieldName) => {
  const input = document.getElementById(fieldName);
  input.addEventListener("blur", () => validateField(fieldName));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) validateField(fieldName);
  });
});

function setFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = "form-status" + (type ? ` ${type}` : "");
}

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.querySelector(".btn-text").textContent = isSubmitting
    ? "Submitting..."
    : "Submit Registration";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormStatus("", "");

  if (!validateForm()) {
    setFormStatus("Please correct the errors above and try again.", "error");
    return;
  }

  const payload = {
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone_number: document.getElementById("phone").value.trim(),
    target_group: document.getElementById("targetGroup").value,
    level_id: Number(document.getElementById("level").value),
  };

  setSubmitting(true);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed (status ${response.status}).`);
    }

    setFormStatus("Registration successful! We'll be in touch shortly.", "success");
    form.reset();
    fields.forEach((fieldName) => showFieldError(fieldName, ""));
  } catch (error) {
    setFormStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    setSubmitting(false);
  }
});
