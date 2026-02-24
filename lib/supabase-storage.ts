import { supabaseServer } from './supabase-server'

/**
 * Generate time-limited signed URL for slide image from private bucket
 */
export async function getSignedSlideUrl(filename: string, expiresIn = 3600): Promise<string> {
  try {
    console.log('Attempting to generate signed URL for:', filename)
    console.log('Bucket: research-slides')
    
    const { data, error } = await supabaseServer.storage
      .from('research-slides')
      .createSignedUrl(filename, expiresIn)

    if (error) {
      console.error('Error generating signed URL for slide:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to generate slide URL: ${error.message}`)
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned from Supabase')
    }

    console.log('Successfully generated signed URL')
    return data.signedUrl
  } catch (error) {
    console.error('Supabase storage error:', error)
    throw error
  }
}

/**
 * Generate time-limited signed URL for PDF from private bucket
 */
export async function getSignedPdfUrl(filename: string, expiresIn = 3600): Promise<string> {
  try {
    const { data, error } = await supabaseServer.storage
      .from('research-pdf')
      .createSignedUrl(filename, expiresIn)

    if (error) {
      console.error('Error generating signed URL for PDF:', error)
      throw new Error(`Failed to generate PDF URL: ${error.message}`)
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned from Supabase')
    }

    return data.signedUrl
  } catch (error) {
    console.error('Supabase storage error:', error)
    throw error
  }
}
