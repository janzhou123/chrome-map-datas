// Google Maps API 响应类型
export interface GoogleMapsPlace {
  place_id: string;
  data_id?: string;
  title: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  type?: string;
  hours?: string;
  service_options?: {
    dine_in?: boolean;
    takeout?: boolean;
    delivery?: boolean;
  };
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  thumbnail?: string;
}

export interface GoogleMapsSearchResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_maps_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    google_domain: string;
    hl: string;
    gl: string;
    type: string;
    start?: string;
    ll?: string;
  };
  search_information: {
    query_displayed: string;
    total_results: number;
  };
  local_results: GoogleMapsPlace[];
  serpapi_pagination?: {
    next: string;
    next_page_token?: string;
    current_page?: number;
    other_pages?: {
      [key: string]: string;
    };
  };
}

// Google Maps Reviews API 响应类型
export interface GoogleMapsReview {
  user: {
    name: string;
    link?: string;
    thumbnail?: string;
    reviews?: number;
    photos?: number;
  };
  rating: number;
  date: string;
  snippet: string;
  likes?: number;
  images?: string[];
}

export interface GoogleMapsReviewsResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_maps_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    data_id: string;
    hl: string;
    gl: string;
  };
  place_info: {
    title: string;
    address: string;
    rating: number;
    reviews: number;
    type: string;
    hours: string;
    phone: string;
    website: string;
    description: string;
    service_options: {
      dine_in: boolean;
      takeout: boolean;
      delivery: boolean;
    };
    gps_coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  reviews: GoogleMapsReview[];
  serpapi_pagination?: {
    next_page_token?: string;
    current_page?: number;
  };
}

// 应用内部使用的类型
export interface SearchParams {
  keyword: string;
  location: string;
}

export interface PlaceWithReviews extends GoogleMapsPlace {
  reviews_data?: GoogleMapsReview[];
  reviews_loaded?: boolean;
}