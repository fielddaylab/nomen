<?php

require_once 'db.php';

function get_datasets() {
  return DB::query('SELECT * FROM datasets WHERE user_id = %i', $_SESSION['user_id']);
}

function get_dataset($dataset_id) {
  return DB::queryFirstRow
    ( 'SELECT * FROM datasets WHERE user_id = %i AND id = %i LIMIT 1'
    , $_SESSION['user_id']
    , $dataset_id
    );
}

function publish_dataset($dataset_id, $title, $description, $upload_id, $mysqli) {
  /*
  DB::startTransaction();
  if ($dataset_id <= 0) {
    // New dataset
    DB::insert('datasets', [
      'user_id' => $_SESSION['user_id'],
      'title' => $title,
      'description' => $description,
      'version' => $version,
    ]);
    $dataset_id = DB::insertId();
  }
  else {
    // New version of existing dataset
    DB::update('datasets', [
      'title' => $title,
      'description' => $description,
      'version' => DB::sqleval('version + 1'),
    ], 'id = %i AND user_id = %i', $dataset_id, $_SESSION['user_id']);
    // TODO error check
  }
  */

  $mysqli->begin_transaction();
  if ($dataset_id <= 0) {
    // New dataset
    if ($stmt = $mysqli->prepare("INSERT INTO datasets (user_id, title, description, version) VALUES (?, ?, ?, ?)")) {
      $version = 1;
      $stmt->bind_param('issi', $_SESSION['user_id'], $title, $description, $version);
      $stmt->execute();
      $dataset_id = $stmt->insert_id;
    }
    else {
      // Couldn't prepare statement
      $mysqli->rollback();
      return false;
    }
  }
  else {
    // New version of existing dataset
    if ($stmt = $mysqli->prepare("UPDATE datasets
      SET title = ?, description = ?, version = version + 1
      WHERE id = ?
      AND user_id = ?
      LIMIT 1")) {
      $stmt->bind_param('ssii', $title, $description, $dataset_id, $_SESSION['user_id']);
      $stmt->execute();
      if ($stmt->affected_rows != 1) {
        // Didn't update row, maybe the user doesn't own this dataset
        $mysqli->rollback();
        return false;
      }
      $version = get_dataset($dataset_id)['version'];
    }
    else {
      // Couldn't prepare statement
      $mysqli->rollback();
      return false;
    }
  }

  // Insert info.json into zip, save to $dataset_id
  $zip_old = '../uploads/' . $upload_id . '.zip';
  $zip_new = '../www/datasets/' . $dataset_id . '.zip';
  $zip = new ZipArchive;
  if ($zip->open($zip_old) === TRUE) {
    $zip_info = json_encode([
      'title' => $title,
      'description' => $description,
      'id' => DATASET_PREFIX . $dataset_id,
      'version' => $version,
      'author' => $_SESSION['email'],
    ]);
    $zip->addFromString('info.json', $zip_info);
    $zip->close();
  } else {
    $mysqli->rollback();
    return false;
  }
  rename($zip_old, $zip_new);
  $mysqli->commit();
  return true;
}

function delete_dataset($dataset_id) {
  DB::delete('datasets', "id = %i AND user_id = %i", $dataset_id, $_SESSION['user_id']);
  if (DB::affectedRows() != 1) return false;
  unlink('../www/datasets/' . $dataset_id . '.zip');
  return true;
}
