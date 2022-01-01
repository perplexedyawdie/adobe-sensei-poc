// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
interface CutoutParams {
    input: {
        storage: string;
        href: string;
    },
    output: {
        storage: string;
        href: string;
        mask: {
            format: string;
        }
    }
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        const apiKey = process.env.ADOBE_API_KEY || '';
        const accessToken = process.env.ADOBE_ACCESS_TOKEN || '';
        const getUrl = req.body.getUrl;
        const postUrl = req.body.postUrl;
        const adobeCutoutAPI = 'https://image.adobe.io/sensei/cutout';
        const cutoutParams: CutoutParams = {
            input: {
                storage: 'external',
                href: `${getUrl}`
            },
            output: {
                storage: 'external',
                href: `${postUrl}`,
                mask: {
                    format: 'soft'
                }
            }
        }
        const { data } = await axios.post(adobeCutoutAPI, cutoutParams, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        })
        res.statusCode = 200;
        res.json(data);
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

