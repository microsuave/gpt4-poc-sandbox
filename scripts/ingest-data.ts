import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
// import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

// import fs from 'fs'
// import { splitIntoPages } from '@/utils/pdfSplit';

/* Name of directory to retrieve your files from */
const filePath = 'docs';
// const folderPath = 'docs';

export const run = async () => {

  try {
    /*load raw docs from the all files in the directory */
    // Si el proceso lee the un folder o intake, deberia remover los archivos despues de haberlos processado
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
    });

    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();

    // PINECONE_INDEX_NAME debe ser una variable de entorno, lo mismo debe ser para PINECONE_NAME_SPACE   
    // ahora mismo use export PINECONE_INDEX_NAME=[el nombre de el index]
    const index = pinecone.Index(PINECONE_INDEX_NAME); 

    //embed the PDF documents

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

// export const main = async () => {

// fs.readdir(folderPath, (err, files) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   files.forEach(async (file) => {
//     console.log(file)
//     //await splitIntoPages(`${folderPath}/${file}`)
//     await run()
//   });
// });
// }


(async () => {
  await run();
  console.log('ingestion complete');
})();
