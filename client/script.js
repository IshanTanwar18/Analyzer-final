async function fetchFoodData() {
    const foodItem = document.getElementById("foodInput").value;
    const userId = localStorage.getItem("userId");
    if (!foodItem) {
        alert("Please enter a food item!");
        return;
    }
    if (!userId) {
        alert("User not logged in!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/food?food=${foodItem}&userId=${userId}`);

        if (!response.ok) {  // Handle HTTP errors
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
            document.getElementById("result").innerHTML = `<p style="color: red;">${data.error}</p>`;
        } else {
            document.getElementById("result").innerHTML = `
                <h3>Food: ${data.name}</h3>
                <p>Calories: ${data.calories} kcal</p>
                <p>Protein: ${data.protein} g</p>
                <p>Carbs: ${data.carbs} g</p>
                <p>Fats: ${data.fats} g</p>
                <h4>🏃 Running Distance: ${data.runningDistance} km</h4>
            `;
        }
    } catch (error) {
        console.error("Error fetching food data:", error);
        document.getElementById("result").innerHTML = `<p style="color: red;">Failed to fetch data</p>`;
    }
}
//dashboard
 // Update with your backend URL

// 🟢 This function runs when dashboard.html loads
async function loadDashboard() {
    const userId = localStorage.getItem("userId"); 
    const token = localStorage.getItem("token"); // Check if user is logged in
    console.log("Token:", token);  // Debugging: Check if token exists
    console.log("User ID:", userId);  // Debugging: Check if userId exists

    if (!token || !userId) { // Check both token & userId
        window.location.href = "index.html"; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/user/profile-with-foods?userId=${userId}`, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("Response from server:", data); // Debugging
        if (response.ok) {
            document.getElementById("userName").textContent = data.name;
            displayFoodHistory(data.foodHistory);
        } else {
            console.log("Invalid response,possible session expired");
            alert("Session expired, please log in again.");
            logout();
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
        logout();
    }
}

// 🟢 Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "index.html"; // Redirect to login page
}

function displayFoodHistory(foodHistory) {
    const historyContainer = document.getElementById("foodHistory");
    historyContainer.innerHTML = "<h3>Your Food Search History</h3>"; // Reset & add heading

    if (foodHistory.length === 0) {
        historyContainer.innerHTML += "<p>No food search history available.</p>";
        return;
    }

    const list = document.createElement("ul");
    foodHistory.forEach(food => {
        const listItem = document.createElement("li");
        listItem.textContent = `${food.name} - ${food.calories} kcal`;
        list.appendChild(listItem);
    });

    historyContainer.appendChild(list);
}
//login
async function login() {
    

    const email = document.getElementById("emaill").value;
    const password = document.getElementById("passwordd").value;

    const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id); // Store user ID
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
        alert(data.message);
    }
}

async function register() {
    

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/api/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Done");
            alert("Registration successful! Redirecting to dashboard...");
            localStorage.setItem("token", data.token); // Store token
            localStorage.setItem("userId", data.user.id); // Store user ID
            window.location.href = "dashboard.html"; // Redirect to dashboard
        } else {
            alert(data.message || "Registration failed. Try again.");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred. Please try again.");
    }
}

           