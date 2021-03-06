<?php

use Drupal\node\Entity\Node;

/**
 * Implements hook_simple_sitemap_links_alter().
 *
 * Add in our product pages.
 */
function rhd_common_simple_sitemap_links_alter(&$links) {
  product_node_sitemap_entries($links);
  books_node_sitemap_entries($links);
}

/**
 * Add in the product pages and the sub-pages to the sitemap.
 * @param $links array of links to be added to the sitemap.
 */
function product_node_sitemap_entries(&$links) {
  $product_node_ids = drupal_static('sitemap_product_node_ids', []);

  if (empty($product_nodes_ids)) {
    $query = \Drupal::entityQuery('node');
    $query->condition('status', 1);
    $query->condition('type', 'product');
    $product_node_ids = $query->execute();
  }

  $products_in_sitemap = found_product_in_sitemap($links, $product_node_ids);

  // lambda function to overcome the inability to pass $links by reference :(
  // this add all the sub pages to the list of links and unsets the one with the node entry
  $callback = function ($product_node_link, $product_node_link_index) use (&$links) {
    $product = Node::load($links[$product_node_link_index]['entity_info']['id']);
    $sub_pages = $product->field_product_pages->referencedEntities();
    $entries = array_map('build_subpage_link_entry', $sub_pages,
      array_fill(0, count($sub_pages), $links[$product_node_link_index]));
    $links = array_merge($links, $entries);
    $links[$product_node_link_index] = NULL;
  };

  // Add in the sub pages to the sitemap
  array_walk($products_in_sitemap, $callback);

  // Remove any null entries that were set above
  $links = array_filter($links, function ($value) {
    return isset($value);
  });
}

/**
 * Builds a link entry for a sub page
 * @param \Drupal\paragraphs\Entity\Paragraph $sub_page
 * @param $template
 * @return array Link entry for sub page
 */
function build_subpage_link_entry($sub_page, $template)
{
  /** @var \Drupal\Core\Config\ImmutableConfig $rhd_config */
  $rhd_drupal_config = \Drupal::config('redhat_developers')->get('drupal');
  $drupal_env = \Drupal::config('redhat_developers')->get('environment');

  $base_url = ($drupal_env === 'pr')
    ? "http://{$rhd_drupal_config['host']}:{$rhd_drupal_config['port']}"
    : $rhd_drupal_config['host'];

  $url_product_name = $sub_page->getParentEntity()->field_url_product_name->value;
  $sub_page_slug = strtolower(str_replace(' ', '-', $sub_page->field_overview_url->value));

  $template['path'] = "products/$url_product_name/$sub_page_slug";
  $template['url'] = "$base_url/{$template['path']}";
  $template['alternate_urls']['en'] = $template['url'];

  return $template;
}

/**
 * Returns an array af links which are for product nodes
 * @param array $links Links in the sitemap
 * @param array $product_ids node ids of products
 * @return array An array with the link entry for a product, the key is key in the $links array
 */
function found_product_in_sitemap($links, $product_ids)
{
  return array_filter($links, function ($link) use ($product_ids) {
    if (!empty($link['entity_info'])) {
      return in_array($link['entity_info']['id'], $product_ids);
    }
  });
}

/**
 * Add only those books who have their own page to the sitemap.
 * @param $links array of links to be added to the sitemap.
 */
function books_node_sitemap_entries(&$links) {
  $book_ids = drupal_static('sitemap_product_node_ids', []);

  // Find all published books
  if (empty($book_ids)) {
    $query = \Drupal::entityQuery('node');
    $query->condition('status', 1);
    $query->condition('type', 'books');
    $book_ids = $query->execute();
  }

  // Get the list of books in the sitemap
  $books_in_sitemap = found_book_in_sitemap($links, $book_ids);

  // Callback used to remove books who don't have a true value for "needs own page"
  $callback = function ($book_node_link, $book_node_link_index) use (&$links) {
    $book = Node::load($links[$book_node_link_index]['entity_info']['id']);

    if (empty($book->field_needs_own_page->value)) {
      $links[$book_node_link_index] = NULL;
    }
  };

  array_walk($books_in_sitemap, $callback);

  // Remove any null entries that were set above
  $links = array_filter($links, function ($value) {
    return isset($value);
  });
}

/**
 * Returns an array af links which are for book nodes
 * @param array $links Links in the sitemap
 * @param array $book_ids node ids of products
 * @return array An array with the link entry for a book, the key is key in the $links array
 */
function found_book_in_sitemap($links, $book_ids)
{
  return array_filter($links, function ($link) use ($book_ids) {
    if (!empty($link['entity_info'])) {
      return in_array($link['entity_info']['id'], $book_ids);
    }
  });
}
