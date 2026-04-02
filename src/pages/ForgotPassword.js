function ForgotPassword() {
  return (
    <div className="container">
      <h2>Reset Password</h2>

      <input type="email" placeholder="Enter Email" />
      <button>Send Reset Link</button>
    </div>
  );
}

export default ForgotPassword;