// apiError.js — Reads the error message from a failed API request
// so we can show it to the user in plain English

export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (!error?.response) {
    return "Cannot connect to the backend. Start Apache and MySQL in XAMPP, or make sure the local PHP server is running.";
  }

  return error?.response?.data?.message || fallback;
}
