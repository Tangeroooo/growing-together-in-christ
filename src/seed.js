import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const missions = JSON.parse(readFileSync(join(__dirname, '../missions.json'), 'utf-8'))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedMissions() {
  console.log('Seeding missions...')

  const { error: disableError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE missions DISABLE ROW LEVEL SECURITY'
  })

  if (disableError) {
    console.warn('Could not disable RLS, trying direct insert...')
  }

  for (const mission of missions) {
    const { error } = await supabase
      .from('missions')
      .insert({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        condition: mission.condition
      })

    if (error) {
      console.error(`Error inserting mission ${mission.id}:`, error)
    } else {
      console.log(`Inserted: ${mission.title}`)
    }
  }

  const { error: enableError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE missions ENABLE ROW LEVEL SECURITY'
  })

  if (enableError) {
    console.warn('Could not re-enable RLS. Please enable manually in Supabase dashboard.')
  }

  console.log('Seeding complete!')
}

seedMissions().catch(console.error)
