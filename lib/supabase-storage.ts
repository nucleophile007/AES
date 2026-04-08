import { supabaseServer } from './supabase-server'

const RESEARCH_SLIDES_BUCKET = 'research-slides'
const RESEARCH_REPORT_BUCKET = 'research-pdf'
const RESEARCH_PRESENTATION_BUCKET = 'research-ppt'

/**
 * Generate time-limited signed URL for slide image from private bucket
 */
export async function getSignedSlideUrl(filename: string, expiresIn = 3600): Promise<string> {
  try {
    console.log('Attempting to generate signed URL for:', filename)
    console.log('Bucket: research-slides')
    
    const { data, error } = await supabaseServer.storage
      .from(RESEARCH_SLIDES_BUCKET)
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
      .from(RESEARCH_REPORT_BUCKET)
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

/**
 * Generate time-limited signed URL for presentation PDF from private bucket
 */
export async function getSignedPresentationPdfUrl(filename: string, expiresIn = 3600): Promise<string> {
  try {
    const { data, error } = await supabaseServer.storage
      .from(RESEARCH_PRESENTATION_BUCKET)
      .createSignedUrl(filename, expiresIn)

    if (error) {
      console.error('Error generating signed URL for presentation PDF:', error)
      throw new Error(`Failed to generate presentation PDF URL: ${error.message}`)
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned from Supabase for presentation PDF')
    }

    return data.signedUrl
  } catch (error) {
    console.error('Supabase storage error:', error)
    throw error
  }
}

/**
 * Download presentation PDF bytes from private bucket for secure server-side processing.
 */
export async function downloadPresentationPdf(filename: string): Promise<Uint8Array> {
  try {
    const { data, error } = await supabaseServer.storage
      .from(RESEARCH_PRESENTATION_BUCKET)
      .download(filename)

    if (error) {
      console.error('Error downloading presentation PDF:', error)
      throw new Error(`Failed to download presentation PDF: ${error.message}`)
    }

    if (!data) {
      throw new Error('No file returned from Supabase for presentation PDF')
    }

    const buffer = await data.arrayBuffer()
    return new Uint8Array(buffer)
  } catch (error) {
    console.error('Supabase storage error:', error)
    throw error
  }
}
