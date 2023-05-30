
    public static function get_instance()

    {

        if (is_null(self::$_instance)) {

            self::$_instance = new self();

        }

        return self::$_instance;

    }



    public function __construct() {

        $this->glSettings = $this->get_general_option();

        $this->setup_hooks();



    }



    public function get_general_option(){

        $data = array();

        $data['pd_specific_country_codes'] = array('BH'); // BH - behrain

        return $data;

    }
