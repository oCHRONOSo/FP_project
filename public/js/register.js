function getCookie(name) {
    const cookieString = document.cookie;
    console.log(cookieString);
    const cookies = cookieString.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            // Decode and return the cookie value
            return decodeURIComponent(cookieValue);
        }
    }
    console.log("cookie not found");
    return null; // Return null if the cookie is not found
  }
  var storedOption = getCookie("selectedOption");
  if (storedOption) {
    // document.getElementById("themeSelect").value = storedOption;
    document.documentElement.setAttribute('data-bs-theme', storedOption);
  }
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

  // say hi :
  fetch('/userdata')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Use the fetched data as needed
        console.log('Username:', data.user.name);
        document.getElementById("user_username").innerText = "Hi " + data.user.name + " !";
        // You can set the username wherever needed in your app
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });