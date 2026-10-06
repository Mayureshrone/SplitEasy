const usernameBB = document.getElementById("name");
const emailBB = document.getElementById("email");
const passwordBB = document.getElementById("password");
const confirmPasswordBB = document.getElementById("confirm-password");
const formBB = document.getElementById("signUp");

const isrequired = (value) => value === "" ? false : true;
const isBetween = (length, min, max) => length < min || length > max ? false : true;

const showError = (input, message) => {
    const formField = input.parentElement;
    formField.classList.remove("success");
    formField.classList.add("error");
    const error = formField.querySelector("small");
    error.textContent = message;
};

const isEmailValid = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

const isPasswordValid = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
}

const showSuccess = (input) => {
    const formField = input.parentElement;
    formField.classList.remove("error");
    formField.classList.add("success");
    const error = formField.querySelector("small");
    error.textContent = "";
};

const checkUsername = () => {
    let valid = false;
    const min = 3, max = 25;
    const username = usernameBB.value.trim();
    if (!isrequired(username)) {
        showError(usernameBB, "Username cannot be empty");
    } else if (!isBetween(username.length, min, max)) {
        showError(usernameBB, `Username must be between ${min} and ${max} characters`);
    } else {
        showSuccess(usernameBB);
        valid = true;
    }
    return valid;
};

const checkEmail = () => {
    let valid = false;
    const email = emailBB.value.trim();
    if (!isrequired(email)) {
        showError(emailBB, "Email cannot be empty");
    } else if (!isEmailValid(email)) {
        showError(emailBB, "Email is not in valid format");
    } else {
        showSuccess(emailBB);
        valid = true;
    }
    return valid;
};

const checkPassword = () => {
    let valid = false;
    const password = passwordBB.value.trim();
    if (!isrequired(password)) {
        showError(passwordBB, "Password cannot be empty");
    } else if (!isPasswordValid(password)) {
        showError(passwordBB, "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 19 special character");
    } else {
        showSuccess(passwordBB);
        valid = true;
    }
    return valid;
};

const checkConfirmPassword = () => {
    let valid = false;
    const confirmPassword = confirmPasswordBB.value.trim();
    const password = passwordBB.value.trim();
    if (!isrequired(confirmPassword)) {
        showError(confirmPasswordBB, "Please enter the password again");
    } else if (password !== confirmPassword) {
        showError(confirmPasswordBB, "The password does not match");
    } else {
        showSuccess(confirmPasswordBB);
        valid = true;
    }
    return valid;
}



formBB.addEventListener("submit", function (e) {
    e.preventDefault();
    let isUsernameValid = checkUsername(),
        isEmailValid = checkEmail(),
        isPasswordValid = checkPassword(),
        isConfirmPasswordValid = checkConfirmPassword();
    let isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
});

formBB.addEventListener("input", function (e) {
    switch (e.target.id) {
        case "name":
            checkUsername();
            break;
        case "email":
            checkEmail();
            break;
        case "confirm-password":
            checkConfirmPassword();
            break;
        case "password":
            checkPassword();
            break;
    }
});