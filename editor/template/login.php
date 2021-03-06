<?php 

$page_title = 'Login';
function page_content() {
  $existing_email = isset($_POST['email']) ? $_POST['email'] : '';
  ?>

<div class="page-header">
<h1>Login</h1>
</div>

<form action="?login" method="post">
  <div class="form-group">
    <label for="input-email">Email</label>
    <input autofocus id="input-email" class="form-control" placeholder="Email" type="text" name="email" value="<?= $existing_email ?>" />
  </div>
  <div class="form-group">
    <label for="input-password">Password</label>
    <input id="input-password" class="form-control" placeholder="Password" type="password" name="password" />
  </div>
  <div class="form-group">
    <input type="submit" value="Login" class="btn btn-primary" />
    <a href="?join">
      <input type="button" value="Register" class="btn btn-default" />
    </a>
  </div>
</form>

  <?php
}

include 'template.php';
