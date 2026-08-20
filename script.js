const launchDateElement = document.getElementById("launchDate");
const targetTime = new Date(launchDateElement.dateTime).getTime();

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const notifyForm = document.getElementById("notifyForm");
const notifyEmail = document.getElementById("notifyEmail");
const notifyWhatsapp = document.getElementById("notifyWhatsapp");
const notifyMessage = document.getElementById("notifyMessage");

function pad(value) {
  return String(value).padStart(2, "0");
}

function isValidWhatsapp(value) {
  return /^\+?[0-9]{10,15}$/.test(value.replace(/\s+/g, ""));
}

function setCountdown() {
  const now = Date.now();
  const remaining = targetTime - now;

  if (remaining <= 0) {
    daysElement.textContent = "00";
    hoursElement.textContent = "00";
    minutesElement.textContent = "00";
    secondsElement.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  daysElement.textContent = pad(days);
  hoursElement.textContent = pad(hours);
  minutesElement.textContent = pad(minutes);
  secondsElement.textContent = pad(seconds);
}

setCountdown();
setInterval(setCountdown, 1000);

async function submitNotify(event) {
  event.preventDefault();

  notifyMessage.textContent = "";
  notifyMessage.classList.remove("is-error", "is-success");

  const email = notifyEmail.value.trim().toLowerCase();
  const whatsapp = notifyWhatsapp.value.trim();

  if (!email) {
    notifyMessage.textContent = "Please enter your email address.";
    notifyMessage.classList.add("is-error");
    return;
  }
  if (!whatsapp) {
    notifyMessage.textContent = "Please enter your WhatsApp number.";
    notifyMessage.classList.add("is-error");
    return;
  }
  if (!isValidWhatsapp(whatsapp)) {
    notifyMessage.textContent = "Please enter a valid WhatsApp number.";
    notifyMessage.classList.add("is-error");
    return;
  }

  try {
    const response = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, whatsapp }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Subscription failed");
    }

    notifyMessage.textContent = payload.message || "You are on the list.";
    notifyMessage.classList.add("is-success");
    notifyForm.reset();
  } catch (error) {
    notifyMessage.textContent =
      error.message || "Unable to subscribe right now. Please try again.";
    notifyMessage.classList.add("is-error");
  }
}

notifyForm.addEventListener("submit", submitNotify);
