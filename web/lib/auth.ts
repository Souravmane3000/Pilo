import { supabase } from './supabaseClient'

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return data?.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user
}