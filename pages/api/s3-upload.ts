// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable';
import IncomingForm from 'formidable/Formidable';
import { S3Client, PutObjectCommand,  } from "@aws-sdk/client-s3";
import fs from 'fs';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

        const s3Client = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            },
            region: 'us-west-1'
        })
        const form: IncomingForm = formidable({
            multiples: false,
            keepExtensions: true
        })
        const fileUpload = new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files: any) => {
                if (err) {
                    reject(err)
                } else {
                    // console.log(files)
                    const command = new PutObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
                        Key: `${files.img?.newFilename}`,
                        Body: fs.readFileSync(files.img?.filepath)
                    })
                    const response = await s3Client.send(command);
                    //   const uploadRes = await uploadImage(supabase, fs.readFileSync(files.img?.filepath, 'utf8'), `api/${files.img?.newFilename}`)
                    resolve({fileName: `${files.img?.newFilename}`});
                }
            })
        })
        const fileUploadResponse = await fileUpload;
        res.statusCode = 200;
        res.json(fileUploadResponse);
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

