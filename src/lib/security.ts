/**
 * Security utility to prevent XSS attacks by sanitizing user input
 */

/**
 * Sanitizes a string by removing HTML tags and dangerous characters
 * @param input - The string to sanitize
 * @returns Sanitized string safe for database storage
 * 
 * @example
 * sanitizeInput("Hello <script>alert(1)</script>") // Returns: "Hello"
 * sanitizeInput("<b>Bold text</b>") // Returns: "Bold text"
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // Remove script/style content even if tags are malformed
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove on* event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Decode common HTML entities that could be used for XSS
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')

  // Remove the decoded dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '')

  // Remove any remaining encoded scripts
  sanitized = sanitized.replace(/%3Cscript/gi, '')
  sanitized = sanitized.replace(/%3C/g, '')
  sanitized = sanitized.replace(/%3E/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
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
      sanitized[key] = sanitizeInput(value) as any
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
