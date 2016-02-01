<?php 
$startDate = $_POST['startDate'];
$duration = $_POST['duration'];

$dataFile = file_get_contents("data.json");

// $data = json_decode($dataFile, true);

header('Content-Type: application/json');
echo $dataFile;
?>