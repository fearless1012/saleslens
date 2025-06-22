import dotenv from "dotenv";
console.log("Loading environment variables...");
dotenv.config();

export async function generatePresentations(prompt: string): Promise<any> {
  const response = await (globalThis.fetch ?? (await import('node-fetch')).default)("https://api.slidesgpt.com/v1/presentations/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.slideapi}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });
  return response.json();
}

export async function downloadPresentation(id: string): Promise<any> {
  const response = await (globalThis.fetch ?? (await import('node-fetch')).default)(`https://api.slidesgpt.com/v1/presentations/${id}/download`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.slideapi}`,
      "Content-Type": "application/json"
    } 
  });
  
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'downloaded.pptx');
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
}

export async function urlPresentation(id: string): Promise<any> {
  const response = await (globalThis.fetch ?? (await import('node-fetch')).default)(`https://api.slidesgpt.com/v1/presentations/${id}/embed`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.slideapi}`,
            "Content-Type": "application/json"
        },
        "redirect": "manual" // Prevent automatic redirection
      });
  return response.json();
}

if (require.main === module) {
  (async () => {
    console.log("Generating presentation...");
    // const result = await generatePresentations("Introduction to llama api");
    const result = {id: "XL27aLWQOlwfpIMdQbmo", download: true, embed: true}; // Mocked result for testing
    console.log(result.id);

    // if (result.embed){
    //   const embedResponse = await urlPresentation(result.id);
    //   // console.log("Embed response status:", embedResponse);
    //   const redirectUrl = embedResponse.headers.get("location");
    //   console.log("Redirect URL:", redirectUrl);
    // }
    if (result.download) {
        console.log("Downloading presentation...");
        const downloadResult = await downloadPresentation(result.id);
        // console.log("Download result:", downloadResult);
        // save the downloadResult to a file called downloaded.pptx in this dir
    }
  })();
}