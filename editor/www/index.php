<?php

require_once '../include/config.php';
require_once '../include/db.php';
require_once '../include/session.php';
require_once '../include/datasets.php';
sec_session_start();

$login_failed = false;
if ( isset($_POST['login_email'], $_POST['login_password']) ) {
  $login_failed = !login($_POST['login_email'], $_POST['login_password'], $mysqli);
}

$joined = false;
$join_message = '';
if ( isset($_POST['join_email'], $_POST['join_password'], $_POST['join_password2']) ) {
  $email = $_POST['join_email'];
  $password = $_POST['join_password'];
  $password2 = $_POST['join_password2'];

  if ($password !== $password2) {
    $join_message = '<p>Your passwords did not match.</p>';
  }
  else if (strlen($password) < 10) {
    $join_message = '<p>Your password must be at least 10 characters.</p>';
  }
  else if ( !filter_var($email, FILTER_VALIDATE_EMAIL) ) {
    $join_message = '<p>Email address is invalid.</p>';
  }
  else {
    $joined = create_account($email, $password, $mysqli);
    if (!$joined) {
      $join_message = '<p>Could not create an account.</p>';
    }
  }
}

$logged_in = login_check($mysqli);

$action = $logged_in ? 'list' : 'login';

foreach ( $_GET as $k => $v ) {
  if ( $logged_in ) {
    if ( $k === 'list' ) {
      $action = $k;
    }
    else if ( $k === 'upload' || $k === 'confirm' ) {
      $action = $k;
    }
    else if ( $k === 'logout' ) {
      logout();
      $logged_in = false;
      $action = 'login';
    }
    else if ( $k === 'publish' ) {
      if ( isset($_POST['dataset_id'], $_POST['dataset_title'], $_POST['upload_id']) ) {
        publish_dataset($_POST['dataset_id'], $_POST['dataset_title'], $_POST['upload_id'], $mysqli);
      };
      $action = 'list';
    }
  }
  else {
    if ( $k === 'login' ) {
      $action = $k;
    }
    else if ( !$joined && $k === 'join' ) {
      $action = $k;
    }
  }
}

switch ( $action ) {
  case 'login':
    include '../template/login.php';
    break;
  case 'join':
    include '../template/join.php';
    break;
  case 'list':
    include '../template/list.php';
    break;
  case 'upload':
    include '../template/upload.php';
    break;
  case 'confirm':
    include '../template/confirm.php';
    break;
}