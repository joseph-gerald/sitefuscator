const submit = document.getElementById("submit");
const username = document.getElementById("username");
const password = document.getElementById("password");

submit.addEventListener("click", () => {
    alert(`username: ${username.value}\npassword: ${password.value}`)
})