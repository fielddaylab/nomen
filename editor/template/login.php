<?php 

$page_title = 'Login';
function page_content() {
  $existing_email = isset($_POST['email']) ? $_POST['email'] : '';
  ?>

<h1>Field Guide</h1>

<form action="?login" method="post">
  <div class="form-group">
    <input autofocus placeholder="Email" type="text" name="email" value="<?= $existing_email ?>" />
  </div>
  <div class="form-group">
    <input placeholder="Password" type="password" name="password" />
  </div>
  <div class="form-group">
    <input type="submit" value="Login" class="btn btn-primary" />
    <a href="?join">
      <input type="button" value="Register" class="btn" />
    </a>
  </div>
</form>

  <?php
}

include 'template.php';
