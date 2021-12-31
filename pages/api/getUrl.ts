// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SignedURL {
  data: {
      signedURL: string;
  } | null;
  error: Error | null;
  signedURL: string | null;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    const fileName: string = req.body.fileName;
    const signedUrl: SignedURL = await getSignedUrl(supabase, `${fileName}`)
    if (signedUrl.error) {
        throw signedUrl.error
    }
    res.statusCode = 200;
    res.json(signedUrl.signedURL);
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}

async function getSignedUrl(supabase: SupabaseClient, fileName: string): Promise<SignedURL> {
  return (await supabase
  .storage
  .from('adobe-sensei')
  .createSignedUrl(`${fileName}`, 60))
}


