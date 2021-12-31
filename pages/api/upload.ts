// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable';
import IncomingForm from 'formidable/Formidable';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(supabaseKey)
    const form: IncomingForm = formidable({
      multiples: false,
      keepExtensions: true
    })
    const fileUpload = new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject(err)
        } else {
          console.log(files)
          const uploadRes = await uploadImage(supabase, fs.readFileSync(files.img?.filepath, 'utf8'), `api/${files.img?.newFilename}`)
          resolve(`api/${files.img?.newFilename}`);
        }
      })
    })
    const fileName = await fileUpload;
    res.statusCode = 200;
    res.json(fileName);
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}

async function uploadImage(supabase: SupabaseClient, file: string, fileName: string) {
  return (await supabase.storage
  .from('adobe-sensei')
  .upload(fileName, file))
}

