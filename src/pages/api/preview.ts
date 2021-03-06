import { NextApiRequest, NextApiResponse } from 'next';

import Prismic from '@prismicio/client';

import { DefaultClient } from '@prismicio/client/types/client';
import { Document } from '@prismicio/client/types/documents';

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT;
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

function linkResolver(doc: Document): string {
  if (doc.type === 'post') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

type CreateClientOptionsReturn = {
  req?: any;
  accessToken?: any;
};

const createClientOptions = (
  req = null,
  prismicAccessToken = null
): CreateClientOptionsReturn => {
  const reqOption = req ? { req } : {};

  const accessTokenOption = prismicAccessToken
    ? { accessToken: prismicAccessToken }
    : {};

  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

const Client = (req = null): DefaultClient =>
  Prismic.client(apiEndpoint, createClientOptions(req, accessToken));

export default async function Preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { token: ref, documentId } = req.query;

  const redirectUrl = await Client(req)
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}` });
  res.end();
}
