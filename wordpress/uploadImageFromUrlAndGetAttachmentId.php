
function get_attachment_id($image_url)
{
	if (!empty($image_url)) {
		$filename = basename($image_url);
		$upload_file = wp_upload_bits($filename, null, file_get_contents($image_url));
		if ($upload_file['error'] === false) {
			// Create the attachment data array
			$attachment = array(
				'post_mime_type' => $upload_file['type'],
				'post_title'     => sanitize_file_name($filename),
				'post_content'   => '',
				'post_status'    => 'inherit'
			);
			$attachment_id = wp_insert_attachment($attachment, $upload_file['file']);
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$attachment_data = wp_generate_attachment_metadata($attachment_id, $upload_file['file']);
			wp_update_attachment_metadata($attachment_id, $attachment_data);
			return $attachment_id;
		} else {
			// File upload failed
			$attachment_id = null;
		}
	}
}
