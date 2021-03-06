<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nomen Editor: <?php echo $page_title; ?></title>

  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="lib/jquery-2.1.1.min.js"></script>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="lib/bootstrap-3.3.0/css/bootstrap.min.css">
  <!-- Optional theme -->
  <link rel="stylesheet" href="lib/bootstrap-3.3.0/css/bootstrap-theme.min.css">
  <!-- Latest compiled and minified JavaScript -->
  <script src="lib/bootstrap-3.3.0/js/bootstrap.min.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="stylesheet" href="table.css">
</head>
<body>

<nav class="navbar navbar-inverse" role="navigation">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="?">Nomen Editor</a>
    </div>

    <div class="collapse navbar-collapse" id="navbar-collapse">
      <?php if ($logged_in) { ?>
        <ul class="nav navbar-nav">
          <li><a href="?list">Your Guides</a></li>
          <li><a href="?upload">New Guide</a></li>
        </ul>

        <ul class="nav navbar-nav navbar-right">
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
              Logged in as <?= $_SESSION['email'] ?> <span class="caret"></span>
            </a>
            <ul class="dropdown-menu" role="menu">
              <li><a href="?logout">Logout</a></li>
              <li><a href="?password">Change Password</a></li>
            </ul>
          </li>
          <li><a href="?about">About</a></li>
        </ul>
      <?php } else { ?>
        <ul class="nav navbar-nav navbar-right">
          <li><a href="?about">About</a></li>
        </ul>
      <?php } ?>
    </div>
  </div>
</nav>

<div class="container">

<?php
if ($message) {
  $message_class = $success ? 'alert-success' : 'alert-danger';
  echo "<div class=\"alert $message_class\">$message</div>";
}
?>

<?php page_content(); ?>

<div style="height: 80px;">
  <!-- some extra buffer space at bottom of page -->
</div>

</div>

</body>
</html>
