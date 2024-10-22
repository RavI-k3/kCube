<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Get form data
  $to = "kalliravikiran@gmail.com";
  $subject = $_POST["name"];  // Assuming you have a form field named "subject"
  $message = $_POST["message"];  // Assuming you have a form field named "message"

  // You can customize additional headers if needed
  $headers = "From: sender@example.com\r\n";
  $headers .= "Reply-To: sender@example.com\r\n";
  $headers .= "Content-type: text/html\r\n";

  // Send email
  $success = mail($to, $subject, $message, $headers);

  if ($success) {
    echo "Email sent successfully!";
  } else {
    echo "Error sending email. Please try again.";
  }
}
?>
