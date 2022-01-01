// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand,  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        const fileName = req.body.fileName;
        const s3Client = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            },
            region: 'us-west-1'
        })
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME || '',
            Key: `cutout-${fileName}`,
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.statusCode = 200;
        res.json(url);
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

