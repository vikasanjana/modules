<?php
require('./wp-load.php');

require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
$args = array(
    'post_type' => 'irishtunes',
    'posts_per_page' => 50,
    'paged' => 4
);

$query = new WP_Query($args);

if ($query->have_posts()) {
    while ($query->have_posts()) {
        $query->the_post();

        $post_id = get_the_ID();
        $file_name = preg_replace("/\s's/", "s", get_the_title())  . '.png';
        $file_url = home_url() . '/wp-content/themes/hello-elementor-child/assets/irish-tunes/' . $file_name;

        // Download and attach the image to the media library
        $attachment_id = download_and_attach_image($file_url, $file_name);
        echo 'file url :- ' . $file_url . "<br>";
        echo 'attachement id :-'. $attachment_id . '<br>';
        echo 'post id :-'.  $post_id;
        echo "<br>";
        if (!is_wp_error($attachment_id)) {
            // Update the featured image for each post within the loop
            update_post_meta($post_id, '_thumbnail_id', $attachment_id);
        }
    }
}

wp_reset_postdata();
function download_and_attach_image($file_url, $file_name) {
    $upload_dir = wp_upload_dir();
    $response = wp_safe_remote_get($file_url);

    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $image_data = wp_remote_retrieve_body($response);

        $unique_file_name = wp_unique_filename($upload_dir['path'], $file_name); // Generate unique name
        $filename = basename($unique_file_name); // Create image file name

        // Check folder permission and define file location
        if (wp_mkdir_p($upload_dir['path'])) {
            $file = $upload_dir['path'] . '/' . $filename;
        } else {
            $file = $upload_dir['basedir'] . '/' . $filename;
        }

        // Create the image file on the server
        file_put_contents($file, $image_data);

        // Check image file type
        $wp_filetype = wp_check_filetype($filename, null);

        // Set attachment data
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => sanitize_file_name($filename),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        // Create the attachment
        $attach_id = wp_insert_attachment($attachment, $file);
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $attach_data = wp_generate_attachment_metadata($attach_id, $file);
        wp_update_attachment_metadata($attach_id, $attach_data);

        return $attach_id;
    }

    return null;
}