<script lang="ts">
import { onMount } from 'svelte';
import { gcodeToObject, objectToGcode } from "gcode-json-converter";

 let files: any;
 let fileInput: any;

  async function main() {
    console.debug("mounted app");
    console.log(gcodeToObject, objectToGcode);
    fileInput.addEventListener(
            "change",
            async (evt: Event) => {
              const fileData = await GetFileData(files[0]);
              console.log("fileData:", fileData);
            }
      );
  }

  async function GetFileData(file: File): Promise<string> {
    let p: Promise<string> = new Promise((res, _) => {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent) => {
        let fr: FileReader = e.target;
        res(fr.result as string);
      };
      reader.readAsText(file, "UTF-8");
      });
    return p;
  }


  onMount(main);

</script>

<main>
  <form name="uploadForm">
    <div>
      <input bind:this={fileInput} type="file" bind:files={files} />
    </div>
  </form>
</main>

<style>
</style>
