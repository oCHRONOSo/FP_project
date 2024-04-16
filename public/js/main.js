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
        document.getElementById("user_username").innerText = "Hello " + data.user.name;
        // You can set the username wherever needed in your app
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });