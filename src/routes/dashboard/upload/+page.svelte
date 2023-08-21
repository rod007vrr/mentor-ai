<script lang="ts">
  import AuthCheck from "$lib/components/AuthCheck.svelte";
  import { user, storage, db } from "$lib/firebase";
  import { arrayUnion, doc, updateDoc } from "firebase/firestore";
  import {
    getDownloadURL,
    getMetadata,
    ref,
    uploadBytes,
  } from "firebase/storage";
  import * as PDFJS from "pdfjs-dist";
  PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

  enum UploadState {
    Idle,
    Uploading,
    Complete,
    Error,
  }

  let uploading: UploadState = UploadState.Idle;

  async function upload(e: any) {
    uploading = UploadState.Uploading;

    const file = e.target.files[0];

    const path = `users/${$user!.uid}/files/${file.name}`;

    // Read the text content from the PDF file
    const text = await extractFileText(file);

    //send to backend for uploading to pinecone
    const response = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ text, filename: file.name, uid: $user!.uid }),
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (response.status !== 200) {
      uploading = UploadState.Error;
      return;
    }

    const { filename } = await response.json();
    console.log(`succesfully uploaded ${filename}`);

    //uploading to firebase storage
    const storageRef = ref(storage, `users/${$user!.uid}/files/${file.name}`);
    const result = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(result.ref);

    await updateDoc(doc(db, "users", $user!.uid), {
      files: arrayUnion({ name: file.name, url, path }),
    });

    uploading = UploadState.Complete;
  }

  async function extractFileText(file: any) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      let text = "";

      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await PDFJS.getDocument(typedArray).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();

          for (const item of content.items) {
            // @ts-ignore
            text += item.str;
          }
        }

        resolve(text); // Resolve the Promise with the extracted text
      };

      // Start reading the file
      reader.readAsArrayBuffer(file);
    });
  }
</script>

<h2 class="card-title">Upload a file to your file repository</h2>
<p>The file should be in the form of a pdf with your typed notes</p>

<AuthCheck>
  <form class="max-w-screen-md w-full">
    <div class="form-control w-full max-w-xs my-10 mx-auto text-center">
      <label for="image" class="label">
        <span class="label-text">Pick a file</span>
      </label>
      <input
        on:change={upload}
        name="notesUpload"
        type="file"
        class="file-input file-input-bordered w-full max-w-xs"
        accept="application/pdf"
      />
      {#if uploading == UploadState.Uploading}
        <p>Uploading...</p>
        <progress class="progress progress-info w-56 mt-6" />
      {/if}
      {#if uploading == UploadState.Complete}
        <p>Upload complete!</p>
      {/if}
      {#if uploading == UploadState.Error}
        <p class="bg-red-500">Upload failed</p>
        <p class="bg-red-500">File too large</p>
        <p class="bg-red-500">Please contact support at rod007vrr@gmail.com</p>
      {/if}
    </div>
  </form>
</AuthCheck>
