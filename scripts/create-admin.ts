/**
 * Create Admin User Script
 * 
 * Run this script to create an admin user in the database.
 * Usage: npx tsx scripts/create-admin.ts <username> <password> [display_name]
 * 
 * Example: npx tsx scripts/create-admin.ts admin supersecret123 "Admin Utama"
 * 
 * Or you can run the generated SQL directly in Supabase SQL Editor.
 */

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  const hashArray = new Uint8Array(derivedBits)
  const combined = new Uint8Array(salt.length + hashArray.length)
  combined.set(salt)
  combined.set(hashArray, salt.length)

  return btoa(String.fromCharCode(...combined))
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/create-admin.ts <username> <password> [display_name]')
    console.log('Example: npx tsx scripts/create-admin.ts admin supersecret123 "Admin Utama"')
    process.exit(1)
  }

  const username = args[0]
  const password = args[1]
  const displayName = args[2] || username

  console.log(`\nCreating admin user: ${username}`)
  console.log(`Display name: ${displayName}`)
  
  const hash = await hashPassword(password)
  
  console.log('\n✅ Password hashed successfully!')
  console.log('\n--- Copy this SQL and run it in Supabase SQL Editor ---\n')
  console.log(`INSERT INTO admin_users (username, password_hash, display_name, role, is_active)`)
  console.log(`VALUES ('${username}', '${hash}', '${displayName}', 'admin', true);`)
  console.log('\n--- End SQL ---\n')
}

main().catch(console.error)
