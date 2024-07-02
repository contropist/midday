const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

export const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS!, "base64").toString(
    "ascii"
  )
);

export const GoogleDocumentClient = new DocumentProcessorServiceClient({
  apiEndpoint: "eu-documentai.googleapis.com",
  credentials,
});
