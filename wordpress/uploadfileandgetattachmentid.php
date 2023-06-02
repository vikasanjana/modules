 /**
     * Function for uplaod logo file and get attachment id
     * @param Array Files['file'] array getting from form
     * @return Int Attachement id
     */
    public function uf_uplaod_logo_file($file)
    {
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        $attachment_id = media_handle_upload($file, 0);
        if (!is_wp_error($attachment_id)) {
            return  $attachment_id;
        } else {
            return false;
        }
    }
