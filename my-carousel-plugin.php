<?php
/**
 * Plugin Name: My Carousel Plugin
 * Description: Displays an image carousel for a given event type via shortcode [my_carousel_plugin what='deathvalley']
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 1. SHORTCODE
 * Usage: [my_carousel_plugin what='deathvalley']
 */
add_shortcode('my_carousel_plugin', 'my_carousel_render_shortcode');

function my_carousel_render_shortcode($atts) {
    $atts_before = $atts; // capture raw input before shortcode_atts merges defaults
    
    $atts = shortcode_atts([
        'what' => 'deathvalley',
    ], $atts, 'my_carousel_plugin');

    error_log('RAW atts before merge: ' . print_r($atts_before, true));
    error_log('MERGED atts after shortcode_atts: ' . print_r($atts, true));

    $event_type = preg_replace('/[^a-zA-Z0-9\-]/', '', $atts['what']);
    error_log('FINAL sanitized what: ' . $event_type);

    wp_enqueue_script(
        'my-carousel-app',
        plugin_dir_url(__FILE__) . 'build/index.js',
        ['wp-element'],
        '1.0.0',
        true
    );

    wp_localize_script('my-carousel-app', 'myCarouselData', [
        'what' => $event_type,
        'restUrl'   => esc_url_raw(rest_url('my-carousel/v1/images')),
    ]);

    return '<div id="my-carousel-root"></div>';
}

/**
 * 2. REST API ENDPOINT
 * GET /wp-json/my-carousel/v1/images?what=deathvalley
 *
 * Queries the Media Library for attachments whose title matches
 * 'prefix-id-text', filters by the prefix mapped from what,
 * and sorts by the numeric id segment.
 */
add_action('rest_api_init', function () {
    register_rest_route('my-carousel/v1', '/images', [
        'methods'  => 'GET',
        'callback' => 'my_carousel_get_images',
        'permission_callback' => '__return_true',
        'args' => [
            'what' => [
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ]);
});

function my_carousel_get_images(WP_REST_Request $request) {
    $event_type = $request->get_param('what');

    $allowed_events = [
        'deathvalley'  => 'dv',
        'yosemite'     => 'yos',
        'joshuatree'   => 'jt',
        'mountwhitney' => 'mw',
    ];

    if (!isset($allowed_events[$event_type])) {
        return new WP_REST_Response(['error' => 'Invalid what'], 400);
    }

    $prefix = $allowed_events[$event_type];

    $attachments = get_posts([
        'post_type'      => 'attachment',
        'post_status'    => 'inherit',
        'post_mime_type' => 'image',
        'posts_per_page' => -1,
        'orderby'        => 'ID',
        'order'          => 'ASC',
    ]);

    $matched = [];

    foreach ($attachments as $attachment) {
        $title = $attachment->post_title;

        // Expect pattern: prefix-id-text, where id can now be an
        // integer (dv-2) or a decimal (dv-2.5) for inserted images.
        if (preg_match('/^' . preg_quote($prefix, '/') . '-(\d+(?:\.\d+)?)-/', $title, $matches)) {
            $matched[] = [
                'id'      => (float) $matches[1], // was (int) — now float to preserve decimals
                'url'     => wp_get_attachment_url($attachment->ID),
                'caption' => $attachment->post_excerpt
                    ?: get_post_meta($attachment->ID, '_wp_attachment_image_alt', true)
                    ?: $title,
            ];
        }
    }

    usort($matched, function ($a, $b) {
        return $a['id'] <=> $b['id'];
    });

    // Drop the internal 'id' field before returning — the frontend doesn't need it
    $result = array_map(function ($item) {
        return [
            'url'     => $item['url'],
            'caption' => $item['caption'],
        ];
    }, $matched);

    return new WP_REST_Response($result, 200);
}
