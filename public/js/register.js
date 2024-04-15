form = document.getElementById("form");
username = document.getElementById("username");
email = document.getElementById("email");
password = document.getElementById("password");
passwordConfirm = document.getElementById("passwordConfirm");
form.addEventListener("submit", () => {
    const register = {
        username: username.value,
        email: email.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value
    }
    fetch ("/auth/register",{
        method: "POST",
        body: JSON.stringify(register),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.json())
        .then(data =>{
             if (data.status == "error") {
                success.style.display = "none"
                error.style.display = "block"
                error.innerText = data.error
             } else{
                error.style.display = "none"
                success.style.display = "block"
                success.innerText = data.success
                window.location.href = "/app"
             }
        })
})