// apiError.js — Reads the error message from a failed API request
// so we can show it to the user in plain English

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || fallback;
}
