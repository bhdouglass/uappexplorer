<?php

function get($url) {
	$success = true;
	$data = apc_fetch($url, $success);

	if (!$success) {
		$data = file_get_contents($url);
		apc_store($url, $data, 3600);
	}

	return $data;
}

$url = 'https://search.apps.ubuntu.com/api/v1/search';
if (isset($_REQUEST['url'])) {
	$url = $_REQUEST['url'];
}

header('Content-Type: application/json');
echo get($url);
?>