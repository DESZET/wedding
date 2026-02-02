/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// API functions
const API_BASE = '/api';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
}

// Gallery types
export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGalleryItem {
  title: string;
  category: string;
  image: string;
}

export interface UpdateGalleryItem {
  title?: string;
  category?: string;
  image?: string;
}

// Testimonial types
export interface TestimonialItem {
  id: number;
  name: string;
  text: string;
  rating: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestimonialItem {
  name: string;
  text: string;
  rating: number;
  date: string;
}

export interface UpdateTestimonialItem {
  name?: string;
  text?: string;
  rating?: number;
  date?: string;
}

// Package types
export interface PackageItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  highlighted: boolean;
  features?: string[];
  longDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageItem {
  name: string;
  price: number;
  description?: string;
  highlighted?: boolean;
  features?: string[];
  longDescription?: string;
}

export interface UpdatePackageItem {
  name?: string;
  price?: number;
  description?: string;
  highlighted?: boolean;
  features?: string[];
  longDescription?: string;
}

// Venue types
export interface VenueItem {
  id: number;
  title: string;
  category: string;
  price: string;
  capacity?: number;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVenueItem {
  title: string;
  category: string;
  price: string;
  capacity?: number;
  description?: string;
  image?: string;
}

export interface UpdateVenueItem {
  title?: string;
  category?: string;
  price?: string;
  capacity?: number;
  description?: string;
  image?: string;
}

// Video types
export interface VideoItem {
  id: number;
  title: string;
  description: string;
  videoPath: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVideoItem {
  title: string;
  description: string;
  videoPath: string;
  thumbnail?: string;
}

export interface UpdateVideoItem {
  title?: string;
  description?: string;
  videoPath?: string;
  thumbnail?: string;
}

// Statistics types
export interface StatItem {
  id: number;
  label: string;
  value: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStatItem {
  label: string;
  value: number;
  image?: string;
}

export interface UpdateStatItem {
  label?: string;
  value?: number;
  image?: string;
}

// Wedding Show Video types (simpler than regular videos - no title/description)
export interface WeddingShowVideoItem {
  id: number;
  videoPath: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWeddingShowVideoItem {
  videoPath: string;
  thumbnail?: string;
}

export interface UpdateWeddingShowVideoItem {
  videoPath?: string;
  thumbnail?: string;
}

// Section images types
export interface SectionImageItem {
  id: number;
  section: string;
  image_url: string;
  alt_text?: string;
  order_index: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionImageItem {
  section: string;
  image_url: string;
  alt_text?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface UpdateSectionImageItem {
  section?: string;
  image_url?: string;
  alt_text?: string;
  order_index?: number;
  is_active?: boolean;
}
