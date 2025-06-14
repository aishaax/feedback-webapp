async function loadFeedbacks() {
  const res = await fetch("/feedbacks");
  const feedbacks = await res.json();
  const list = document.getElementById("feedbackList");
  list.innerHTML = "";
  feedbacks.forEach((fb) => {
    const li = document.createElement("li");
    li.textContent = `${fb.username}: ${fb.message}`;
    list.appendChild(li);
  });
}

document.getElementById("feedbackForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = localStorage.getItem("userId");
  const message = document.getElementById("message").value;

  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message }),
  });

  if (res.ok) {
    document.getElementById("message").value = "";
    loadFeedbacks();
  } else {
    alert("Please login to submit feedback.");
    window.location.href = "login.html";
  }
});

window.onload = () => {
  if (!localStorage.getItem("userId")) {
    alert("Please login first.");
    window.location.href = "login.html";
  } else {
    loadFeedbacks();
  }
};
