export default async (_, res): Promise<unknown> => {
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  return res.end();
};
