export function detectDemoAction(input: string): string {
  const text = input.toLowerCase()

  if (text.includes('send') && text.includes('email')) return 'send_email'
  if (text.includes('update') && text.includes('email')) return 'update_email'
  if (text.includes('delete')) return 'delete_lead'
  if (text.includes('create') || text.includes('add')) return 'create_lead'
  if (text.includes('get') || text.includes('show') || text.includes('list')) return 'get_leads'

  return 'unknown'
}
