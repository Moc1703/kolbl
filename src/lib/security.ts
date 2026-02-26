/**
 * Security utility to prevent XSS, injection attacks, and payload abuse
 * Updated: 2026-02-26 — Enhanced with URL validation, length limits, and SQL injection hints
 */

const MAX_INPUT_LENGTH = 5000
const MAX_URL_LENGTH = 2048

/**
 * Sanitizes a string by removing HTML tags and dangerous characters
 * @param input - The string to sanitize
 * @param maxLength - Optional max character limit (default: 5000)
 * @returns Sanitized string safe for database storage
 * 
 * @example
 * sanitizeInput("Hello <script>alert(1)</script>") // Returns: "Hello"
 * sanitizeInput("<b>Bold text</b>") // Returns: "Bold text"
 */
export function sanitizeInput(input: string | null | undefined, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Enforce length limit to prevent payload bombs
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // Remove script/style content even if tags are malformed
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data: protocol (can be used for XSS via data URIs)
  sanitized = sanitized.replace(/data:\s*text\/html/gi, '')

  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '')

  // Remove on* event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Remove expression() CSS attacks
  sanitized = sanitized.replace(/expression\s*\(/gi, '')

  // Decode common HTML entities that could be used for XSS
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, '') // Remove numeric HTML entities

  // Remove the decoded dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '')

  // Remove any remaining encoded scripts
  sanitized = sanitized.replace(/%3Cscript/gi, '')
  sanitized = sanitized.replace(/%3C/g, '')
  sanitized = sanitized.replace(/%3E/g, '')

  // Remove common SQL injection patterns (hint removal, not full protection)
  sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b\s+(FROM|INTO|TABLE|DATABASE|ALL))/gi, '')
  sanitized = sanitized.replace(/(--|;|\/\*|\*\/|xp_|sp_)/g, '')

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Validates and sanitizes a URL string
 * Only allows http:// and https:// protocols
 * @param url - The URL to validate
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * sanitizeUrl("https://example.com/image.jpg") // Returns: "https://example.com/image.jpg"
 * sanitizeUrl("javascript:alert(1)") // Returns: ""
 * sanitizeUrl("data:text/html,<script>alert(1)</script>") // Returns: ""
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const trimmed = url.trim()

  // Enforce URL length limit
  if (trimmed.length > MAX_URL_LENGTH) {
    return ''
  }

  // Only allow http and https protocols
  if (!/^https?:\/\//i.test(trimmed)) {
    return ''
  }

  // Block dangerous patterns within URLs
  if (/javascript:/i.test(trimmed) || /data:/i.test(trimmed) || /vbscript:/i.test(trimmed)) {
    return ''
  }

  // Basic URL validation
  try {
    new URL(trimmed)
    return trimmed
  } catch {
    return ''
  }
}

/**
 * Sanitizes an object by applying sanitizeInput to all string properties
 * @param obj - Object with string properties to sanitize
 * @returns New object with sanitized string values
 * 
 * @example
 * sanitizeObject({ name: "<script>alert(1)</script>", age: 25 })
 * // Returns: { name: "", age: 25 }
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T

  for (const key in obj) {
    const value = obj[key]
    
    if (typeof value === 'string') {
      // Use URL sanitizer for URL-like fields
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        sanitized[key] = sanitizeUrl(value) as any
      } else {
        sanitized[key] = sanitizeInput(value) as any
      }
    } else if (value === null || value === undefined) {
      sanitized[key] = value
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
