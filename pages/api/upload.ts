// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable';
import IncomingForm from 'formidable/Formidable';
import { createClient } from '@supabase/supabase-js';
export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
try {
  const form: IncomingForm = formidable({ 
    multiples: false, 
    keepExtensions: true 
  })
  const fileUpload =  new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject({err})
      } else {
        resolve({fields, files})
      }
    })
  })
  const result = await fileUpload;
  res.statusCode = 200;
  res.json(result);
} catch (error) {
  console.log(error)
  res.send(error)
}
  
  
  
  // res.status(200).json({ name: 'John Doe' })
}


