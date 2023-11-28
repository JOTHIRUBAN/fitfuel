const form = document.getElementById("form");
const username = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const mobile = document.getElementById("mobile");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    validateInputs() &&
    password.parentElement.classList.contains("success")
  ) {
    form.submit();
  }
});

const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  if (errorDisplay) {
    errorDisplay.innerText = message;
    inputControl.classList.add("error");
    inputControl.classList.remove("success");
  }
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  if (errorDisplay) {
    errorDisplay.innerText = "";
    inputControl.classList.add("success");
    inputControl.classList.remove("error");
  }
};

const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidMobile = (mobile) => {
  const re = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
  return re.test(String(mobile));
};

const validateInputs = () => {
  let isValid = true;

  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const mobileValue = mobile.value.trim();

  if (usernameValue === "") {
    setError(username, "Username is required");
    isValid = false;
  } else {
    setSuccess(username);
  }

  if (mobileValue === "") {
    setError(mobile, "Mobile Number is required");
    isValid = false;
  } else if (!isValidMobile(mobileValue)) {
    setError(mobile, "Provide a valid mobile number");
    isValid = false;
  } else {
    setSuccess(mobile);
  }

  if (emailValue === "") {
    setError(email, "Email is required");
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setError(email, "Provide a valid email address");
    isValid = false;
  } else {
    setSuccess(email);
  }

  return isValid;
};

const validatePass = () => {
  const passwordValue = password.value.trim();

  if (passwordValue.length < 8) {
    setError(password, "Password must be at least 8 characters");
  } else if (!/\d/.test(passwordValue)) {
    setError(password, "Password must contain at least one digit");
  } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordValue)) {
    setError(password, "Password must contain at least one special character");
  } else {
    setSuccess(password);
  }
};

password.addEventListener("keyup", (e) => {
  const key = e.key;
  if (key === "Backspace") {
    validatePass();
  }
});

setInterval(validatePass, 500);
