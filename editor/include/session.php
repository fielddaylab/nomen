<?php

// From http://www.wikihow.com/Create-a-Secure-Login-Script-in-PHP-and-MySQL

require_once 'config.php';

function sec_session_start() {
    $session_name = 'sec_session_id';   // Set a custom session name
    $secure = SECURE;
    // This stops JavaScript being able to access the session id.
    $httponly = true;
    // Forces sessions to only use cookies.
    if (ini_set('session.use_only_cookies', 1) === FALSE) {
        echo 'Error: could not initiate a safe session.';
        exit();
    }
    // Gets current cookies params.
    $cookieParams = session_get_cookie_params();
    session_set_cookie_params($cookieParams["lifetime"],
        $cookieParams["path"],
        $cookieParams["domain"],
        $secure,
        $httponly);
    // Sets the session name to the one set above.
    session_name($session_name);
    session_start();            // Start the PHP session
    session_regenerate_id();    // regenerated the session, delete the old one.
}

function login($email, $password) {
    $row = DB::queryFirstRow('SELECT id, password, salt
        FROM users
        WHERE email = %s
        LIMIT 1', $email);
    if (is_null($row)) return false; // No user exists.
    $user_id = $row['id'];
    $db_password = $row['password'];
    $salt = $row['salt'];

    // hash the password with the unique salt.
    $password = hash('sha512', $password . $salt);
    // Check if the password in the database matches
    // the password the user submitted.
    if ($db_password != $password) return false; // Password is not correct.

    // Password is correct!
    // Get the user-agent string of the user.
    $user_browser = $_SERVER['HTTP_USER_AGENT'];
    // XSS protection as we might print this value
    $user_id = preg_replace("/[^0-9]+/", "", $user_id);
    $_SESSION['user_id'] = $user_id;
    // XSS protection as we might print this value
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    $_SESSION['email'] = $email;
    $_SESSION['login_string'] = hash('sha512',
              $password . $user_browser);
    // Login successful.
    return true;
}

function login_check() {
    // Check if all session variables are set
    if (!isset($_SESSION['user_id'],
            $_SESSION['email'],
            $_SESSION['login_string'])) {
        return false;
    }
    $user_id = $_SESSION['user_id'];
    $login_string = $_SESSION['login_string'];
    $email = $_SESSION['email'];

    // Get the user-agent string of the user.
    $user_browser = $_SERVER['HTTP_USER_AGENT'];

    $password = DB::queryOneField('password', 'SELECT *
        FROM users
        WHERE id = %i
        LIMIT 1', $user_id);
    if (is_null($password)) return false;

    $login_check = hash('sha512', $password . $user_browser);
    return $login_check === $login_string;
}

function logout() {
    // Unset all session values
    $_SESSION = array();

    // get session parameters
    $params = session_get_cookie_params();

    // Delete the actual cookie.
    setcookie(session_name(),
            '', time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]);

    // Destroy session
    session_destroy();
}

function create_account($email, $password) {
    $random_salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
    $password = hash('sha512', $password . $random_salt);
    DB::insert('users', array(
        'email' => $email,
        'password' => $password,
        'salt' => $random_salt,
    ));
    return DB::affectedRows() === 1;
    // If not 1, couldn't INSERT, probably email already exists
}

function change_password($old_password, $new_password) {
    // First check that the old_password is correct.
    $row = DB::queryFirstRow('SELECT password, salt FROM users WHERE id = %i LIMIT 1', $_SESSION['user_id']);
    if (is_null($row)) return false;
    $old_hash = $row['password'];
    $old_salt = $row['salt'];
    if ($old_hash !== hash('sha512', $old_password . $old_salt)) return false;

    // Then update the row to have the new password, with a new salt.
    $new_salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
    $new_hash = hash('sha512', $new_password . $new_salt);
    DB::query('UPDATE users
        SET password = %s, salt = %s
        WHERE id = %i
        LIMIT 1', $new_hash, $new_salt, $_SESSION['user_id']);
    if (DB::affectedRows() !== 1) return false;

    // Finally, update the $_SESSION so we're still logged in.
    $user_browser = $_SERVER['HTTP_USER_AGENT'];
    $_SESSION['login_string'] = hash('sha512', $new_hash . $user_browser);
    return true;
}
