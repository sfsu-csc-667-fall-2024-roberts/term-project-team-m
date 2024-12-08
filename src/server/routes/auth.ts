// Function to handle the login form submission
async function handleLogin(event: SubmitEvent): Promise<void> {
    event.preventDefault(); // Prevent the default form submission behavior
    const form = event.target as HTMLFormElement;
  
    // Collect username and password
    const username = (form.querySelector("#username") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;
  
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        window.location.href = "/lobby.html";
      } else {
        const errorMessage = await response.text();
        alert(`Login failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  }
  
  async function handleSignup(event: SubmitEvent): Promise<void> {
    event.preventDefault(); 
    const form = event.target as HTMLFormElement;
  
    // Collect username, password, and confirm password
    const username = (form.querySelector("#username") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;
    const confirmPassword = (form.querySelector("#confirmPassword") as HTMLInputElement).value;
  
    // Validate password confirmation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        alert("Signup successful! Please log in.");
        window.location.href = "/login.html";
      } else {
        const errorMessage = await response.text();
        alert(`Signup failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred. Please try again.");
    }
  }
  

  document.querySelector("form[action='/login']")?.addEventListener("submit", handleLogin);
  document.querySelector("form[action='/signup']")?.addEventListener("submit", handleSignup);
  